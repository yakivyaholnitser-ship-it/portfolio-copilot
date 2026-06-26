import type {
  NormalizedBalanceSheet,
  NormalizedCashFlow,
  NormalizedCompanyProfile,
  NormalizedFinancialGrowth,
  NormalizedFinancialRatios,
  NormalizedIncomeStatement,
  NormalizedKeyMetrics,
} from "@/types/fundamentals";

import type { FundamentalsProvider } from "./types";

interface FmpIncomeStatement {
  readonly date?: string;
  readonly revenue?: number;
  readonly netIncome?: number;
  readonly grossProfitRatio?: number;
  readonly operatingIncomeRatio?: number;
  readonly eps?: number;
}

interface FmpCompanyProfile {
  readonly symbol?: string;
  readonly companyName?: string;
  readonly companyNameLong?: string;
  readonly industry?: string;
  readonly sector?: string;
  readonly marketCap?: number;
  readonly price?: number;
  readonly beta?: number;
}

interface FmpBalanceSheet {
  readonly date?: string;
  readonly totalAssets?: number;
  readonly totalLiabilities?: number;
  readonly totalDebt?: number;
  readonly cashAndShortTermInvestments?: number;
}

interface FmpCashFlow {
  readonly date?: string;
  readonly operatingCashFlow?: number;
  readonly freeCashFlow?: number;
  readonly capitalExpenditure?: number;
}

interface FmpKeyMetrics {
  readonly date?: string;
  readonly marketCap?: number;
  readonly peRatio?: number;
  readonly priceToSalesRatio?: number;
  readonly freeCashFlowYield?: number;
  readonly debtToEquity?: number;
}

interface FmpFinancialRatios {
  readonly date?: string;
  readonly grossProfitMargin?: number;
  readonly operatingProfitMargin?: number;
  readonly netProfitMargin?: number;
  readonly currentRatio?: number;
  readonly debtEquityRatio?: number;
}

interface FmpFinancialGrowth {
  readonly date?: string;
  readonly revenueGrowth?: number;
  readonly growthRevenue?: number;
  readonly netIncomeGrowth?: number;
  readonly growthNetIncome?: number;
  readonly epsgrowth?: number;
  readonly epsGrowth?: number;
  readonly operatingCashFlowGrowth?: number;
  readonly growthOperatingCashFlow?: number;
  readonly freeCashFlowGrowth?: number;
  readonly growthFreeCashFlow?: number;
}

export class FmpProviderError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly endpoint: string,
  ) {
    super(message);
    this.name = "FmpProviderError";
  }
}

const baseUrl = "https://financialmodelingprep.com/stable";
const limit = "5";

function safeNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export class FmpFundamentalsProvider implements FundamentalsProvider {
  readonly id = "fmp";
  readonly isConfigured: boolean;

  constructor(private readonly apiKey = process.env.FMP_API_KEY) {
    this.isConfigured = Boolean(apiKey);
  }

  async getCompanyProfiles(
    symbol: string,
  ): Promise<readonly NormalizedCompanyProfile[]> {
    if (!this.apiKey) {
      return [];
    }

    const payload = await this.request<readonly FmpCompanyProfile[]>(
      "/profile",
      symbol,
    );

    return payload.map((item) => ({
      symbol: item.symbol ?? symbol,
      companyName: item.companyName ?? item.companyNameLong ?? null,
      industry: item.industry ?? null,
      sector: item.sector ?? null,
      marketCap: safeNumber(item.marketCap),
      price: safeNumber(item.price),
      beta: safeNumber(item.beta),
    }));
  }

  async getIncomeStatements(
    symbol: string,
  ): Promise<readonly NormalizedIncomeStatement[]> {
    if (!this.apiKey) {
      return [];
    }

    const payload = await this.request<readonly FmpIncomeStatement[]>(
      "/income-statement",
      symbol,
    );

    return payload.map((item) => ({
      date: item.date ?? "unknown",
      revenue: safeNumber(item.revenue),
      netIncome: safeNumber(item.netIncome),
      grossProfitRatio: safeNumber(item.grossProfitRatio),
      operatingIncomeRatio: safeNumber(item.operatingIncomeRatio),
      eps: safeNumber(item.eps),
    }));
  }

  async getBalanceSheets(
    symbol: string,
  ): Promise<readonly NormalizedBalanceSheet[]> {
    if (!this.apiKey) {
      return [];
    }

    const payload = await this.request<readonly FmpBalanceSheet[]>(
      "/balance-sheet-statement",
      symbol,
    );

    return payload.map((item) => ({
      date: item.date ?? "unknown",
      totalAssets: safeNumber(item.totalAssets),
      totalLiabilities: safeNumber(item.totalLiabilities),
      totalDebt: safeNumber(item.totalDebt),
      cashAndShortTermInvestments: safeNumber(item.cashAndShortTermInvestments),
    }));
  }

  async getCashFlows(symbol: string): Promise<readonly NormalizedCashFlow[]> {
    if (!this.apiKey) {
      return [];
    }

    const payload = await this.request<readonly FmpCashFlow[]>(
      "/cash-flow-statement",
      symbol,
    );

    return payload.map((item) => ({
      date: item.date ?? "unknown",
      operatingCashFlow: safeNumber(item.operatingCashFlow),
      freeCashFlow: safeNumber(item.freeCashFlow),
      capitalExpenditure: safeNumber(item.capitalExpenditure),
    }));
  }

  async getKeyMetrics(symbol: string): Promise<readonly NormalizedKeyMetrics[]> {
    if (!this.apiKey) {
      return [];
    }

    const payload = await this.request<readonly FmpKeyMetrics[]>(
      "/key-metrics",
      symbol,
    );

    return payload.map((item) => ({
      date: item.date ?? "unknown",
      marketCap: safeNumber(item.marketCap),
      peRatio: safeNumber(item.peRatio),
      priceToSalesRatio: safeNumber(item.priceToSalesRatio),
      freeCashFlowYield: safeNumber(item.freeCashFlowYield),
      debtToEquity: safeNumber(item.debtToEquity),
    }));
  }

  async getFinancialRatios(
    symbol: string,
  ): Promise<readonly NormalizedFinancialRatios[]> {
    if (!this.apiKey) {
      return [];
    }

    const payload = await this.request<readonly FmpFinancialRatios[]>(
      "/ratios",
      symbol,
    );

    return payload.map((item) => ({
      date: item.date ?? "unknown",
      grossProfitMargin: safeNumber(item.grossProfitMargin),
      operatingProfitMargin: safeNumber(item.operatingProfitMargin),
      netProfitMargin: safeNumber(item.netProfitMargin),
      currentRatio: safeNumber(item.currentRatio),
      debtEquityRatio: safeNumber(item.debtEquityRatio),
    }));
  }

  async getFinancialGrowth(
    symbol: string,
  ): Promise<readonly NormalizedFinancialGrowth[]> {
    if (!this.apiKey) {
      return [];
    }

    const payload = await this.request<readonly FmpFinancialGrowth[]>(
      "/financial-growth",
      symbol,
    );

    return payload.map((item) => ({
      date: item.date ?? "unknown",
      revenueGrowth: safeNumber(item.revenueGrowth ?? item.growthRevenue),
      netIncomeGrowth: safeNumber(item.netIncomeGrowth ?? item.growthNetIncome),
      epsGrowth: safeNumber(item.epsGrowth ?? item.epsgrowth),
      operatingCashFlowGrowth: safeNumber(
        item.operatingCashFlowGrowth ?? item.growthOperatingCashFlow,
      ),
      freeCashFlowGrowth: safeNumber(
        item.freeCashFlowGrowth ?? item.growthFreeCashFlow,
      ),
    }));
  }

  private async request<TResponse>(
    path: string,
    symbol: string,
  ): Promise<TResponse> {
    const url = new URL(`${baseUrl}${path}`);
    url.searchParams.set("symbol", symbol);
    if (path !== "/profile") {
      url.searchParams.set("period", "annual");
      url.searchParams.set("limit", limit);
    }
    url.searchParams.set("apikey", this.apiKey ?? "");

    const response = await fetch(url, {
      headers: {
        accept: "application/json",
      },
      next: {
        revalidate: 86_400,
      },
    });

    if (!response.ok) {
      throw new FmpProviderError(
        `FMP ${path} request failed with ${response.status}.`,
        response.status,
        path,
      );
    }

    return (await response.json()) as TResponse;
  }
}
