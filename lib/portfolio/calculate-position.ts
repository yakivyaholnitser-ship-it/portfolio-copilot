import type {
  PortfolioPosition,
  InvestorPositionConfig,
} from "@/types/portfolio";

function roundMoney(value: number) {
  return Number(value.toFixed(2));
}

function roundPercent(value: number) {
  return Number(value.toFixed(4));
}

export function calculatePortfolioPosition(
  position: InvestorPositionConfig,
  referencePrice: number,
  owner: string,
): PortfolioPosition {
  const gainDollarPerShare = referencePrice - position.bought;
  const gainPercent = (gainDollarPerShare / position.bought) * 100;

  return {
    owner,
    symbol: position.symbol,
    bought: position.bought,
    referencePrice,
    gainDollarPerShare: roundMoney(gainDollarPerShare),
    gainPercent: roundPercent(gainPercent),
    isPositive: gainDollarPerShare >= 0,
  };
}
