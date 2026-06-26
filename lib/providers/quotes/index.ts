import { YahooChartQuoteProvider } from "./yahoo-chart-provider";
import type { QuoteProvider } from "./types";

let quoteProvider: QuoteProvider | undefined;

export function getQuoteProvider(): QuoteProvider {
  quoteProvider ??= new YahooChartQuoteProvider();

  return quoteProvider;
}

export type { GetQuoteInput, QuoteProvider } from "./types";
