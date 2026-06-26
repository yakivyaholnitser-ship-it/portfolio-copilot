import type { DecisionResult } from "@/types/decision";
import type { PortfolioPosition } from "@/types/portfolio";
import type { Quote } from "@/types/quote";

export type InvestmentBrainKind = "market" | "position" | "risk" | "decision";

export interface InvestmentBrain {
  readonly kind: InvestmentBrainKind;
  readonly headline: string;
  readonly observations: readonly string[];
  readonly score: number;
}

export interface PositionBrain extends InvestmentBrain {
  readonly ownerNotes: readonly {
    readonly owner: string;
    readonly note: string;
  }[];
}

export interface DailyChangeSummary {
  readonly headline: string;
  readonly bullets: readonly string[];
}

export type ActionAnswer =
  | "No action"
  | "Review"
  | "Consider trimming"
  | "Caution";

export interface ActionRecommendation {
  readonly answer: ActionAnswer;
  readonly confidence: number;
  readonly reason: string;
  readonly yakivAction: string;
  readonly anastasiiaAction: string;
}

export interface CopilotBrains {
  readonly market: InvestmentBrain;
  readonly position: PositionBrain;
  readonly risk: InvestmentBrain;
  readonly decision: InvestmentBrain;
}

export interface CopilotQuestions {
  readonly whatChangedToday: DailyChangeSummary;
  readonly shouldIDoAnything: ActionRecommendation;
}

export interface CopilotResponse {
  readonly symbol: string;
  readonly quote: Quote;
  readonly positions: readonly PortfolioPosition[];
  readonly decision: DecisionResult;
  readonly brains: CopilotBrains;
  readonly questions: CopilotQuestions;
  readonly disclaimer: "Not financial advice.";
}
