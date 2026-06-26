import { getFinnhubProvider } from "@/lib/providers/finnhub";
import type {
  IntelligenceFreshness,
  IntelligenceResponse,
  IntelligenceSources,
} from "@/types/intelligence";

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

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

function createFreshness(): IntelligenceFreshness {
  return {
    asOf: new Date().toISOString(),
    newsFrom: dateDaysAgo(7),
    newsTo: formatDate(new Date()),
    earningsFrom: dateDaysAgo(14),
    earningsTo: dateDaysAhead(45),
    insiderFrom: dateDaysAgo(90),
    insiderTo: formatDate(new Date()),
  };
}

export async function getIntelligence(
  symbol: string,
): Promise<IntelligenceResponse> {
  const provider = getFinnhubProvider();
  const normalizedSymbol = symbol.toUpperCase();
  const freshness = createFreshness();

  if (!provider.isConfigured) {
    return {
      symbol: normalizedSymbol,
      news: [],
      analystRecommendations: [],
      earnings: [],
      insiders: [],
      sources: {
        finnhub: {
          status: "missing_api_key",
          message: "FINNHUB_API_KEY is not configured.",
        },
      },
      freshness,
    };
  }

  try {
    const [news, analystRecommendations, earnings, insiders] =
      await Promise.all([
        provider.getCompanyNews(normalizedSymbol),
        provider.getRecommendationTrends(normalizedSymbol),
        provider.getEarningsCalendar(normalizedSymbol),
        provider.getInsiderTransactions(normalizedSymbol),
      ]);
    const sources: IntelligenceSources = {
      finnhub: {
        status: "available",
        message: "Finnhub intelligence loaded.",
      },
    };

    return {
      symbol: normalizedSymbol,
      news,
      analystRecommendations,
      earnings,
      insiders,
      sources,
      freshness,
    };
  } catch (error) {
    return {
      symbol: normalizedSymbol,
      news: [],
      analystRecommendations: [],
      earnings: [],
      insiders: [],
      sources: {
        finnhub: {
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Finnhub intelligence failed to load.",
        },
      },
      freshness,
    };
  }
}
