import type { MarketSession, Quote } from "@/types/quote";

import type { GetQuoteInput, QuoteProvider } from "./types";

interface YahooTradingPeriod {
  readonly start: number;
  readonly end: number;
}

interface YahooChartMeta {
  readonly symbol?: string;
  readonly regularMarketPrice?: number;
  readonly chartPreviousClose?: number;
  readonly previousClose?: number;
  readonly regularMarketTime?: number;
  readonly currentTradingPeriod?: {
    readonly pre?: YahooTradingPeriod;
    readonly regular?: YahooTradingPeriod;
    readonly post?: YahooTradingPeriod;
  };
}

interface YahooChartResult {
  readonly meta?: YahooChartMeta;
  readonly timestamp?: readonly number[];
  readonly indicators?: {
    readonly quote?: readonly {
      readonly close?: readonly (number | null)[];
    }[];
  };
}

interface YahooChartResponse {
  readonly chart?: {
    readonly result?: readonly YahooChartResult[];
    readonly error?: {
      readonly code?: string;
      readonly description?: string;
    } | null;
  };
}

function getLatestNumber(values: readonly (number | null | undefined)[]): number | null {
  for (let index = values.length - 1; index >= 0; index -= 1) {
    const value = values[index];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }

  return null;
}

function resolveSession(
  tradingPeriod: YahooChartMeta["currentTradingPeriod"],
  epochSeconds: number,
): MarketSession {
  if (!tradingPeriod) {
    return "unknown";
  }

  if (isWithinTradingPeriod(tradingPeriod.pre, epochSeconds)) {
    return "pre";
  }

  if (isWithinTradingPeriod(tradingPeriod.regular, epochSeconds)) {
    return "regular";
  }

  if (isWithinTradingPeriod(tradingPeriod.post, epochSeconds)) {
    return "post";
  }

  return "closed";
}

function isWithinTradingPeriod(
  period: YahooTradingPeriod | undefined,
  epochSeconds: number,
) {
  return Boolean(
    period && epochSeconds >= period.start && epochSeconds <= period.end,
  );
}

function roundPercent(value: number) {
  return Number(value.toFixed(4));
}

export class YahooChartQuoteProvider implements QuoteProvider {
  readonly id = "yahoo-finance-chart";

  async getQuote(input: GetQuoteInput): Promise<Quote> {
    const symbol = input.symbol.trim().toUpperCase();
    const url = new URL(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`,
    );

    url.searchParams.set("range", "1d");
    url.searchParams.set("interval", "1m");
    url.searchParams.set("includePrePost", "true");

    const response = await fetch(url, {
      headers: {
        accept: "application/json",
      },
      next: {
        revalidate: 30,
      },
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance request failed with ${response.status}.`);
    }

    const payload = (await response.json()) as YahooChartResponse;
    const result = payload.chart?.result?.[0];
    const yahooError = payload.chart?.error;

    if (!result || yahooError) {
      throw new Error(
        yahooError?.description ?? `No Yahoo Finance chart result for ${symbol}.`,
      );
    }

    const meta = result.meta;
    const closes = result.indicators?.quote?.[0]?.close ?? [];
    const latestClose = getLatestNumber(closes);
    const marketPrice = meta?.regularMarketPrice;
    const previousClose = meta?.chartPreviousClose ?? meta?.previousClose;

    if (
      typeof marketPrice !== "number" ||
      typeof previousClose !== "number" ||
      latestClose === null
    ) {
      throw new Error(`Yahoo Finance response for ${symbol} was incomplete.`);
    }

    const timestampSeconds =
      result.timestamp?.at(-1) ?? meta?.regularMarketTime ?? Math.floor(Date.now() / 1000);
    const todayChangePercent = ((latestClose - previousClose) / previousClose) * 100;

    return {
      symbol: meta?.symbol ?? symbol,
      marketPrice,
      wsLikePrice: latestClose,
      previousClose,
      todayChangePercent: roundPercent(todayChangePercent),
      session: resolveSession(meta?.currentTradingPeriod, timestampSeconds),
      provider: this.id,
      timestamp: new Date(timestampSeconds * 1000).toISOString(),
    };
  }
}
