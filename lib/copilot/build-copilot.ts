import { scoreStock } from "@/lib/decision/score-stock";
import type {
  ActionAnswer,
  ActionRecommendation,
  CopilotBrains,
  CopilotResponse,
  DailyChangeSummary,
  InvestmentBrain,
  PositionBrain,
} from "@/types/copilot";
import type { DecisionResult } from "@/types/decision";
import type { PortfolioResponse } from "@/types/portfolio";
import type { Quote } from "@/types/quote";

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

function scoreToConfidence(score: number) {
  return Math.min(100, Math.max(0, Math.round(score)));
}

function createMarketBrain(quote: Quote): InvestmentBrain {
  const spread = quote.wsLikePrice - quote.marketPrice;
  const spreadPercent = quote.marketPrice === 0 ? 0 : (spread / quote.marketPrice) * 100;
  const score = Math.min(10, Math.max(0, 5 + quote.todayChangePercent));
  const direction =
    quote.todayChangePercent > 1
      ? "positive"
      : quote.todayChangePercent < -1
        ? "negative"
        : "muted";

  return {
    kind: "market",
    headline: `Market move is ${direction} today.`,
    observations: [
      `Today change is ${formatPercent(quote.todayChangePercent)}.`,
      `Reference price is ${formatCurrency(quote.wsLikePrice)} versus market price ${formatCurrency(quote.marketPrice)}.`,
      `Reference spread is ${formatPercent(spreadPercent)} from market price.`,
      `Current session is ${quote.session}.`,
    ],
    score: round(score),
  };
}

function createPositionBrain(portfolio: PortfolioResponse): PositionBrain {
  const ownerNotes = portfolio.positions.map((position) => ({
    owner: position.owner,
    note: position.isPositive
      ? `${position.owner} has an unrealized gain of ${formatPercent(position.gainPercent)}.`
      : `${position.owner} remains below entry by ${Math.abs(position.gainPercent).toFixed(1)}%.`,
  }));
  const averageGain =
    portfolio.positions.reduce((sum, position) => sum + position.gainPercent, 0) /
    portfolio.positions.length;
  const score = Math.min(10, Math.max(0, 5 + averageGain / 10));

  return {
    kind: "position",
    headline:
      averageGain >= 0
        ? `${portfolio.displayName}'s position P/L is constructive.`
        : `${portfolio.displayName}'s position P/L is under pressure.`,
    observations: ownerNotes.map((item) => item.note),
    ownerNotes,
    score: round(score),
  };
}

function createRiskBrain(quote: Quote): InvestmentBrain {
  const dailyMove = Math.abs(quote.todayChangePercent);
  const volatilityScore = Math.min(10, Math.max(0, 10 - dailyMove * 1.5));
  const sessionRisk =
    quote.session === "regular"
      ? "regular session liquidity is clearer"
      : `${quote.session} session pricing can be less reliable`;

  return {
    kind: "risk",
    headline:
      dailyMove >= 4
        ? "Daily volatility is elevated."
        : "Daily volatility looks manageable.",
    observations: [
      `Absolute daily move is ${dailyMove.toFixed(1)}%.`,
      `Session risk note: ${sessionRisk}.`,
    ],
    score: round(volatilityScore),
  };
}

function createDecisionBrain(decision: DecisionResult): InvestmentBrain {
  return {
    kind: "decision",
    headline: `${decision.signal} from deterministic decision scoring.`,
    observations: [
      `Total score is ${decision.totalScore}/100.`,
      `Momentum ${decision.factorScores.momentum}/10, position P/L ${decision.factorScores.positionPl}/10.`,
      `Volatility ${decision.factorScores.volatility}/10, session ${decision.factorScores.session}/10.`,
    ],
    score: round(decision.totalScore / 10),
  };
}

function createDailyChangeSummary(
  portfolio: PortfolioResponse,
  brains: CopilotBrains,
): DailyChangeSummary {
  return {
    headline: brains.market.headline,
    bullets: [
      brains.market.observations[0],
      brains.market.observations[1],
      brains.position.headline,
      brains.risk.headline,
    ],
  };
}

function getUserAction(
  answer: ActionAnswer,
  portfolio: PortfolioResponse,
) {
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

function createActionRecommendation(
  portfolio: PortfolioResponse,
  decision: DecisionResult,
): ActionRecommendation {
  const hasLargeWinner = portfolio.positions.some(
    (position) => position.gainPercent >= 50,
  );
  const hasMeaningfulLoser = portfolio.positions.some(
    (position) => position.gainPercent <= -10,
  );
  const dailyMove = Math.abs(portfolio.quote.todayChangePercent);
  const answer: ActionAnswer =
    decision.signal === "Caution" || dailyMove >= 5
      ? "Caution"
      : hasLargeWinner && decision.totalScore >= 70
        ? "Consider trimming"
        : hasMeaningfulLoser || decision.totalScore < 70
          ? "Review"
          : "No action";
  const reason =
    answer === "Consider trimming"
      ? "Decision score is strong, but at least one position has a large unrealized gain."
      : answer === "Caution"
        ? "Risk is elevated because the daily move or decision score needs caution."
        : answer === "Review"
          ? "The setup is mixed enough to review targets and risk without rushing."
          : "The decision score and risk factors do not suggest immediate action.";

  return {
    answer,
    confidence: scoreToConfidence(decision.totalScore),
    reason,
    userAction: getUserAction(answer, portfolio),
  };
}

export function buildCopilotResponse(portfolio: PortfolioResponse): CopilotResponse {
  const decision = scoreStock({
    quote: portfolio.quote,
    positions: portfolio.positions,
  });
  const brains: CopilotBrains = {
    market: createMarketBrain(portfolio.quote),
    position: createPositionBrain(portfolio),
    risk: createRiskBrain(portfolio.quote),
    decision: createDecisionBrain(decision),
  };

  return {
    userId: portfolio.userId,
    displayName: portfolio.displayName,
    symbol: portfolio.symbol,
    quote: portfolio.quote,
    positions: portfolio.positions,
    decision,
    brains,
    questions: {
      whatChangedToday: createDailyChangeSummary(portfolio, brains),
      shouldIDoAnything: createActionRecommendation(portfolio, decision),
    },
    disclaimer: "Not financial advice.",
  };
}
