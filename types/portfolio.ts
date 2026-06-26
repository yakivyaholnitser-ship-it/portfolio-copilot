import type { Quote } from "@/types/quote";

export interface InvestorPositionConfig {
  readonly symbol: string;
  readonly bought: number;
}

export interface InvestorConfig {
  readonly id: string;
  readonly displayName: string;
  readonly positions: readonly InvestorPositionConfig[];
}

export interface PortfolioPosition {
  readonly owner: string;
  readonly symbol: string;
  readonly bought: number;
  readonly referencePrice: number;
  readonly gainDollarPerShare: number;
  readonly gainPercent: number;
  readonly isPositive: boolean;
}

export interface PortfolioResponse {
  readonly userId: string;
  readonly displayName: string;
  readonly symbol: string;
  readonly quote: Quote;
  readonly positions: readonly PortfolioPosition[];
}
