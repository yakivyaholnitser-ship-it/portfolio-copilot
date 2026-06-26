import type {
  FundamentalAdvisor,
  FundamentalAdvisorSection,
  FundamentalHealth,
  FundamentalSectionStatus,
  FundamentalsData,
} from "@/types/fundamentals";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function average(values: readonly number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function growthRate(latest: number | null, older: number | null) {
  if (latest === null || older === null || older === 0) {
    return null;
  }

  return ((latest - older) / Math.abs(older)) * 100;
}

function scoreFromGrowth(growth: number | null) {
  if (growth === null) {
    return 50;
  }

  return clamp(55 + growth * 1.5, 15, 95);
}

function statusFromScore(score: number): FundamentalSectionStatus {
  if (score >= 80) {
    return "strong";
  }

  if (score >= 65) {
    return "improving";
  }

  if (score >= 45) {
    return "stable";
  }

  return "weakening";
}

function createSection(
  score: number,
  summary: string,
  importance = 70,
  confidence = 75,
): FundamentalAdvisorSection {
  return {
    status: statusFromScore(score),
    summary,
    importance: Math.round(clamp(importance, 0, 100)),
    confidence: Math.round(clamp(confidence, 0, 100)),
  };
}

function unavailableSection(summary: string): FundamentalAdvisorSection {
  return {
    status: "unknown",
    summary,
    importance: 35,
    confidence: 25,
  };
}

function percent(value: number | null) {
  if (value === null) {
    return "unknown";
  }

  return `${value.toFixed(1)}%`;
}

export function createFundamentalAdvisor(
  fundamentals: FundamentalsData,
): FundamentalAdvisor {
  const latestIncome = fundamentals.incomeStatements[0];
  const olderIncome = fundamentals.incomeStatements[1];
  const latestBalance = fundamentals.balanceSheets[0];
  const latestCashFlow = fundamentals.cashFlows[0];
  const olderCashFlow = fundamentals.cashFlows[1];
  const latestMetrics = fundamentals.keyMetrics[0];
  const latestRatios = fundamentals.financialRatios[0];
  const latestGrowth = fundamentals.financialGrowth[0];
  const hasAnyData =
    fundamentals.companyProfiles.length > 0 ||
    fundamentals.incomeStatements.length > 0 ||
    fundamentals.balanceSheets.length > 0 ||
    fundamentals.cashFlows.length > 0 ||
    fundamentals.keyMetrics.length > 0 ||
    fundamentals.financialRatios.length > 0 ||
    fundamentals.financialGrowth.length > 0;
  const hasStatementOrMetricData =
    fundamentals.incomeStatements.length > 0 ||
    fundamentals.balanceSheets.length > 0 ||
    fundamentals.cashFlows.length > 0 ||
    fundamentals.keyMetrics.length > 0 ||
    fundamentals.financialRatios.length > 0 ||
    fundamentals.financialGrowth.length > 0;

  if (!hasAnyData) {
    const section = unavailableSection(
      fundamentals.sources.fmp.status === "missing_api_key"
        ? "Fundamental data is unavailable because FMP is not configured."
        : "Fundamental data is unavailable from the current FMP endpoints.",
    );
    const fundamentalHealth: FundamentalHealth = {
      score: 0,
      headline: "Fundamental data unavailable.",
      summary:
        fundamentals.sources.fmp.status === "missing_api_key"
          ? "Configure FMP_API_KEY to evaluate business quality."
          : "No FMP fundamentals endpoints returned usable data.",
      revenueTrend: section,
      earningsTrend: section,
      profitability: section,
      balanceSheet: section,
      cashFlow: section,
      valuation: section,
      confidence: 20,
    };

    return {
      fundamentalHealth,
      revenue: section,
      profitability: section,
      cashFlow: section,
      balanceSheet: section,
      valuation: section,
      businessMomentum: section,
    };
  }

  if (!hasStatementOrMetricData) {
    const section = unavailableSection(
      "Partial profile data is available, but financial statement endpoints are restricted on this FMP plan.",
    );
    const fundamentalHealth: FundamentalHealth = {
      score: 50,
      headline: "Partial fundamental data available.",
      summary:
        "Partial profile data available. Revenue, margins, cash flow, balance sheet, and valuation need statement or metric access.",
      revenueTrend: section,
      earningsTrend: section,
      profitability: section,
      balanceSheet: section,
      cashFlow: section,
      valuation: section,
      confidence: 35,
    };

    return {
      fundamentalHealth,
      revenue: section,
      profitability: section,
      cashFlow: section,
      balanceSheet: section,
      valuation: section,
      businessMomentum: section,
    };
  }

  const revenueGrowth = latestGrowth?.revenueGrowth !== undefined
    ? latestGrowth.revenueGrowth !== null
      ? latestGrowth.revenueGrowth * 100
      : null
    : growthRate(
    latestIncome?.revenue ?? null,
    olderIncome?.revenue ?? null,
  );
  const earningsGrowth = latestGrowth?.netIncomeGrowth !== undefined
    ? latestGrowth.netIncomeGrowth !== null
      ? latestGrowth.netIncomeGrowth * 100
      : null
    : growthRate(
    latestIncome?.netIncome ?? null,
    olderIncome?.netIncome ?? null,
  );
  const freeCashFlowGrowth = latestGrowth?.freeCashFlowGrowth !== undefined
    ? latestGrowth.freeCashFlowGrowth !== null
      ? latestGrowth.freeCashFlowGrowth * 100
      : null
    : growthRate(
    latestCashFlow?.freeCashFlow ?? null,
    olderCashFlow?.freeCashFlow ?? null,
  );
  const netMargin = latestRatios?.netProfitMargin ?? null;
  const grossMargin = latestRatios?.grossProfitMargin ?? latestIncome?.grossProfitRatio ?? null;
  const currentRatio = latestRatios?.currentRatio ?? null;
  const debtEquity = latestRatios?.debtEquityRatio ?? latestMetrics?.debtToEquity ?? null;
  const peRatio = latestMetrics?.peRatio ?? null;
  const freeCashFlowYield = latestMetrics?.freeCashFlowYield ?? null;

  const revenueScore = scoreFromGrowth(revenueGrowth);
  const earningsScore = scoreFromGrowth(earningsGrowth);
  const profitabilityScore = clamp(
    average([
      grossMargin !== null ? grossMargin * 100 * 1.2 : 50,
      netMargin !== null ? 50 + netMargin * 180 : 50,
    ]),
    15,
    95,
  );
  const cashFlowScore = scoreFromGrowth(freeCashFlowGrowth);
  const balanceSheetScore = clamp(
    average([
      currentRatio !== null ? currentRatio * 35 : 50,
      debtEquity !== null ? 85 - debtEquity * 12 : 50,
    ]),
    15,
    95,
  );
  const valuationScore = clamp(
    average([
      peRatio !== null && peRatio > 0 ? 90 - peRatio : 50,
      freeCashFlowYield !== null ? 50 + freeCashFlowYield * 400 : 50,
    ]),
    15,
    95,
  );
  const businessMomentumScore = average([
    revenueScore,
    earningsScore,
    profitabilityScore,
    cashFlowScore,
  ]);
  const overallScore = Math.round(
    average([
      revenueScore,
      earningsScore,
      profitabilityScore,
      cashFlowScore,
      balanceSheetScore,
      valuationScore,
      businessMomentumScore,
    ]),
  );
  const revenue = createSection(
    revenueScore,
    revenueGrowth !== null
      ? `Revenue ${revenueGrowth >= 0 ? "grew" : "declined"} ${percent(Math.abs(revenueGrowth))} year over year.`
      : "Revenue trend could not be calculated.",
    82,
  );
  const earningsTrend = createSection(
    earningsScore,
    earningsGrowth !== null
      ? `Earnings ${earningsGrowth >= 0 ? "improved" : "weakened"} ${percent(Math.abs(earningsGrowth))} year over year.`
      : "Earnings trend could not be calculated.",
    78,
  );
  const profitability = createSection(
    profitabilityScore,
    `Margins remain ${profitabilityScore >= 65 ? "healthy" : "under pressure"}; net margin is ${percent(netMargin !== null ? netMargin * 100 : null)}.`,
    80,
  );
  const cashFlow = createSection(
    cashFlowScore,
    freeCashFlowGrowth !== null
      ? `Free cash flow ${freeCashFlowGrowth >= 0 ? "improved" : "weakened"} ${percent(Math.abs(freeCashFlowGrowth))} year over year.`
      : "Free cash flow trend could not be calculated.",
    80,
  );
  const balanceSheet = createSection(
    balanceSheetScore,
    `Balance sheet looks ${balanceSheetScore >= 65 ? "manageable" : "stretched"} based on liquidity and debt ratios.`,
    76,
  );
  const valuation = createSection(
    valuationScore,
    valuationScore >= 65
      ? "Valuation appears reasonable relative to earnings and free cash flow."
      : "Valuation is becoming expensive relative to fundamentals.",
    72,
  );
  const businessMomentum = createSection(
    businessMomentumScore,
    businessMomentumScore >= 65
      ? "Business momentum remains positive across growth, margins, and cash flow."
      : "Business momentum is mixed and deserves monitoring.",
    85,
  );
  const fundamentalHealth: FundamentalHealth = {
    score: overallScore,
    headline:
      !hasStatementOrMetricData
        ? "Partial fundamental data available."
        : overallScore >= 75
        ? "Business quality remains strong."
        : overallScore >= 55
          ? "Business quality looks mixed but stable."
          : "Business quality is weakening.",
    summary: [
      fundamentals.sources.fmp.status === "partial"
        ? "Partial data available."
        : null,
      revenue.summary,
      profitability.summary,
      cashFlow.summary,
      valuation.summary,
      businessMomentum.summary,
    ].filter(Boolean).join(" "),
    revenueTrend: revenue,
    earningsTrend,
    profitability,
    balanceSheet,
    cashFlow,
    valuation,
    confidence:
      fundamentals.sources.fmp.status === "partial" && !hasStatementOrMetricData
        ? 35
        : fundamentals.sources.fmp.status === "partial"
          ? 55
          : 78,
  };

  return {
    fundamentalHealth,
    revenue,
    profitability,
    cashFlow,
    balanceSheet,
    valuation,
    businessMomentum,
  };
}
