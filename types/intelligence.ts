export interface NewsItem {
  readonly id: string;
  readonly headline: string;
  readonly summary: string;
  readonly source: string;
  readonly url: string;
  readonly publishedAt: string;
}

export interface AnalystRecommendationTrend {
  readonly period: string;
  readonly strongBuy: number;
  readonly buy: number;
  readonly hold: number;
  readonly sell: number;
  readonly strongSell: number;
}

export interface EarningsEvent {
  readonly date: string;
  readonly symbol: string;
  readonly epsEstimate: number | null;
  readonly epsActual: number | null;
  readonly revenueEstimate: number | null;
  readonly revenueActual: number | null;
}

export interface InsiderTransaction {
  readonly name: string;
  readonly share: number;
  readonly change: number;
  readonly transactionDate: string;
  readonly transactionCode: string;
  readonly transactionPrice: number | null;
}

export type ProviderStatus = "available" | "partial" | "missing_api_key" | "error";

export interface IntelligenceSources {
  readonly finnhub: {
    readonly status: ProviderStatus;
    readonly message: string;
  };
}

export interface IntelligenceFreshness {
  readonly asOf: string;
  readonly newsFrom: string;
  readonly newsTo: string;
  readonly earningsFrom: string;
  readonly earningsTo: string;
  readonly insiderFrom: string;
  readonly insiderTo: string;
}

export interface IntelligenceResponse {
  readonly symbol: string;
  readonly news: readonly NewsItem[];
  readonly analystRecommendations: readonly AnalystRecommendationTrend[];
  readonly earnings: readonly EarningsEvent[];
  readonly insiders: readonly InsiderTransaction[];
  readonly sources: IntelligenceSources;
  readonly freshness: IntelligenceFreshness;
}
