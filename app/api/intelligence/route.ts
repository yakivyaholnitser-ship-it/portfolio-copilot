import { apiError, ok } from "@/lib/api/http";
import { getIntelligence } from "@/lib/intelligence/get-intelligence";
import { normalizeSymbol } from "@/lib/utils/symbol";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = normalizeSymbol(searchParams.get("symbol"));

  if (!symbol) {
    return apiError(
      "INVALID_SYMBOL",
      "Provide a valid symbol query parameter, for example /api/intelligence?symbol=STX.",
      { status: 400 },
    );
  }

  return ok(await getIntelligence(symbol));
}
