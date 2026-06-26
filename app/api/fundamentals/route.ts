import { apiError, ok } from "@/lib/api/http";
import { createFundamentalAdvisor } from "@/lib/fundamentals/fundamental-advisor";
import { getFundamentals } from "@/lib/fundamentals/get-fundamentals";
import { normalizeSymbol } from "@/lib/utils/symbol";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = normalizeSymbol(searchParams.get("symbol"));

  if (!symbol) {
    return apiError(
      "INVALID_SYMBOL",
      "Provide a valid symbol query parameter, for example /api/fundamentals?symbol=STX.",
      { status: 400 },
    );
  }

  const fundamentals = await getFundamentals(symbol);

  return ok({
    symbol,
    fundamentals,
    advisor: createFundamentalAdvisor(fundamentals),
  });
}
