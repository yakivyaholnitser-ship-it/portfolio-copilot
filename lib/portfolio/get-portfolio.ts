import { getPortfolioConfig } from "@/lib/config/portfolio";
import { calculatePortfolioPosition } from "@/lib/portfolio/calculate-position";
import { getQuoteProvider } from "@/lib/providers/quotes";
import type { PortfolioResponse } from "@/types/portfolio";

export class PortfolioNotFoundError extends Error {
  constructor(symbol: string) {
    super(`No configured portfolio found for ${symbol}.`);
    this.name = "PortfolioNotFoundError";
  }
}

export async function getPortfolio(symbol: string): Promise<PortfolioResponse> {
  const portfolio = getPortfolioConfig(symbol);

  if (!portfolio) {
    throw new PortfolioNotFoundError(symbol);
  }

  const quote = await getQuoteProvider().getQuote({ symbol: portfolio.symbol });
  const referencePrice = quote.wsLikePrice;
  const positions = portfolio.positions.map((position) =>
    calculatePortfolioPosition(position, referencePrice),
  );

  return {
    symbol: portfolio.symbol,
    quote,
    positions,
  };
}
