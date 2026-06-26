import { apiError, ok } from "@/lib/api/http";
import { createOpenAiBrief } from "@/lib/brief/openai-brief-provider";
import {
  getPortfolio,
  PortfolioNotFoundError,
} from "@/lib/portfolio/get-portfolio";
import { normalizeSymbol } from "@/lib/utils/symbol";
import { toBriefInput, type BriefResponse } from "@/types/brief";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = normalizeSymbol(searchParams.get("symbol"));

  if (!symbol) {
    return apiError(
      "INVALID_SYMBOL",
      "Provide a valid symbol query parameter, for example /api/brief?symbol=STX.",
      { status: 400 },
    );
  }

  try {
    const portfolio = await getPortfolio(symbol);
    const briefInput = toBriefInput(portfolio);
    const brief = await createOpenAiBrief(briefInput);
    const response: BriefResponse = {
      ...portfolio,
      brief,
      disclaimer: "Not financial advice.",
    };

    return ok(response);
  } catch (error) {
    if (error instanceof PortfolioNotFoundError) {
      return apiError("PORTFOLIO_NOT_FOUND", error.message, { status: 404 });
    }

    const message =
      error instanceof Error
        ? error.message
        : "Unable to retrieve brief data.";

    return apiError("BRIEF_PROVIDER_ERROR", message, { status: 502 });
  }
}
