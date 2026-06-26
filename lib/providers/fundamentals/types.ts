import type {
  NormalizedBalanceSheet,
  NormalizedCashFlow,
  NormalizedCompanyProfile,
  NormalizedFinancialGrowth,
  NormalizedFinancialRatios,
  NormalizedIncomeStatement,
  NormalizedKeyMetrics,
} from "@/types/fundamentals";

export interface FundamentalsProvider {
  readonly id: "fmp";
  readonly isConfigured: boolean;
  getCompanyProfiles(symbol: string): Promise<readonly NormalizedCompanyProfile[]>;
  getIncomeStatements(symbol: string): Promise<readonly NormalizedIncomeStatement[]>;
  getBalanceSheets(symbol: string): Promise<readonly NormalizedBalanceSheet[]>;
  getCashFlows(symbol: string): Promise<readonly NormalizedCashFlow[]>;
  getKeyMetrics(symbol: string): Promise<readonly NormalizedKeyMetrics[]>;
  getFinancialRatios(symbol: string): Promise<readonly NormalizedFinancialRatios[]>;
  getFinancialGrowth(symbol: string): Promise<readonly NormalizedFinancialGrowth[]>;
}
