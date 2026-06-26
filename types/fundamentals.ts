import type { ProviderStatus } from "@/types/intelligence";

export type FundamentalSectionStatus =
  | "strong"
  | "improving"
  | "stable"
  | "weakening"
  | "unknown";

export interface FundamentalAdvisorSection {
  readonly status: FundamentalSectionStatus;
  readonly summary: string;
  readonly importance: number;
  readonly confidence: number;
}

export interface FundamentalHealth {
  readonly score: number;
  readonly headline: string;
  readonly summary: string;
  readonly revenueTrend: FundamentalAdvisorSection;
  readonly earningsTrend: FundamentalAdvisorSection;
  readonly profitability: FundamentalAdvisorSection;
  readonly balanceSheet: FundamentalAdvisorSection;
  readonly cashFlow: FundamentalAdvisorSection;
  readonly valuation: FundamentalAdvisorSection;
  readonly confidence: number;
}

export interface FundamentalEndpointDiagnostic {
  readonly endpoint: string;
  readonly status: "ok" | "forbidden" | "error" | "skipped";
  readonly message: string;
  readonly itemCount: number;
}

export interface FundamentalAdvisor {
  readonly fundamentalHealth: FundamentalHealth;
  readonly revenue: FundamentalAdvisorSection;
  readonly profitability: FundamentalAdvisorSection;
  readonly cashFlow: FundamentalAdvisorSection;
  readonly balanceSheet: FundamentalAdvisorSection;
  readonly valuation: FundamentalAdvisorSection;
  readonly businessMomentum: FundamentalAdvisorSection;
}

export interface NormalizedCompanyProfile {
  readonly symbol: string;
  readonly companyName: string | null;
  readonly industry: string | null;
  readonly sector: string | null;
  readonly marketCap: number | null;
  readonly price: number | null;
  readonly beta: number | null;
}

export interface NormalizedIncomeStatement {
  readonly date: string;
  readonly revenue: number | null;
  readonly netIncome: number | null;
  readonly grossProfitRatio: number | null;
  readonly operatingIncomeRatio: number | null;
  readonly eps: number | null;
}

export interface NormalizedBalanceSheet {
  readonly date: string;
  readonly totalAssets: number | null;
  readonly totalLiabilities: number | null;
  readonly totalDebt: number | null;
  readonly cashAndShortTermInvestments: number | null;
}

export interface NormalizedCashFlow {
  readonly date: string;
  readonly operatingCashFlow: number | null;
  readonly freeCashFlow: number | null;
  readonly capitalExpenditure: number | null;
}

export interface NormalizedKeyMetrics {
  readonly date: string;
  readonly marketCap: number | null;
  readonly peRatio: number | null;
  readonly priceToSalesRatio: number | null;
  readonly freeCashFlowYield: number | null;
  readonly debtToEquity: number | null;
}

export interface NormalizedFinancialRatios {
  readonly date: string;
  readonly grossProfitMargin: number | null;
  readonly operatingProfitMargin: number | null;
  readonly netProfitMargin: number | null;
  readonly currentRatio: number | null;
  readonly debtEquityRatio: number | null;
}

export interface NormalizedFinancialGrowth {
  readonly date: string;
  readonly revenueGrowth: number | null;
  readonly netIncomeGrowth: number | null;
  readonly epsGrowth: number | null;
  readonly operatingCashFlowGrowth: number | null;
  readonly freeCashFlowGrowth: number | null;
}

export interface FundamentalsData {
  readonly symbol: string;
  readonly companyProfiles: readonly NormalizedCompanyProfile[];
  readonly incomeStatements: readonly NormalizedIncomeStatement[];
  readonly balanceSheets: readonly NormalizedBalanceSheet[];
  readonly cashFlows: readonly NormalizedCashFlow[];
  readonly keyMetrics: readonly NormalizedKeyMetrics[];
  readonly financialRatios: readonly NormalizedFinancialRatios[];
  readonly financialGrowth: readonly NormalizedFinancialGrowth[];
  readonly sources: {
    readonly fmp: {
      readonly status: ProviderStatus;
      readonly message: string;
    };
  };
  readonly diagnostics: readonly FundamentalEndpointDiagnostic[];
  readonly freshness: {
    readonly asOf: string;
    readonly period: "annual";
    readonly limit: number;
  };
}
