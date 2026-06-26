import { buildAdvisors } from "@/lib/advisors/build-advisors";
import type { Advisor, AdvisorContext } from "@/types/advisor";
import type {
  ActionAnswer,
  ActionRecommendation,
  CopilotResponse,
  InvestmentBrain,
  InvestmentBrainKind,
  MorningBrief,
  MorningBriefBrains,
} from "@/types/copilot";
import type { DecisionResult } from "@/types/decision";
import type { PortfolioResponse } from "@/types/portfolio";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatPercent(value: number) {
  const rounded = Math.abs(value) < 0.05 ? 0 : value;

  return `${rounded > 0 ? "+" : ""}${rounded.toFixed(1)}%`;
}

function shorten(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trim()}...`;
}

function estimateReadingTime(textParts: readonly string[]) {
  const words = textParts
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 180));

  return `${minutes} min`;
}

function advisorToBrain(kind: InvestmentBrainKind, advisor: Advisor): InvestmentBrain {
  return {
    kind,
    headline: advisor.title,
    summary: advisor.summary,
    importance: advisor.importance,
    confidence: advisor.confidence,
  };
}

function getAdvisor(advisors: readonly Advisor[], id: Advisor["id"]) {
  return advisors.find((advisor) => advisor.id === id);
}

function requireAdvisor(advisors: readonly Advisor[], id: Advisor["id"]) {
  const advisor = getAdvisor(advisors, id);

  if (!advisor) {
    throw new Error(`Missing advisor: ${id}`);
  }

  return advisor;
}

function createBrains(advisors: readonly Advisor[]): MorningBriefBrains {
  return {
    market: advisorToBrain("market", requireAdvisor(advisors, "market")),
    analyst: advisorToBrain("analyst", requireAdvisor(advisors, "analyst")),
    fundamental: advisorToBrain("fundamental", requireAdvisor(advisors, "fundamental")),
    portfolio: advisorToBrain("portfolio", requireAdvisor(advisors, "portfolio")),
    risk: advisorToBrain("risk", requireAdvisor(advisors, "insider")),
    opportunity: advisorToBrain("opportunity", requireAdvisor(advisors, "opportunity")),
    calendar: advisorToBrain("calendar", requireAdvisor(advisors, "earnings")),
  };
}

function getUserAction(answer: ActionAnswer, portfolio: PortfolioResponse) {
  const position = portfolio.positions[0];

  if (!position) {
    return "No configured position.";
  }

  if (answer === "Consider trimming" && position.gainPercent > 50) {
    return "Large gain; review target and concentration.";
  }

  if (answer === "Caution" && !position.isPositive) {
    return "Below entry; avoid reacting to one daily move.";
  }

  if (answer === "Review") {
    return "Review the position, but no immediate trade is suggested.";
  }

  return "No immediate action suggested.";
}

function createTodaysDecision(
  portfolio: PortfolioResponse,
  decision: DecisionResult,
  advisors: readonly Advisor[],
): ActionRecommendation {
  const position = portfolio.positions[0];
  const dailyMove = Math.abs(portfolio.quote.todayChangePercent);
  const hasLargeWinner = Boolean(position && position.gainPercent >= 50);
  const hasMeaningfulLoser = Boolean(position && position.gainPercent <= -10);
  const insiderAdvisor = getAdvisor(advisors, "insider");
  const riskIsElevated =
    dailyMove >= 5 ||
    Boolean(
      insiderAdvisor &&
        insiderAdvisor.signal !== "neutral" &&
        insiderAdvisor.importance >= 75,
    );
  let answer: ActionAnswer = "No action";
  let reason = "The advisor framework does not suggest immediate action today.";

  if (riskIsElevated) {
    answer = "Review";
    reason = "Risk is elevated, but the brief does not suggest an immediate trade.";
  } else if (decision.signal === "Caution") {
    answer = "Caution";
    reason = "Risk is high enough that the next decision should be slower and more deliberate.";
  } else if (hasLargeWinner && decision.totalScore >= 70) {
    answer = "Consider trimming";
    reason = "The strongest signal is a large unrealized gain with a favorable decision score.";
  } else if (hasMeaningfulLoser || decision.totalScore < 70) {
    answer = "Review";
    reason = "The setup is mixed enough to review the position without rushing.";
  }

  return {
    answer,
    confidence: Math.round(clamp(decision.totalScore, 0, 100)),
    reason,
    userAction: getUserAction(answer, portfolio),
  };
}

function createWhatChangedBullets(
  portfolio: PortfolioResponse,
  advisors: readonly Advisor[],
) {
  const quote = portfolio.quote;
  const marketBullet = `${portfolio.symbol} ${quote.todayChangePercent >= 0 ? "rose" : "fell"} ${formatPercent(quote.todayChangePercent)} today.`;
  const newsAdvisor = getAdvisor(advisors, "news");
  const analystAdvisor = getAdvisor(advisors, "analyst");
  const insiderAdvisor = getAdvisor(advisors, "insider");
  const fundamentalAdvisor = getAdvisor(advisors, "fundamental");
  const bullets = [
    marketBullet,
    newsAdvisor && newsAdvisor.signal !== "unavailable"
      ? shorten(newsAdvisor.summary, 96)
      : null,
    analystAdvisor && analystAdvisor.signal !== "unavailable"
      ? shorten(analystAdvisor.summary, 86)
      : null,
    insiderAdvisor && insiderAdvisor.signal === "review"
      ? "Recent insider activity deserves monitoring."
      : null,
    fundamentalAdvisor && fundamentalAdvisor.signal !== "unavailable"
      ? shorten(fundamentalAdvisor.summary, 86)
      : null,
  ].filter((bullet): bullet is string => Boolean(bullet));

  return bullets.slice(0, 4);
}

function selectBiggestRisk(advisors: readonly Advisor[]) {
  const insiderAdvisor = getAdvisor(advisors, "insider");

  if (
    insiderAdvisor &&
    ["caution", "review"].includes(insiderAdvisor.signal)
  ) {
    return insiderAdvisor.summary;
  }

  const candidates = advisors.filter((advisor) =>
    ["earnings", "fundamental", "market"].includes(advisor.id),
  );
  const riskSignals = candidates.filter((advisor) =>
    ["caution", "review"].includes(advisor.signal),
  );
  const ranked = [...(riskSignals.length > 0 ? riskSignals : candidates)].sort(
    (a, b) => b.importance - a.importance,
  );

  return ranked[0]?.summary ?? "No major risk was detected today.";
}

function BriefEngine(context: AdvisorContext, advisors: readonly Advisor[]): MorningBrief {
  const { portfolio, decision } = context;
  const brains = createBrains(advisors);
  const todaysDecision = createTodaysDecision(portfolio, decision, advisors);
  const marketAdvisor = requireAdvisor(advisors, "market");
  const portfolioAdvisor = requireAdvisor(advisors, "portfolio");
  const opportunityAdvisor = requireAdvisor(advisors, "opportunity");
  const earningsAdvisor = requireAdvisor(advisors, "earnings");
  const changedBullets = createWhatChangedBullets(portfolio, advisors);
  const textParts = [
    todaysDecision.reason,
    ...advisors.flatMap((advisor) => [advisor.summary, ...advisor.reasoning]),
  ];

  return {
    todaysDecision,
    why: `${marketAdvisor.summary} ${portfolioAdvisor.summary} ${decision.explanation}`,
    biggestOpportunity: opportunityAdvisor.summary,
    biggestRisk: selectBiggestRisk(advisors),
    whatChangedOvernight: {
      headline: marketAdvisor.summary,
      bullets: changedBullets,
    },
    upcomingEvents: [earningsAdvisor.summary],
    estimatedReadingTime: estimateReadingTime(textParts),
    brains,
    advisors,
  };
}

export function buildCopilotResponse(
  context: AdvisorContext,
  advisors: readonly Advisor[] = buildAdvisors(context),
): CopilotResponse {
  const { portfolio } = context;

  return {
    userId: portfolio.userId,
    displayName: portfolio.displayName,
    symbol: portfolio.symbol,
    quote: portfolio.quote,
    positions: portfolio.positions,
    decision: context.decision,
    intelligence: context.intelligence,
    fundamentals: context.fundamentals,
    fundamentalAdvisor: context.fundamentalAdvisor,
    advisors,
    morningBrief: BriefEngine(context, advisors),
    disclaimer: "Not financial advice.",
  };
}
