import type { PortfolioConfig } from "@/types/portfolio";

export const portfolios = {
  STX: {
    symbol: "STX",
    positions: [
      {
        owner: "Yakiv",
        bought: 452.75,
      },
      {
        owner: "Anastasiia",
        bought: 1108.22,
      },
    ],
  },
} as const satisfies Record<string, PortfolioConfig>;

export type PortfolioSymbol = keyof typeof portfolios;

export function getPortfolioConfig(symbol: string): PortfolioConfig | null {
  const normalizedSymbol = symbol.toUpperCase();

  return normalizedSymbol in portfolios
    ? portfolios[normalizedSymbol as PortfolioSymbol]
    : null;
}
