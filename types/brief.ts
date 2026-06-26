import type { PortfolioPosition, PortfolioResponse } from "@/types/portfolio";
import type { Quote } from "@/types/quote";
import type { DecisionResult, DecisionSignal } from "@/types/decision";

export type BriefSignal = DecisionSignal;

export interface PortfolioBrief {
  readonly signal: BriefSignal;
  /** Integer confidence from 0 to 100. */
  readonly confidence: number;
  readonly summary: string;
  readonly yakivNote: string;
  readonly anastasiiaNote: string;
}

export interface BriefPositionInput {
  readonly owner: string;
  readonly bought: number;
  readonly gainDollarPerShare: number;
  readonly gainPercent: number;
}

export interface BriefInput {
  readonly symbol: string;
  readonly marketPrice: number;
  readonly wsLikePrice: number;
  readonly todayChangePercent: number;
  readonly session: Quote["session"];
  readonly positions: readonly BriefPositionInput[];
}

export interface BriefResponse extends PortfolioResponse {
  readonly decision: DecisionResult;
  readonly brief: PortfolioBrief;
  readonly disclaimer: "Not financial advice.";
}

function roundDollar(value: number) {
  return Number(value.toFixed(2));
}

function roundPercent(value: number) {
  return Number(value.toFixed(1));
}

export function toBriefPositionInput(
  position: PortfolioPosition,
): BriefPositionInput {
  return {
    owner: position.owner,
    bought: roundDollar(position.bought),
    gainDollarPerShare: roundDollar(position.gainDollarPerShare),
    gainPercent: roundPercent(position.gainPercent),
  };
}

export function toBriefInput(portfolio: PortfolioResponse): BriefInput {
  return {
    symbol: portfolio.symbol,
    marketPrice: roundDollar(portfolio.quote.marketPrice),
    wsLikePrice: roundDollar(portfolio.quote.wsLikePrice),
    todayChangePercent: roundPercent(portfolio.quote.todayChangePercent),
    session: portfolio.quote.session,
    positions: portfolio.positions.map(toBriefPositionInput),
  };
}
