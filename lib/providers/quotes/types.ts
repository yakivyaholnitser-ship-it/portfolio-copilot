import type { Quote } from "@/types/quote";

export interface GetQuoteInput {
  readonly symbol: string;
}

export interface QuoteProvider {
  readonly id: string;
  getQuote(input: GetQuoteInput): Promise<Quote>;
}
