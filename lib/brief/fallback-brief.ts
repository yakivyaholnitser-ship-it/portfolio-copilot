import type { BriefInput, PortfolioBrief } from "@/types/brief";
import type { DecisionResult } from "@/types/decision";

function clampConfidence(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function createFallbackBrief(
  input: BriefInput,
  decision: DecisionResult,
): PortfolioBrief {
  return {
    signal: decision.signal,
    confidence: clampConfidence(decision.totalScore),
    summary: createSummary(decision.signal, decision.factorScores),
    userNote: createOwnerNote(input),
  };
}

function createSummary(
  signal: PortfolioBrief["signal"],
  factorScores: DecisionResult["factorScores"],
) {
  if (signal === "Bullish") {
    return "Momentum is positive, but the position is already near recent highs.";
  }

  if (signal === "Caution") {
    return factorScores.momentum < 4
      ? "Momentum has weakened, so patience matters more than reacting today."
      : "Gains are uneven, so keep the review focused on risk and targets.";
  }

  return factorScores.positionPl >= 5
    ? "The setup is constructive, but the move does not demand urgency."
    : "Price action is mixed, so the brief favors patience over reaction.";
}

function createOwnerNote(input: BriefInput) {
  const position = input.positions[0];

  if (!position) {
    return `${input.displayName} has no configured position.`;
  }

  if (position.gainPercent >= 50) {
    return "Strong unrealized gain; consider reviewing your target.";
  }

  if (position.gainPercent >= 0) {
    return "Position is positive; review target and risk calmly.";
  }

  return "Still below entry; avoid reacting to one daily move.";
}
