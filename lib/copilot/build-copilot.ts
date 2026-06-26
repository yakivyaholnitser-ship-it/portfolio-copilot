import { scoreStock } from "@/lib/decision/score-stock";
import type {
  ActionAnswer,
  ActionRecommendation,
  CopilotResponse,
  InvestmentBrain,
  MorningBrief,
  MorningBriefBrains,
} from "@/types/copilot";
import type { DecisionResult } from "@/types/decision";
import type { PortfolioResponse } from "@/types/portfolio";
import type { Quote } from "@/types/quote";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, digits = 1) {
  return Number(value.toFixed(digits));
}

function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}

function formatPercent(value: number) {
  const rounded = Math.abs(value) < 0.05 ? 0 : value;

  return `${rounded > 0 ? "+" : ""}${rounded.toFixed(1)}%`;
}

function confidenceFromImportance(importance: number) {
  return Math.round(clamp(importance, 0, 100));
}

function createBrain(
  kind: InvestmentBrain["kind"],
  headline: string,
  summary: string,
  importance: number,
  confidence = confidenceFromImportance(importance),
): InvestmentBrain {
  return {
    kind,
    headline,
    summary,
    importance: Math.round(clamp(importance, 0, 100)),
    confidence: Math.round(clamp(confidence, 0, 100)),
  };
}

function MarketBrain(quote: Quote): InvestmentBrain {
  const spread = quote.wsLikePrice - quote.marketPrice;
  const spreadPercent = quote.marketPrice === 0 ? 0 : (spread / quote.marketPrice) * 100;
  const absoluteMove = Math.abs(quote.todayChangePercent);
  const direction =
    quote.todayChangePercent > 1
      ? "positive"
      : quote.todayChangePercent < -1
        ? "negative"
        : "muted";

  return createBrain(
    "market",
    `Market move is ${direction} today.`,
    `STX is ${formatPercent(quote.todayChangePercent)} today. Reference price is ${formatCurrency(quote.wsLikePrice)} versus market price ${formatCurrency(quote.marketPrice)}, a ${formatPercent(spreadPercent)} spread in the ${quote.session} session.`,
    clamp(45 + absoluteMove * 8, 35, 90),
    quote.session === "regular" ? 86 : 72,
  );
}

function PortfolioBrain(portfolio: PortfolioResponse): InvestmentBrain {
  const position = portfolio.positions[0];

  if (!position) {
    return createBrain(
      "portfolio",
      "No configured position is available.",
      "Portfolio impact cannot be evaluated until a position is configured.",
      20,
      90,
    );
  }

  const headline = position.isPositive
    ? `${portfolio.displayName}'s position has a strong unrealized gain.`
    : `${portfolio.displayName}'s position is still below entry.`;
  const summary = position.isPositive
    ? `${portfolio.displayName} is up ${formatPercent(position.gainPercent)} from a ${formatCurrency(position.bought)} entry.`
    : `${portfolio.displayName} is down ${Math.abs(position.gainPercent).toFixed(1)}% from a ${formatCurrency(position.bought)} entry.`;

  return createBrain(
    "portfolio",
    headline,
    summary,
    clamp(45 + Math.abs(position.gainPercent), 40, 95),
    90,
  );
}

function RiskBrain(quote: Quote): InvestmentBrain {
  const absoluteMove = Math.abs(quote.todayChangePercent);
  const sessionRisk =
    quote.session === "regular"
      ? "regular session pricing is clearer"
      : `${quote.session} session pricing can be less reliable`;
  const headline =
    absoluteMove >= 5
      ? "Risk is elevated because the daily move is large."
      : "Risk is moderate and mostly tied to session context.";

  return createBrain(
    "risk",
    headline,
    `Absolute daily move is ${absoluteMove.toFixed(1)}%, and ${sessionRisk}.`,
    clamp(35 + absoluteMove * 10 + (quote.session === "regular" ? 0 : 12), 25, 95),
    quote.session === "regular" ? 82 : 70,
  );
}

function OpportunityBrain(
  portfolio: PortfolioResponse,
  decision: DecisionResult,
): InvestmentBrain {
  const position = portfolio.positions[0];
  const hasLargeGain = Boolean(position && position.gainPercent >= 50);
  const hasBelowEntryPosition = Boolean(position && position.gainPercent < 0);

  if (hasLargeGain && decision.totalScore >= 70) {
    return createBrain(
      "opportunity",
      "Opportunity is to review gains before concentration grows.",
      "Strong momentum and a large unrealized gain create a useful moment to review target allocation.",
      86,
      78,
    );
  }

  if (hasBelowEntryPosition && decision.factorScores.momentum >= 7) {
    return createBrain(
      "opportunity",
      "Opportunity is to reassess the thesis without rushing.",
      "Momentum improved while the position remains below entry, so the useful action is review, not reaction.",
      68,
      74,
    );
  }

  return createBrain(
    "opportunity",
    "Opportunity is limited today.",
    "The current setup does not create a strong new opportunity signal.",
    45,
    72,
  );
}

function CalendarBrain(quote: Quote): InvestmentBrain {
  const isClosed = quote.session === "closed";

  return createBrain(
    "calendar",
    isClosed ? "No market-hours event is active right now." : "Market session is active.",
    isClosed
      ? "No scheduled events are configured yet. Next useful check is the next market session."
      : "No scheduled events are configured yet. Watch session liquidity and price confirmation.",
    isClosed ? 35 : 50,
    65,
  );
}

function getUserAction(answer: ActionAnswer, portfolio: PortfolioResponse) {
  const position = portfolio.positions[0];

  if (!position) {
    return "No configured position.";
  }

  if (answer === "Consider trimming" && position.gainPercent > 50) {
    return "Large gain; review target and concentration.";
  }

  if (answer === "Caution" && !position.isPositive) {
    return "Below entry; avoid reacting to one daily move.";
  }

  if (answer === "Review") {
    return position.isPositive
      ? "Positive position; review target calmly."
      : "Below entry; review risk before changing anything.";
  }

  return "No immediate action suggested.";
}

function createTodaysDecision(
  portfolio: PortfolioResponse,
  decision: DecisionResult,
  brains: MorningBriefBrains,
): ActionRecommendation {
  const position = portfolio.positions[0];
  const dailyMove = Math.abs(portfolio.quote.todayChangePercent);
  const hasLargeWinner = Boolean(position && position.gainPercent >= 50);
  const hasMeaningfulLoser = Boolean(position && position.gainPercent <= -10);
  const answer: ActionAnswer =
    decision.signal === "Caution" || brains.risk.importance >= 85 || dailyMove >= 5
      ? "Caution"
      : hasLargeWinner && decision.totalScore >= 70
        ? "Consider trimming"
        : hasMeaningfulLoser || decision.totalScore < 70
          ? "Review"
          : "No action";
  const reason =
    answer === "Consider trimming"
      ? "The strongest signal is a large unrealized gain with a favorable decision score."
      : answer === "Caution"
        ? "Risk is high enough that the next decision should be slower and more deliberate."
        : answer === "Review"
          ? "The setup is mixed enough to review the position without rushing."
          : "The market, portfolio, and risk brains do not suggest immediate action.";

  return {
    answer,
    confidence: Math.round(clamp(decision.totalScore, 0, 100)),
    reason,
    userAction: getUserAction(answer, portfolio),
  };
}

function estimateReadingTime(textParts: readonly string[]) {
  const words = textParts
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 180));

  return `${minutes} min`;
}

function BriefEngine(
  portfolio: PortfolioResponse,
  decision: DecisionResult,
  brains: MorningBriefBrains,
): MorningBrief {
  const todaysDecision = createTodaysDecision(portfolio, decision, brains);
  const whatChangedOvernight = {
    headline: brains.market.headline,
    bullets: [
      brains.market.summary,
      brains.portfolio.summary,
      brains.risk.summary,
    ],
  };
  const upcomingEvents = [brains.calendar.summary];
  const textParts = [
    todaysDecision.reason,
    brains.market.summary,
    brains.portfolio.summary,
    brains.risk.summary,
    brains.opportunity.summary,
    brains.calendar.summary,
  ];

  return {
    todaysDecision,
    why: `${brains.market.headline} ${brains.portfolio.headline} ${decision.explanation}`,
    biggestOpportunity: brains.opportunity.headline,
    biggestRisk: brains.risk.headline,
    whatChangedOvernight,
    upcomingEvents,
    estimatedReadingTime: estimateReadingTime(textParts),
    brains,
  };
}

export function buildCopilotResponse(portfolio: PortfolioResponse): CopilotResponse {
  const decision = scoreStock({
    quote: portfolio.quote,
    positions: portfolio.positions,
  });
  const brains: MorningBriefBrains = {
    market: MarketBrain(portfolio.quote),
    portfolio: PortfolioBrain(portfolio),
    risk: RiskBrain(portfolio.quote),
    opportunity: OpportunityBrain(portfolio, decision),
    calendar: CalendarBrain(portfolio.quote),
  };

  return {
    userId: portfolio.userId,
    displayName: portfolio.displayName,
    symbol: portfolio.symbol,
    quote: portfolio.quote,
    positions: portfolio.positions,
    decision,
    morningBrief: BriefEngine(portfolio, decision, brains),
    disclaimer: "Not financial advice.",
  };
}
