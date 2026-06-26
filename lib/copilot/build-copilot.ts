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
import type { IntelligenceResponse } from "@/types/intelligence";
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

function shorten(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trim()}...`;
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

function MarketBrain(
  quote: Quote,
  intelligence: IntelligenceResponse,
): InvestmentBrain {
  const spread = quote.wsLikePrice - quote.marketPrice;
  const spreadPercent = quote.marketPrice === 0 ? 0 : (spread / quote.marketPrice) * 100;
  const absoluteMove = Math.abs(quote.todayChangePercent);
  const direction =
    quote.todayChangePercent > 1
      ? "positive"
      : quote.todayChangePercent < -1
        ? "negative"
        : "muted";
  const topNews = intelligence.news[0];
  const newsSentence = topNews ? ` Latest news: ${shorten(topNews.headline, 96)}.` : "";

  return createBrain(
    "market",
    topNews ? `Market move is ${direction}; news may be relevant.` : `Market move is ${direction} today.`,
    `${quote.symbol} is ${formatPercent(quote.todayChangePercent)} today.${newsSentence} Reference and market prices are nearly aligned in the ${quote.session} session.`,
    clamp(45 + absoluteMove * 8 + (topNews ? 8 : 0), 35, 94),
    topNews ? 78 : quote.session === "regular" ? 86 : 72,
  );
}

function AnalystBrain(intelligence: IntelligenceResponse): InvestmentBrain {
  const latestTrend = intelligence.analystRecommendations[0];

  if (!latestTrend) {
    return createBrain(
      "analyst",
      "No analyst recommendation trend is available.",
      "Finnhub did not return a current recommendation trend for this symbol.",
      25,
      intelligence.sources.finnhub.status === "available" ? 70 : 45,
    );
  }

  const positive = latestTrend.strongBuy + latestTrend.buy;
  const negative = latestTrend.sell + latestTrend.strongSell;
  const countSummary = `${positive} Buy / ${latestTrend.hold} Hold / ${negative} Sell`;
  const headline =
    positive > negative + latestTrend.hold
      ? "Analyst trend leans positive."
      : negative > positive
        ? "Analyst trend shows caution."
        : "Analyst trend is mixed or neutral.";
  const interpretation =
    positive > negative + latestTrend.hold
      ? "Analyst consensus remains strongly positive."
      : negative > positive
        ? "Analyst consensus has a cautious tilt."
        : "Analyst consensus looks balanced.";

  return createBrain(
    "analyst",
    headline,
    `${interpretation} ${countSummary}.`,
    clamp(35 + Math.abs(positive - negative) * 8, 35, 85),
    72,
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

function RiskBrain(
  quote: Quote,
  intelligence: IntelligenceResponse,
): InvestmentBrain {
  const absoluteMove = Math.abs(quote.todayChangePercent);
  const recentInsider = intelligence.insiders[0];
  const sessionRisk =
    quote.session === "regular"
      ? "regular session pricing is clearer"
      : `${quote.session} session pricing can be less reliable`;
  const headline =
    recentInsider
      ? "Risk includes recent insider activity."
      : absoluteMove >= 5
        ? "Risk is elevated because the daily move is large."
        : "Risk is moderate and mostly tied to session context.";
  const insiderSentence = recentInsider
    ? " Recent insider selling deserves monitoring, but it is not automatically bearish."
    : "";

  return createBrain(
    "risk",
    headline,
    `Absolute daily move is ${absoluteMove.toFixed(1)}%, and ${sessionRisk}.${insiderSentence}`,
    clamp(35 + absoluteMove * 10 + (quote.session === "regular" ? 0 : 12) + (recentInsider ? 8 : 0), 25, 95),
    recentInsider ? 76 : quote.session === "regular" ? 82 : 70,
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
      "Review your target or partial-profit rules.",
      "A gain above 100% makes target and partial-profit rules worth reviewing.",
      86,
      78,
    );
  }

  if (hasBelowEntryPosition && decision.factorScores.momentum >= 7) {
    return createBrain(
      "opportunity",
      "Track break-even and avoid reacting to one-day moves.",
      "Momentum improved while the position remains below entry, so break-even is the useful reference point.",
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

function CalendarBrainWithIntelligence(
  quote: Quote,
  intelligence: IntelligenceResponse,
): InvestmentBrain {
  const isClosed = quote.session === "closed";
  const nextEarnings = intelligence.earnings[0];

  if (nextEarnings) {
    return createBrain(
      "calendar",
      `Upcoming earnings event on ${nextEarnings.date}.`,
      `Finnhub calendar shows ${nextEarnings.symbol} earnings on ${nextEarnings.date}. EPS estimate: ${nextEarnings.epsEstimate ?? "unknown"}.`,
      82,
      74,
    );
  }

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
    return "Review the position, but no immediate trade is suggested.";
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
  const riskIsElevated = brains.risk.importance >= 85 || dailyMove >= 5;
  let answer: ActionAnswer = "No action";
  let reason = "The market, portfolio, and risk brains do not suggest immediate action.";

  if (riskIsElevated) {
    answer = "Review";
    reason = "Risk is elevated, but the brief does not suggest an immediate trade.";
  } else if (decision.signal === "Caution") {
    answer = "Caution";
    reason = "Risk is high enough that the next decision should be slower and more deliberate.";
  } else if (hasLargeWinner && decision.totalScore >= 70) {
    answer = "Consider trimming";
    reason = "The strongest signal is a large unrealized gain with a favorable decision score.";
  } else if (hasMeaningfulLoser || decision.totalScore < 70) {
    answer = "Review";
    reason = "The setup is mixed enough to review the position without rushing.";
  }

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
  const position = portfolio.positions[0];
  const topNews = brains.market.summary.includes("Latest news")
    ? brains.market.summary.match(/Latest news: (.*)\. Reference/)?.[1]
    : null;
  const insider = brains.risk.summary.includes("insider selling")
    ? "Insider activity was detected recently."
    : null;
  const whatChangedOvernight = {
    headline: brains.market.headline,
    bullets: [
      `${portfolio.symbol} ${portfolio.quote.todayChangePercent >= 0 ? "rose" : "fell"} ${formatPercent(portfolio.quote.todayChangePercent)} today.`,
      ...(topNews ? [`Latest news: ${shorten(topNews, 78)}.`] : []),
      brains.analyst.kind === "analyst" ? brains.analyst.summary : "",
      insider ??
        (position
          ? `${portfolio.displayName} is ${position.isPositive ? "above" : "below"} entry.`
          : "Position data is unavailable."),
    ].filter(Boolean).slice(0, 4),
  };
  const upcomingEvents = [brains.calendar.summary];
  const textParts = [
    todaysDecision.reason,
    brains.market.summary,
    brains.analyst.summary,
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

export function buildCopilotResponse(
  portfolio: PortfolioResponse,
  intelligence: IntelligenceResponse,
): CopilotResponse {
  const decision = scoreStock({
    quote: portfolio.quote,
    positions: portfolio.positions,
  });
  const brains: MorningBriefBrains = {
    market: MarketBrain(portfolio.quote, intelligence),
    analyst: AnalystBrain(intelligence),
    portfolio: PortfolioBrain(portfolio),
    risk: RiskBrain(portfolio.quote, intelligence),
    opportunity: OpportunityBrain(portfolio, decision),
    calendar: CalendarBrainWithIntelligence(portfolio.quote, intelligence),
  };

  return {
    userId: portfolio.userId,
    displayName: portfolio.displayName,
    symbol: portfolio.symbol,
    quote: portfolio.quote,
    positions: portfolio.positions,
    decision,
    intelligence,
    morningBrief: BriefEngine(portfolio, decision, brains),
    disclaimer: "Not financial advice.",
  };
}
