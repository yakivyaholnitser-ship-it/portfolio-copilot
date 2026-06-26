export interface PortfolioInsightInput {
  readonly holdings: readonly {
    readonly symbol: string;
    readonly allocationPercent: number;
  }[];
  readonly question: string;
}

export interface PortfolioInsight {
  readonly summary: string;
  readonly model: string;
  readonly createdAt: string;
}

export interface AiInsightProvider {
  readonly id: string;
  createPortfolioInsight(input: PortfolioInsightInput): Promise<PortfolioInsight>;
}
