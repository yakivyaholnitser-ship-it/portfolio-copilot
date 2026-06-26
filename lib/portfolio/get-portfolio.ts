import { getInvestorConfig } from "@/lib/config/portfolio";
import { calculatePortfolioPosition } from "@/lib/portfolio/calculate-position";
import { getQuoteProvider } from "@/lib/providers/quotes";
import type { PortfolioResponse } from "@/types/portfolio";

export class PortfolioNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PortfolioNotFoundError";
  }
}

interface GetPortfolioInput {
  readonly userId: string;
  readonly symbol?: string | null;
}

export async function getPortfolio({
  userId,
  symbol,
}: GetPortfolioInput): Promise<PortfolioResponse> {
  const investor = getInvestorConfig(userId);

  if (!investor) {
    throw new PortfolioNotFoundError(`No configured user found for ${userId}.`);
  }

  const normalizedSymbol = symbol?.toUpperCase() ?? investor.positions[0]?.symbol;
  const matchingPositions = investor.positions.filter(
    (position) => position.symbol === normalizedSymbol,
  );

  if (!normalizedSymbol || matchingPositions.length === 0) {
    throw new PortfolioNotFoundError(
      `No configured ${normalizedSymbol ?? "symbol"} position found for ${investor.displayName}.`,
    );
  }

  const quote = await getQuoteProvider().getQuote({ symbol: normalizedSymbol });
  const referencePrice = quote.wsLikePrice;
  const positions = matchingPositions.map((position) =>
    calculatePortfolioPosition(position, referencePrice, investor.displayName),
  );

  return {
    userId: investor.id,
    displayName: investor.displayName,
    symbol: normalizedSymbol,
    quote,
    positions,
  };
}
