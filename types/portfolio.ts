import type { Quote } from "@/types/quote";

export interface PortfolioPositionConfig {
  readonly owner: string;
  readonly bought: number;
}

export interface PortfolioConfig {
  readonly symbol: string;
  readonly positions: readonly PortfolioPositionConfig[];
}

export interface PortfolioPosition {
  readonly owner: string;
  readonly bought: number;
  readonly referencePrice: number;
  readonly gainDollarPerShare: number;
  readonly gainPercent: number;
  readonly isPositive: boolean;
}

export interface PortfolioResponse {
  readonly symbol: string;
  readonly quote: Quote;
  readonly positions: readonly PortfolioPosition[];
}
