"use client";

import { useEffect, useState } from "react";

import { ActionCard } from "@/components/dashboard/action-card";
import { AiBriefCard } from "@/components/dashboard/ai-brief-card";
import { DailyChangeCard } from "@/components/dashboard/daily-change-card";
import { DecisionFactorsCard } from "@/components/dashboard/decision-factors-card";
import { PositionCard } from "@/components/dashboard/position-card";
import { PriceCard } from "@/components/dashboard/price-card";
import { getInvestorOptions } from "@/lib/config/portfolio";
import type { ApiResponse } from "@/types/api";
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
    };

const investorOptions = getInvestorOptions();

function isErrorResponse<TData>(
  response: ApiResponse<TData>,
): response is Extract<ApiResponse<TData>, { error: unknown }> {
  return "error" in response;
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
        });

        const briefResponse = await fetch(`/api/brief?${params.toString()}`, {
          signal: controller.signal,
        });
        const briefPayload =
          (await briefResponse.json()) as ApiResponse<BriefResponse>;

        if (!briefResponse.ok || isErrorResponse(briefPayload)) {
          return;
        }

        setState({
          status: "ready",
          copilot: copilotPayload.data,
          brief: briefPayload.data,
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
            Deterministic product answers, decision factors, owner-level P/L,
            and an AI-written explanation for the configured STX portfolio.
          </p>
        </header>

        <UserSwitcher
          selectedUserId={selectedUserId}
          onSelect={setSelectedUserId}
        />

        {state.status === "loading" ? <DashboardLoading /> : null}
        {state.status === "error" ? <DashboardError message={state.message} /> : null}
        {state.status === "ready" ? (
          <DashboardReady copilot={state.copilot} brief={state.brief} />
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
}: {
  readonly copilot: CopilotResponse;
  readonly brief: BriefResponse | null;
}) {
  return (
    <div className="grid gap-6">
      <ActionCard recommendation={copilot.questions.shouldIDoAnything} />
      <DailyChangeCard summary={copilot.questions.whatChangedToday} />
      <DecisionFactorsCard decision={copilot.decision} />
      <PriceCard quote={copilot.quote} />

      <section className="grid gap-4 lg:grid-cols-2">
        {copilot.positions.map((position) => (
          <PositionCard key={position.owner} position={position} />
        ))}
      </section>

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
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="grid gap-6">
      <div className="h-56 animate-pulse rounded-lg border border-white/10 bg-white/[0.06]" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-52 animate-pulse rounded-lg border border-white/10 bg-white/[0.05]" />
        <div className="h-52 animate-pulse rounded-lg border border-white/10 bg-white/[0.05]" />
      </div>
      <div className="h-64 animate-pulse rounded-lg border border-white/10 bg-white/[0.06]" />
    </div>
  );
}

function DashboardError({ message }: { readonly message: string }) {
  return (
    <section className="rounded-lg border border-rose-300/20 bg-rose-950/30 p-6">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-rose-200">
        Could not load dashboard
      </p>
      <p className="mt-3 text-lg text-rose-50">{message}</p>
    </section>
  );
}
