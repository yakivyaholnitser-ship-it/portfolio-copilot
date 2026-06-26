import type {
  AiInsightProvider,
  PortfolioInsight,
  PortfolioInsightInput,
} from "./types";

export class NoopAiInsightProvider implements AiInsightProvider {
  readonly id = "noop-ai";

  async createPortfolioInsight(
    input: PortfolioInsightInput,
  ): Promise<PortfolioInsight> {
    return {
      summary: `AI insight provider is not configured yet. Received ${input.holdings.length} holding(s).`,
      model: "not-configured",
      createdAt: new Date().toISOString(),
    };
  }
}
