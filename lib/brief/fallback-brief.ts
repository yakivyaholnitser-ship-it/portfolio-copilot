import type { BriefInput, PortfolioBrief } from "@/types/brief";

function clampConfidence(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function createFallbackBrief(input: BriefInput): PortfolioBrief {
  const averageGain =
    input.positions.reduce((sum, position) => sum + position.gainPercent, 0) /
    input.positions.length;
  const signal =
    input.todayChangePercent > 2 && averageGain > 0
      ? "Bullish"
      : input.todayChangePercent < -2 || averageGain < -10
        ? "Caution"
        : "Hold";
  const confidence = clampConfidence(55 + Math.abs(input.todayChangePercent) * 4);

  return {
    signal,
    confidence,
    summary: createSummary(signal, input.todayChangePercent, averageGain),
    yakivNote: createOwnerNote(input, "Yakiv"),
    anastasiiaNote: createOwnerNote(input, "Anastasiia"),
  };
}

function createSummary(
  signal: PortfolioBrief["signal"],
  todayChangePercent: number,
  averageGain: number,
) {
  if (signal === "Bullish") {
    return "Momentum is positive, but the position is already near recent highs.";
  }

  if (signal === "Caution") {
    return todayChangePercent < -2
      ? "Momentum has weakened, so patience matters more than reacting today."
      : "Gains are uneven, so keep the review focused on risk and targets.";
  }

  return averageGain > 0
    ? "The setup is constructive, but the move does not demand urgency."
    : "Price action is mixed, so the brief favors patience over reaction.";
}

function createOwnerNote(input: BriefInput, owner: string) {
  const position = input.positions.find((item) => item.owner === owner);

  if (!position) {
    return `${owner} has no configured position.`;
  }

  if (position.gainPercent >= 50) {
    return "Strong unrealized gain; consider reviewing your target.";
  }

  if (position.gainPercent >= 0) {
    return "Position is positive; review target and risk calmly.";
  }

  return "Still below entry; avoid reacting to one daily move.";
}
