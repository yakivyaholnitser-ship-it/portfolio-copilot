import type { DecisionResult } from "@/types/decision";
import type { FundamentalAdvisor, FundamentalsData } from "@/types/fundamentals";
import type { IntelligenceResponse } from "@/types/intelligence";
import type { PortfolioResponse } from "@/types/portfolio";

export type AdvisorCategory =
  | "market"
  | "news"
  | "analyst"
  | "insider"
  | "earnings"
  | "fundamental"
  | "portfolio"
  | "opportunity";

export type AdvisorSignal =
  | "positive"
  | "neutral"
  | "caution"
  | "review"
  | "unavailable";

export interface Advisor {
  readonly id: string;
  readonly title: string;
  readonly category: AdvisorCategory;
  readonly signal: AdvisorSignal;
  readonly confidence: number;
  readonly importance: number;
  readonly summary: string;
  readonly reasoning: readonly string[];
  readonly dataSources: readonly string[];
  readonly freshness: string;
}

export interface AdvisorContext {
  readonly portfolio: PortfolioResponse;
  readonly decision: DecisionResult;
  readonly intelligence: IntelligenceResponse;
  readonly fundamentals: FundamentalsData;
  readonly fundamentalAdvisor: FundamentalAdvisor;
}

export interface AdvisorsResponse extends AdvisorContext {
  readonly advisors: readonly Advisor[];
}
