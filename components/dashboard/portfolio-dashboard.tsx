"use client";

import { useEffect, useState } from "react";

import { AiBriefCard } from "@/components/dashboard/ai-brief-card";
import { BriefSectionCard } from "@/components/dashboard/brief-section-card";
import { DecisionFactorsCard } from "@/components/dashboard/decision-factors-card";
import { HowBriefBuiltCard } from "@/components/dashboard/how-brief-built-card";
import { InvestmentCommittee } from "@/components/dashboard/investment-committee";
import { MorningBriefHero } from "@/components/dashboard/morning-brief-hero";
import { PositionCard } from "@/components/dashboard/position-card";
import { PriceCard } from "@/components/dashboard/price-card";
import { getInvestorOptions } from "@/lib/config/portfolio";
import type { ApiResponse } from "@/types/api";
import type { AdvisorsResponse } from "@/types/advisor";
import type { BriefResponse } from "@/types/brief";
import type { CopilotResponse } from "@/types/copilot";

interface PortfolioDashboardProps {
  readonly symbol: string;
}

type LoadState =
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly message: string }
  | {
      readonly status: "ready";
      readonly copilot: CopilotResponse;
      readonly brief: BriefResponse | null;
      readonly advisors: AdvisorsResponse | null;
    };

const investorOptions = getInvestorOptions();

function isErrorResponse<TData>(
  response: ApiResponse<TData>,
): response is Extract<ApiResponse<TData>, { error: unknown }> {
  return "error" in response;
}

async function readOptionalData<TData>(
  result: PromiseSettledResult<Response>,
): Promise<TData | null> {
  if (result.status === "rejected") {
    return null;
  }

  try {
    const payload = (await result.value.json()) as ApiResponse<TData>;

    if (!result.value.ok || isErrorResponse(payload)) {
      return null;
    }

    return payload.data;
  } catch {
    return null;
  }
}

export function PortfolioDashboard({ symbol }: PortfolioDashboardProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>(
    investorOptions[0]?.id ?? "yakiv",
  );
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    async function loadDashboard() {
      setState({ status: "loading" });

      try {
        const params = new URLSearchParams({
          user: selectedUserId,
          symbol,
        });
        const copilotResponse = await fetch(`/api/copilot?${params.toString()}`, {
          signal: controller.signal,
        });
        const copilotPayload =
          (await copilotResponse.json()) as ApiResponse<CopilotResponse>;

        if (!copilotResponse.ok || isErrorResponse(copilotPayload)) {
          const message = isErrorResponse(copilotPayload)
            ? copilotPayload.error.message
            : "Unable to load portfolio copilot.";

          setState({ status: "error", message });
          return;
        }

        setState({
          status: "ready",
          copilot: copilotPayload.data,
          brief: null,
          advisors: null,
        });

        const [briefResult, advisorsResult] = await Promise.allSettled([
          fetch(`/api/brief?${params.toString()}`, {
            signal: controller.signal,
          }),
          fetch(`/api/advisors?${params.toString()}`, {
            signal: controller.signal,
          }),
        ]);

        const brief = await readOptionalData<BriefResponse>(briefResult);
        const advisors = await readOptionalData<AdvisorsResponse>(advisorsResult);

        setState({
          status: "ready",
          copilot: copilotPayload.data,
          brief,
          advisors,
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Unable to load portfolio copilot.",
        });
      }
    }

    void loadDashboard();

    return () => {
      controller.abort();
    };
  }, [selectedUserId, symbol]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-blue-700/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 sm:py-14">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
              Portfolio Copilot
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {symbol} personal dashboard
            </h1>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-400">
            A calm morning briefing for the decision that matters today.
          </p>
        </header>

        <UserSwitcher
          selectedUserId={selectedUserId}
          onSelect={setSelectedUserId}
        />

        {state.status === "loading" ? <DashboardLoading /> : null}
        {state.status === "error" ? <DashboardError message={state.message} /> : null}
        {state.status === "ready" ? (
          <DashboardReady
            copilot={state.copilot}
            brief={state.brief}
            advisors={state.advisors}
          />
        ) : null}
      </div>
    </main>
  );
}

function UserSwitcher({
  selectedUserId,
  onSelect,
}: {
  readonly selectedUserId: string;
  readonly onSelect: (userId: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 rounded-lg border border-white/10 bg-white/[0.04] p-2">
      {investorOptions.map((investor) => {
        const isSelected = investor.id === selectedUserId;

        return (
          <button
            key={investor.id}
            type="button"
            onClick={() => onSelect(investor.id)}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
              isSelected
                ? "bg-cyan-300 text-slate-950"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            {investor.displayName}
          </button>
        );
      })}
    </div>
  );
}

function DashboardReady({
  copilot,
  brief,
  advisors,
}: {
  readonly copilot: CopilotResponse;
  readonly brief: BriefResponse | null;
  readonly advisors: AdvisorsResponse | null;
}) {
  return (
    <div className="grid gap-6">
      <MorningBriefHero copilot={copilot} />
      <MorningBriefSections copilot={copilot} />
      <InvestmentCommittee advisors={advisors?.advisors ?? copilot.advisors} />

      <DetailsSection copilot={copilot} />

      {brief ? (
        <AiBriefCard brief={brief.brief} disclaimer={brief.disclaimer} />
      ) : (
        <section className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            AI brief
          </p>
          <p className="mt-3 text-slate-300">Preparing explanation...</p>
        </section>
      )}

      <HowBriefBuiltCard />
    </div>
  );
}

function MorningBriefSections({ copilot }: { readonly copilot: CopilotResponse }) {
  return (
    <section className="grid gap-4">
      <BriefSectionCard
        title="Why"
        value={copilot.morningBrief.why}
        explanation="This connects the main recommendation to the market move, your personal position, and the deterministic score."
      />
      <BriefSectionCard
        title="What Changed Overnight"
        value={copilot.morningBrief.whatChangedOvernight.headline}
        bullets={copilot.morningBrief.whatChangedOvernight.bullets}
        explanation="This summarizes the new information the brief detected since the latest quote update."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <BriefSectionCard
          title="Biggest Risk"
          value={copilot.morningBrief.biggestRisk}
          explanation="This highlights what could make a rushed decision worse today."
        />
        <BriefSectionCard
          title="Biggest Opportunity"
          value={copilot.morningBrief.biggestOpportunity}
          explanation="This is the most useful thing to review today, not a prediction or buy signal."
        />
      </div>
      <BriefSectionCard
        title="Upcoming Events"
        bullets={copilot.morningBrief.upcomingEvents}
        explanation="This flags scheduled or session-related items that may affect when to check again."
      />
    </section>
  );
}

function DetailsSection({ copilot }: { readonly copilot: CopilotResponse }) {
  return (
    <section className="mt-4 grid gap-5 rounded-lg border border-white/10 bg-slate-950/40 p-5">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Details
        </p>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Market data, personal position P/L, and deterministic Decision Engine
          factors. Useful, but secondary to the morning brief.
        </p>
      </div>

      <PriceCard quote={copilot.quote} />

      <section className="grid gap-4 lg:grid-cols-2">
        {copilot.positions.map((position) => (
          <PositionCard key={`${position.owner}-${position.symbol}`} position={position} />
        ))}
      </section>

      <DecisionFactorsCard decision={copilot.decision} />
    </section>
  );
}

function DashboardLoading() {
  return (
    <div className="grid gap-6">
      <div className="h-80 animate-pulse rounded-lg border border-white/10 bg-white/[0.06]" />
      <div className="h-48 animate-pulse rounded-lg border border-white/10 bg-white/[0.04]" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-40 animate-pulse rounded-lg border border-white/10 bg-white/[0.04]" />
        <div className="h-40 animate-pulse rounded-lg border border-white/10 bg-white/[0.04]" />
      </div>
      <div className="h-64 animate-pulse rounded-lg border border-white/10 bg-white/[0.04]" />
    </div>
  );
}

function DashboardError({ message }: { readonly message: string }) {
  return (
    <section className="rounded-lg border border-rose-300/20 bg-rose-950/30 p-6">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-rose-200">
        Could not load briefing
      </p>
      <p className="mt-3 text-lg text-rose-50">{message}</p>
    </section>
  );
}
