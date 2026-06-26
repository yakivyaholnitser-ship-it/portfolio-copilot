import type {
  AnalystRecommendationTrend,
  EarningsEvent,
  InsiderTransaction,
  NewsItem,
} from "@/types/intelligence";

export interface FinnhubProvider {
  readonly id: "finnhub";
  readonly isConfigured: boolean;
  getCompanyNews(symbol: string): Promise<readonly NewsItem[]>;
  getRecommendationTrends(
    symbol: string,
  ): Promise<readonly AnalystRecommendationTrend[]>;
  getEarningsCalendar(symbol: string): Promise<readonly EarningsEvent[]>;
  getInsiderTransactions(
    symbol: string,
  ): Promise<readonly InsiderTransaction[]>;
}
