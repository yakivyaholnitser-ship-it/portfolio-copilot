import type { PortfolioPosition } from "@/types/portfolio";
import type { Quote } from "@/types/quote";

export type DecisionSignal = "Bullish" | "Hold" | "Caution";

export interface DecisionFactorScores {
  readonly momentum: number;
  readonly positionPl: number;
  readonly volatility: number;
  readonly session: number;
}

export interface DecisionInput {
  readonly quote: Quote;
  readonly positions: readonly PortfolioPosition[];
}

export interface DecisionResult {
  readonly totalScore: number;
  readonly signal: DecisionSignal;
  readonly factorScores: DecisionFactorScores;
  readonly explanation: string;
}
