import type { DecisionResult } from "@/types/decision";
import type { IntelligenceResponse } from "@/types/intelligence";
import type { PortfolioPosition } from "@/types/portfolio";
import type { Quote } from "@/types/quote";

export type InvestmentBrainKind =
  | "market"
  | "analyst"
  | "portfolio"
  | "risk"
  | "opportunity"
  | "calendar";

export interface InvestmentBrain {
  readonly kind: InvestmentBrainKind;
  readonly headline: string;
  readonly summary: string;
  readonly importance: number;
  readonly confidence: number;
}

export interface WhatChangedOvernight {
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
  readonly userAction: string;
}

export interface MorningBriefBrains {
  readonly market: InvestmentBrain;
  readonly analyst: InvestmentBrain;
  readonly portfolio: InvestmentBrain;
  readonly risk: InvestmentBrain;
  readonly opportunity: InvestmentBrain;
  readonly calendar: InvestmentBrain;
}

export interface MorningBrief {
  readonly todaysDecision: ActionRecommendation;
  readonly why: string;
  readonly biggestOpportunity: string;
  readonly biggestRisk: string;
  readonly whatChangedOvernight: WhatChangedOvernight;
  readonly upcomingEvents: readonly string[];
  readonly estimatedReadingTime: string;
  readonly brains: MorningBriefBrains;
}

export interface CopilotResponse {
  readonly userId: string;
  readonly displayName: string;
  readonly symbol: string;
  readonly quote: Quote;
  readonly positions: readonly PortfolioPosition[];
  readonly decision: DecisionResult;
  readonly intelligence: IntelligenceResponse;
  readonly morningBrief: MorningBrief;
  readonly disclaimer: "Not financial advice.";
}
