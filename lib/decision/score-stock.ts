import type {
  DecisionFactorScores,
  DecisionInput,
  DecisionResult,
  DecisionSignal,
} from "@/types/decision";
import type { Quote } from "@/types/quote";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundScore(value: number) {
  return Number(value.toFixed(1));
}

function scoreMomentum(todayChangePercent: number) {
  return roundScore(clamp(5 + todayChangePercent, 0, 10));
}

function scorePositionPl(positions: DecisionInput["positions"]) {
  const averageGain =
    positions.reduce((sum, position) => sum + position.gainPercent, 0) /
    positions.length;

  return roundScore(clamp(5 + averageGain / 10, 0, 10));
}

function scoreVolatility(todayChangePercent: number) {
  const absoluteMove = Math.abs(todayChangePercent);

  return roundScore(clamp(10 - absoluteMove * 1.5, 0, 10));
}

function scoreSession(session: Quote["session"]) {
  const scores: Record<Quote["session"], number> = {
    regular: 10,
    pre: 7,
    post: 6,
    closed: 5,
    unknown: 4,
  };

  return scores[session];
}

function signalFromScore(totalScore: number): DecisionSignal {
  if (totalScore >= 70) {
    return "Bullish";
  }

  if (totalScore < 45) {
    return "Caution";
  }

  return "Hold";
}

function createDeterministicExplanation(
  signal: DecisionSignal,
  factorScores: DecisionFactorScores,
) {
  return [
    `${signal} score from independent momentum, position P/L, volatility, and session factors.`,
    `Momentum ${factorScores.momentum}/10, position P/L ${factorScores.positionPl}/10, volatility ${factorScores.volatility}/10, session ${factorScores.session}/10.`,
  ].join(" ");
}

export function scoreStock(input: DecisionInput): DecisionResult {
  const factorScores: DecisionFactorScores = {
    momentum: scoreMomentum(input.quote.todayChangePercent),
    positionPl: scorePositionPl(input.positions),
    volatility: scoreVolatility(input.quote.todayChangePercent),
    session: scoreSession(input.quote.session),
  };
  const factorTotal =
    factorScores.momentum +
    factorScores.positionPl +
    factorScores.volatility +
    factorScores.session;
  const totalScore = Math.round((factorTotal / 40) * 100);
  const signal = signalFromScore(totalScore);

  return {
    totalScore,
    signal,
    factorScores,
    explanation: createDeterministicExplanation(signal, factorScores),
  };
}
