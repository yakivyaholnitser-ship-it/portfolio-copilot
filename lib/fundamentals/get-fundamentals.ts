import { getFundamentalsProvider } from "@/lib/providers/fundamentals";
import { FmpProviderError } from "@/lib/providers/fundamentals/fmp-provider";
import type {
  FundamentalEndpointDiagnostic,
  FundamentalsData,
} from "@/types/fundamentals";

const statementLimit = 5;

function emptyFundamentals(symbol: string, message: string): FundamentalsData {
  return {
    symbol,
    companyProfiles: [],
    incomeStatements: [],
    balanceSheets: [],
    cashFlows: [],
    keyMetrics: [],
    financialRatios: [],
    financialGrowth: [],
    sources: {
      fmp: {
        status: "missing_api_key",
        message,
      },
    },
    diagnostics: [
      {
        endpoint: "all",
        status: "skipped",
        message,
        itemCount: 0,
      },
    ],
    freshness: {
      asOf: new Date().toISOString(),
      period: "annual",
      limit: statementLimit,
    },
  };
}

function diagnosticFromError(
  endpoint: string,
  error: unknown,
): FundamentalEndpointDiagnostic {
  if (error instanceof FmpProviderError) {
    const isPlanRestricted = error.status === 402 || error.status === 403;

    return {
      endpoint,
      status: isPlanRestricted ? "forbidden" : "error",
      message: isPlanRestricted
        ? `FMP ${endpoint} is unavailable on the current plan.`
        : error.message,
      itemCount: 0,
    };
  }

  return {
    endpoint,
    status: "error",
    message:
      error instanceof Error
        ? error.message
        : `FMP ${endpoint} request failed.`,
    itemCount: 0,
  };
}

async function safeEndpoint<TData extends readonly unknown[]>(
  endpoint: string,
  load: () => Promise<TData>,
): Promise<{
  readonly data: TData;
  readonly diagnostic: FundamentalEndpointDiagnostic;
}> {
  try {
    const data = await load();

    return {
      data,
      diagnostic: {
        endpoint,
        status: "ok",
        message: `Loaded ${endpoint}.`,
        itemCount: data.length,
      },
    };
  } catch (error) {
    return {
      data: [] as unknown as TData,
      diagnostic: diagnosticFromError(endpoint, error),
    };
  }
}

export async function getFundamentals(symbol: string): Promise<FundamentalsData> {
  const normalizedSymbol = symbol.toUpperCase();
  const provider = getFundamentalsProvider();

  if (!provider.isConfigured) {
    return emptyFundamentals(normalizedSymbol, "FMP_API_KEY is not configured.");
  }

  const [
    companyProfilesResult,
    keyMetricsResult,
    financialRatiosResult,
    financialGrowthResult,
    incomeStatementsResult,
    balanceSheetsResult,
    cashFlowsResult,
  ] = await Promise.all([
    safeEndpoint("stable/profile", () =>
      provider.getCompanyProfiles(normalizedSymbol),
    ),
    safeEndpoint("stable/key-metrics", () =>
      provider.getKeyMetrics(normalizedSymbol),
    ),
    safeEndpoint("stable/ratios", () =>
      provider.getFinancialRatios(normalizedSymbol),
    ),
    safeEndpoint("stable/financial-growth", () =>
      provider.getFinancialGrowth(normalizedSymbol),
    ),
    safeEndpoint("stable/income-statement", () =>
      provider.getIncomeStatements(normalizedSymbol),
    ),
    safeEndpoint("stable/balance-sheet-statement", () =>
      provider.getBalanceSheets(normalizedSymbol),
    ),
    safeEndpoint("stable/cash-flow-statement", () =>
      provider.getCashFlows(normalizedSymbol),
    ),
  ]);
  const diagnostics = [
    companyProfilesResult.diagnostic,
    keyMetricsResult.diagnostic,
    financialRatiosResult.diagnostic,
    financialGrowthResult.diagnostic,
    incomeStatementsResult.diagnostic,
    balanceSheetsResult.diagnostic,
    cashFlowsResult.diagnostic,
  ];
  const loadedCount = diagnostics.filter((item) => item.status === "ok").length;
  const hasErrors = diagnostics.some((item) => item.status !== "ok");

  return {
    symbol: normalizedSymbol,
    companyProfiles: companyProfilesResult.data,
    incomeStatements: incomeStatementsResult.data,
    balanceSheets: balanceSheetsResult.data,
    cashFlows: cashFlowsResult.data,
    keyMetrics: keyMetricsResult.data,
    financialRatios: financialRatiosResult.data,
    financialGrowth: financialGrowthResult.data,
    sources: {
      fmp: {
        status: loadedCount === 0 ? "error" : hasErrors ? "partial" : "available",
        message:
          loadedCount === 0
            ? "No FMP fundamentals endpoints loaded."
            : hasErrors
              ? "Partial FMP fundamentals loaded; some endpoints are unavailable on this plan."
              : "FMP fundamentals loaded.",
      },
    },
    diagnostics,
    freshness: {
      asOf: new Date().toISOString(),
      period: "annual",
      limit: statementLimit,
    },
  };
}
