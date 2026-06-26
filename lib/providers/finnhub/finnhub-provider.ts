import type {
  AnalystRecommendationTrend,
  EarningsEvent,
  InsiderTransaction,
  NewsItem,
} from "@/types/intelligence";

import type { FinnhubProvider } from "./types";

interface FinnhubNewsItem {
  readonly id?: number;
  readonly headline?: string;
  readonly summary?: string;
  readonly source?: string;
  readonly url?: string;
  readonly datetime?: number;
}

interface FinnhubRecommendationTrend {
  readonly period?: string;
  readonly strongBuy?: number;
  readonly buy?: number;
  readonly hold?: number;
  readonly sell?: number;
  readonly strongSell?: number;
}

interface FinnhubEarningsEvent {
  readonly date?: string;
  readonly symbol?: string;
  readonly epsEstimate?: number | null;
  readonly epsActual?: number | null;
  readonly revenueEstimate?: number | null;
  readonly revenueActual?: number | null;
}

interface FinnhubEarningsResponse {
  readonly earningsCalendar?: readonly FinnhubEarningsEvent[];
}

interface FinnhubInsiderTransaction {
  readonly name?: string;
  readonly share?: number;
  readonly change?: number;
  readonly transactionDate?: string;
  readonly transactionCode?: string;
  readonly transactionPrice?: number | null;
}

interface FinnhubInsiderResponse {
  readonly data?: readonly FinnhubInsiderTransaction[];
}

const baseUrl = "https://finnhub.io/api/v1";

function dateDaysAgo(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);

  return formatDate(date);
}

function dateDaysAhead(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);

  return formatDate(date);
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function safeNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export class HttpFinnhubProvider implements FinnhubProvider {
  readonly id = "finnhub";
  readonly isConfigured: boolean;

  constructor(private readonly apiKey = process.env.FINNHUB_API_KEY) {
    this.isConfigured = Boolean(apiKey);
  }

  async getCompanyNews(symbol: string): Promise<readonly NewsItem[]> {
    if (!this.apiKey) {
      return [];
    }

    const payload = await this.request<readonly FinnhubNewsItem[]>(
      "/company-news",
      {
        symbol,
        from: dateDaysAgo(7),
        to: formatDate(new Date()),
      },
    );

    return payload.slice(0, 6).map((item, index) => ({
      id: String(item.id ?? `${symbol}-${index}`),
      headline: item.headline ?? "Untitled news item",
      summary: item.summary ?? "",
      source: item.source ?? "Finnhub",
      url: item.url ?? "",
      publishedAt: item.datetime
        ? new Date(item.datetime * 1000).toISOString()
        : new Date().toISOString(),
    }));
  }

  async getRecommendationTrends(
    symbol: string,
  ): Promise<readonly AnalystRecommendationTrend[]> {
    if (!this.apiKey) {
      return [];
    }

    const payload = await this.request<readonly FinnhubRecommendationTrend[]>(
      "/stock/recommendation",
      { symbol },
    );

    return payload.slice(0, 4).map((item) => ({
      period: item.period ?? "unknown",
      strongBuy: item.strongBuy ?? 0,
      buy: item.buy ?? 0,
      hold: item.hold ?? 0,
      sell: item.sell ?? 0,
      strongSell: item.strongSell ?? 0,
    }));
  }

  async getEarningsCalendar(symbol: string): Promise<readonly EarningsEvent[]> {
    if (!this.apiKey) {
      return [];
    }

    const payload = await this.request<FinnhubEarningsResponse>(
      "/calendar/earnings",
      {
        symbol,
        from: dateDaysAgo(14),
        to: dateDaysAhead(45),
      },
    );

    return (payload.earningsCalendar ?? []).slice(0, 4).map((item) => ({
      date: item.date ?? "unknown",
      symbol: item.symbol ?? symbol,
      epsEstimate: safeNumber(item.epsEstimate),
      epsActual: safeNumber(item.epsActual),
      revenueEstimate: safeNumber(item.revenueEstimate),
      revenueActual: safeNumber(item.revenueActual),
    }));
  }

  async getInsiderTransactions(
    symbol: string,
  ): Promise<readonly InsiderTransaction[]> {
    if (!this.apiKey) {
      return [];
    }

    const payload = await this.request<FinnhubInsiderResponse>(
      "/stock/insider-transactions",
      {
        symbol,
        from: dateDaysAgo(90),
        to: formatDate(new Date()),
      },
    );

    return (payload.data ?? []).slice(0, 6).map((item) => ({
      name: item.name ?? "Unknown insider",
      share: item.share ?? 0,
      change: item.change ?? 0,
      transactionDate: item.transactionDate ?? "unknown",
      transactionCode: item.transactionCode ?? "unknown",
      transactionPrice: safeNumber(item.transactionPrice),
    }));
  }

  private async request<TResponse>(
    path: string,
    params: Record<string, string>,
  ): Promise<TResponse> {
    const url = new URL(`${baseUrl}${path}`);

    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    url.searchParams.set("token", this.apiKey ?? "");

    const response = await fetch(url, {
      headers: {
        accept: "application/json",
      },
      next: {
        revalidate: 300,
      },
    });

    if (!response.ok) {
      throw new Error(`Finnhub request failed with ${response.status}.`);
    }

    return (await response.json()) as TResponse;
  }
}
