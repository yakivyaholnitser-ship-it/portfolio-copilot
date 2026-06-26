export type MarketSession = "pre" | "regular" | "post" | "closed" | "unknown";

export interface Quote {
  readonly symbol: string;
  readonly marketPrice: number;
  readonly wsLikePrice: number;
  readonly previousClose: number;
  readonly todayChangePercent: number;
  readonly session: MarketSession;
  readonly provider: string;
  readonly timestamp: string;
}

export interface QuoteResponse {
  readonly quote: Quote;
}
