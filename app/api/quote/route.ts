import { apiError, ok } from "@/lib/api/http";
import { getQuoteProvider } from "@/lib/providers/quotes";
import { normalizeSymbol } from "@/lib/utils/symbol";
import type { QuoteResponse } from "@/types/quote";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = normalizeSymbol(searchParams.get("symbol"));

  if (!symbol) {
    return apiError(
      "INVALID_SYMBOL",
      "Provide a valid symbol query parameter, for example /api/quote?symbol=AAPL.",
      { status: 400 },
    );
  }

  try {
    const quote = await getQuoteProvider().getQuote({ symbol });
    const response: QuoteResponse = { quote };

    return ok(response);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to retrieve quote data.";

    return apiError("QUOTE_PROVIDER_ERROR", message, { status: 502 });
  }
}
