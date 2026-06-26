import { apiError, ok } from "@/lib/api/http";
import { createOpenAiBrief } from "@/lib/brief/openai-brief-provider";
import { scoreStock } from "@/lib/decision/score-stock";
import {
  getPortfolio,
  PortfolioNotFoundError,
} from "@/lib/portfolio/get-portfolio";
import { normalizeSymbol } from "@/lib/utils/symbol";
import { toBriefInput, type BriefResponse } from "@/types/brief";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user")?.trim().toLowerCase();
  const symbol = normalizeSymbol(searchParams.get("symbol"));

  if (!userId) {
    return apiError(
      "INVALID_USER",
      "Provide a valid user query parameter, for example /api/brief?user=yakiv.",
      { status: 400 },
    );
  }

  try {
    const portfolio = await getPortfolio({ userId, symbol });
    const briefInput = toBriefInput(portfolio);
    const decision = scoreStock({
      quote: portfolio.quote,
      positions: portfolio.positions,
    });
    const brief = await createOpenAiBrief(briefInput, decision);
    const response: BriefResponse = {
      ...portfolio,
      decision,
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
