import type {
  PortfolioPosition,
  PortfolioPositionConfig,
} from "@/types/portfolio";

function roundMoney(value: number) {
  return Number(value.toFixed(2));
}

function roundPercent(value: number) {
  return Number(value.toFixed(4));
}

export function calculatePortfolioPosition(
  position: PortfolioPositionConfig,
  referencePrice: number,
): PortfolioPosition {
  const gainDollarPerShare = referencePrice - position.bought;
  const gainPercent = (gainDollarPerShare / position.bought) * 100;

  return {
    owner: position.owner,
    bought: position.bought,
    referencePrice,
    gainDollarPerShare: roundMoney(gainDollarPerShare),
    gainPercent: roundPercent(gainPercent),
    isPositive: gainDollarPerShare >= 0,
  };
}
