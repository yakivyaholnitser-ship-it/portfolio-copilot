import { scoreStock } from "@/lib/decision/score-stock";
import { createFundamentalAdvisor } from "@/lib/fundamentals/fundamental-advisor";
import { getFundamentals } from "@/lib/fundamentals/get-fundamentals";
import { getIntelligence } from "@/lib/intelligence/get-intelligence";
import { getPortfolio } from "@/lib/portfolio/get-portfolio";
import type {
  Advisor,
  AdvisorContext,
  AdvisorSignal,
  AdvisorsResponse,
} from "@/types/advisor";
import type { DecisionResult } from "@/types/decision";
import type { FundamentalAdvisor } from "@/types/fundamentals";
import type { IntelligenceResponse } from "@/types/intelligence";
import type { PortfolioResponse } from "@/types/portfolio";
import type { Quote } from "@/types/quote";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}

function formatPercent(value: number) {
  const rounded = Math.abs(value) < 0.05 ? 0 : value;

  return `${rounded > 0 ? "+" : ""}${rounded.toFixed(1)}%`;
}

function shorten(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trim()}...`;
}

function createAdvisor(advisor: Advisor): Advisor {
  return {
    ...advisor,
    confidence: Math.round(clamp(advisor.confidence, 0, 100)),
    importance: Math.round(clamp(advisor.importance, 0, 100)),
  };
}

function marketSignal(change: number): AdvisorSignal {
  if (change > 1) {
    return "positive";
  }

  if (change < -1) {
    return "caution";
  }

  return "neutral";
}

function marketAdvisor(quote: Quote): Advisor {
  const spread = quote.wsLikePrice - quote.marketPrice;
  const spreadPercent = quote.marketPrice === 0 ? 0 : (spread / quote.marketPrice) * 100;
  const absoluteMove = Math.abs(quote.todayChangePercent);

  return createAdvisor({
    id: "market",
    title: "Market Advisor",
    category: "market",
    signal: marketSignal(quote.todayChangePercent),
    confidence: quote.session === "regular" ? 86 : 72,
    importance: clamp(45 + absoluteMove * 8, 35, 92),
    summary: `${quote.symbol} moved ${formatPercent(quote.todayChangePercent)} today; reference and market prices are nearly aligned.`,
    reasoning: [
      `Market price: ${formatCurrency(quote.marketPrice)}.`,
      `WS-like reference price: ${formatCurrency(quote.wsLikePrice)}.`,
      `Reference spread: ${formatPercent(spreadPercent)}.`,
      `Session: ${quote.session}.`,
    ],
    dataSources: ["Yahoo Finance chart API"],
    freshness: quote.timestamp,
  });
}

function newsAdvisor(intelligence: IntelligenceResponse): Advisor {
  const topNews = intelligence.news[0];

  if (!topNews) {
    return createAdvisor({
      id: "news",
      title: "News Advisor",
      category: "news",
      signal: "unavailable",
      confidence: intelligence.sources.finnhub.status === "available" ? 70 : 45,
      importance: 25,
      summary: "No recent company news is available.",
      reasoning: [intelligence.sources.finnhub.message],
      dataSources: ["Finnhub company news"],
      freshness: intelligence.freshness.asOf,
    });
  }

  return createAdvisor({
    id: "news",
    title: "News Advisor",
    category: "news",
    signal: "review",
    confidence: 76,
    importance: 72,
    summary: `Latest news: ${shorten(topNews.headline, 110)}.`,
    reasoning: [
      topNews.summary || "Finnhub returned a recent headline without a summary.",
      `Source: ${topNews.source}.`,
    ],
    dataSources: ["Finnhub company news"],
    freshness: topNews.publishedAt,
  });
}

function analystAdvisor(intelligence: IntelligenceResponse): Advisor {
  const latestTrend = intelligence.analystRecommendations[0];

  if (!latestTrend) {
    return createAdvisor({
      id: "analyst",
      title: "Analyst Advisor",
      category: "analyst",
      signal: "unavailable",
      confidence: intelligence.sources.finnhub.status === "available" ? 70 : 45,
      importance: 25,
      summary: "No analyst recommendation trend is available.",
      reasoning: [intelligence.sources.finnhub.message],
      dataSources: ["Finnhub recommendation trends"],
      freshness: intelligence.freshness.asOf,
    });
  }

  const positive = latestTrend.strongBuy + latestTrend.buy;
  const negative = latestTrend.sell + latestTrend.strongSell;
  const countSummary = `${positive} Buy / ${latestTrend.hold} Hold / ${negative} Sell`;
  const signal: AdvisorSignal =
    positive > negative + latestTrend.hold
      ? "positive"
      : negative > positive
        ? "caution"
        : "neutral";

  return createAdvisor({
    id: "analyst",
    title: "Analyst Advisor",
    category: "analyst",
    signal,
    confidence: 72,
    importance: clamp(35 + Math.abs(positive - negative) * 8, 35, 85),
    summary:
      signal === "positive"
        ? `Analyst consensus remains strongly positive: ${countSummary}.`
        : `Analyst consensus is mixed: ${countSummary}.`,
    reasoning: [
      `Period: ${latestTrend.period}.`,
      `${latestTrend.strongBuy} Strong Buy, ${latestTrend.buy} Buy, ${latestTrend.hold} Hold, ${negative} Sell-side.`,
    ],
    dataSources: ["Finnhub recommendation trends"],
    freshness: intelligence.freshness.asOf,
  });
}

function insiderAdvisor(intelligence: IntelligenceResponse): Advisor {
  const transaction = intelligence.insiders[0];

  if (!transaction) {
    return createAdvisor({
      id: "insider",
      title: "Insider Advisor",
      category: "insider",
      signal: "neutral",
      confidence: intelligence.sources.finnhub.status === "available" ? 70 : 45,
      importance: 30,
      summary: "No recent insider activity was detected.",
      reasoning: [intelligence.sources.finnhub.message],
      dataSources: ["Finnhub insider transactions"],
      freshness: intelligence.freshness.asOf,
    });
  }

  const isSale = transaction.change < 0 || transaction.transactionCode === "S";

  return createAdvisor({
    id: "insider",
    title: "Insider Advisor",
    category: "insider",
    signal: isSale ? "review" : "neutral",
    confidence: 76,
    importance: isSale ? 78 : 55,
    summary: isSale
      ? "Recent insider selling deserves monitoring, but it is not automatically bearish."
      : "Recent insider activity was detected.",
    reasoning: [
      `${transaction.name} changed ${transaction.change} shares on ${transaction.transactionDate}.`,
      `Transaction code: ${transaction.transactionCode}.`,
    ],
    dataSources: ["Finnhub insider transactions"],
    freshness: transaction.transactionDate,
  });
}

function earningsAdvisor(intelligence: IntelligenceResponse): Advisor {
  const event = intelligence.earnings[0];

  if (!event) {
    return createAdvisor({
      id: "earnings",
      title: "Earnings Advisor",
      category: "earnings",
      signal: "neutral",
      confidence: intelligence.sources.finnhub.status === "available" ? 70 : 45,
      importance: 35,
      summary: "No upcoming earnings event is available.",
      reasoning: [intelligence.sources.finnhub.message],
      dataSources: ["Finnhub earnings calendar"],
      freshness: intelligence.freshness.asOf,
    });
  }

  return createAdvisor({
    id: "earnings",
    title: "Earnings Advisor",
    category: "earnings",
    signal: "review",
    confidence: 74,
    importance: 82,
    summary: `${event.symbol} earnings are scheduled for ${event.date}.`,
    reasoning: [`EPS estimate: ${event.epsEstimate ?? "unknown"}.`],
    dataSources: ["Finnhub earnings calendar"],
    freshness: intelligence.freshness.asOf,
  });
}

function fundamentalAdvisor(advisor: FundamentalAdvisor): Advisor {
  const health = advisor.fundamentalHealth;
  const signal: AdvisorSignal =
    health.confidence <= 35
      ? "unavailable"
      : health.score >= 75
        ? "positive"
        : health.score >= 55
          ? "neutral"
          : "caution";

  return createAdvisor({
    id: "fundamental",
    title: "Fundamental Advisor",
    category: "fundamental",
    signal,
    confidence: health.confidence,
    importance: health.confidence <= 35 ? 30 : health.score,
    summary:
      health.confidence <= 35
        ? "Partial fundamental data available; statement and metric access is limited."
        : `${health.headline} Fundamental Health: ${health.score}/100.`,
    reasoning: [
      advisor.revenue.summary,
      advisor.profitability.summary,
      advisor.cashFlow.summary,
      advisor.balanceSheet.summary,
      advisor.valuation.summary,
      advisor.businessMomentum.summary,
    ],
    dataSources: ["Financial Modeling Prep fundamentals"],
    freshness: new Date().toISOString(),
  });
}

function portfolioAdvisor(portfolio: PortfolioResponse): Advisor {
  const position = portfolio.positions[0];

  if (!position) {
    return createAdvisor({
      id: "portfolio",
      title: "Portfolio Advisor",
      category: "portfolio",
      signal: "unavailable",
      confidence: 90,
      importance: 20,
      summary: "No configured position is available.",
      reasoning: ["Portfolio config has no matching position for this user and symbol."],
      dataSources: ["User portfolio config"],
      freshness: new Date().toISOString(),
    });
  }

  return createAdvisor({
    id: "portfolio",
    title: "Portfolio Advisor",
    category: "portfolio",
    signal: position.isPositive ? "positive" : "review",
    confidence: 90,
    importance: clamp(45 + Math.abs(position.gainPercent), 40, 95),
    summary: position.isPositive
      ? `${portfolio.displayName} is up ${formatPercent(position.gainPercent)} from a ${formatCurrency(position.bought)} entry.`
      : `${portfolio.displayName} is down ${Math.abs(position.gainPercent).toFixed(1)}% from a ${formatCurrency(position.bought)} entry.`,
    reasoning: [
      `Reference price: ${formatCurrency(position.referencePrice)}.`,
      `Gain per share: ${formatCurrency(position.gainDollarPerShare)}.`,
    ],
    dataSources: ["User portfolio config", "Yahoo Finance chart API"],
    freshness: portfolio.quote.timestamp,
  });
}

function opportunityAdvisor(
  portfolio: PortfolioResponse,
  decision: DecisionResult,
): Advisor {
  const position = portfolio.positions[0];
  const hasLargeGain = Boolean(position && position.gainPercent >= 50);
  const hasBelowEntryPosition = Boolean(position && position.gainPercent < 0);

  if (hasLargeGain && decision.totalScore >= 70) {
    return createAdvisor({
      id: "opportunity",
      title: "Opportunity Advisor",
      category: "opportunity",
      signal: "review",
      confidence: 78,
      importance: 86,
      summary: "Review your target or partial-profit rules.",
      reasoning: ["A gain above 100% makes target and partial-profit rules worth reviewing."],
      dataSources: ["Decision Engine", "User portfolio config"],
      freshness: portfolio.quote.timestamp,
    });
  }

  if (hasBelowEntryPosition && decision.factorScores.momentum >= 7) {
    return createAdvisor({
      id: "opportunity",
      title: "Opportunity Advisor",
      category: "opportunity",
      signal: "review",
      confidence: 74,
      importance: 68,
      summary: "Track break-even and avoid reacting to one-day moves.",
      reasoning: ["Momentum improved while the position remains below entry."],
      dataSources: ["Decision Engine", "User portfolio config"],
      freshness: portfolio.quote.timestamp,
    });
  }

  return createAdvisor({
    id: "opportunity",
    title: "Opportunity Advisor",
    category: "opportunity",
    signal: "neutral",
    confidence: 72,
    importance: 45,
    summary: "Opportunity is limited today.",
    reasoning: ["The current setup does not create a strong new opportunity signal."],
    dataSources: ["Decision Engine", "User portfolio config"],
    freshness: portfolio.quote.timestamp,
  });
}

export function buildAdvisors(context: AdvisorContext): readonly Advisor[] {
  return [
    marketAdvisor(context.portfolio.quote),
    newsAdvisor(context.intelligence),
    analystAdvisor(context.intelligence),
    insiderAdvisor(context.intelligence),
    earningsAdvisor(context.intelligence),
    fundamentalAdvisor(context.fundamentalAdvisor),
    portfolioAdvisor(context.portfolio),
    opportunityAdvisor(context.portfolio, context.decision),
  ];
}

export async function getAdvisorContext(input: {
  readonly userId: string;
  readonly symbol?: string | null;
}): Promise<AdvisorContext> {
  const portfolio = await getPortfolio(input);
  const [intelligence, fundamentals] = await Promise.all([
    getIntelligence(portfolio.symbol),
    getFundamentals(portfolio.symbol),
  ]);
  const decision = scoreStock({
    quote: portfolio.quote,
    positions: portfolio.positions,
  });
  const fundamentalAdvisor = createFundamentalAdvisor(fundamentals);

  return {
    portfolio,
    decision,
    intelligence,
    fundamentals,
    fundamentalAdvisor,
  };
}

export async function getAdvisorsResponse(input: {
  readonly userId: string;
  readonly symbol?: string | null;
}): Promise<AdvisorsResponse> {
  const context = await getAdvisorContext(input);

  return {
    ...context,
    advisors: buildAdvisors(context),
  };
}
