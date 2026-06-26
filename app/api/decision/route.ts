import { apiError, ok } from "@/lib/api/http";
import { scoreStock } from "@/lib/decision/score-stock";
import {
  getPortfolio,
  PortfolioNotFoundError,
} from "@/lib/portfolio/get-portfolio";
import { normalizeSymbol } from "@/lib/utils/symbol";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user")?.trim().toLowerCase();
  const symbol = normalizeSymbol(searchParams.get("symbol"));

  if (!userId) {
    return apiError(
      "INVALID_USER",
      "Provide a valid user query parameter, for example /api/decision?user=yakiv.",
      { status: 400 },
    );
  }

  try {
    const portfolio = await getPortfolio({ userId, symbol });
    const decision = scoreStock({
      quote: portfolio.quote,
      positions: portfolio.positions,
    });

    return ok(decision);
  } catch (error) {
    if (error instanceof PortfolioNotFoundError) {
      return apiError("PORTFOLIO_NOT_FOUND", error.message, { status: 404 });
    }

    const message =
      error instanceof Error
        ? error.message
        : "Unable to score stock decision.";

    return apiError("DECISION_PROVIDER_ERROR", message, { status: 502 });
  }
}
