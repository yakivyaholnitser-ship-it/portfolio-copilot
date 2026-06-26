import { NoopAiInsightProvider } from "./noop-ai-provider";
import type { AiInsightProvider } from "./types";

let aiInsightProvider: AiInsightProvider | undefined;

export function getAiInsightProvider(): AiInsightProvider {
  aiInsightProvider ??= new NoopAiInsightProvider();

  return aiInsightProvider;
}

export type {
  AiInsightProvider,
  PortfolioInsight,
  PortfolioInsightInput,
} from "./types";
