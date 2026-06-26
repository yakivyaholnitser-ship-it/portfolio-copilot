"use client";

import { useEffect, useState } from "react";

import { AiBriefCard } from "@/components/dashboard/ai-brief-card";
import { PositionCard } from "@/components/dashboard/position-card";
import { PriceCard } from "@/components/dashboard/price-card";
import type { ApiResponse } from "@/types/api";
import type { BriefResponse } from "@/types/brief";

interface PortfolioDashboardProps {
  readonly symbol: string;
}

type LoadState =
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly message: string }
  | { readonly status: "ready"; readonly data: BriefResponse };

function isErrorResponse<TData>(
  response: ApiResponse<TData>,
): response is Extract<ApiResponse<TData>, { error: unknown }> {
  return "error" in response;
}

export function PortfolioDashboard({ symbol }: PortfolioDashboardProps) {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    async function loadBrief() {
      setState({ status: "loading" });

      try {
        const response = await fetch(`/api/brief?symbol=${encodeURIComponent(symbol)}`, {
          signal: controller.signal,
        });
        const payload = (await response.json()) as ApiResponse<BriefResponse>;

        if (!response.ok || isErrorResponse(payload)) {
          const message = isErrorResponse(payload)
            ? payload.error.message
            : "Unable to load portfolio brief.";

          setState({ status: "error", message });
          return;
        }

        setState({ status: "ready", data: payload.data });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Unable to load portfolio brief.",
        });
      }
    }

    void loadBrief();

    return () => {
      controller.abort();
    };
  }, [symbol]);

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
              {symbol} dashboard
            </h1>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-400">
            Live quote context, owner-level P/L, and a concise AI brief for the
            configured STX portfolio.
          </p>
        </header>

        {state.status === "loading" ? <DashboardLoading /> : null}
        {state.status === "error" ? <DashboardError message={state.message} /> : null}
        {state.status === "ready" ? <DashboardReady data={state.data} /> : null}
      </div>
    </main>
  );
}

function DashboardReady({ data }: { readonly data: BriefResponse }) {
  return (
    <div className="grid gap-6">
      <PriceCard quote={data.quote} />

      <section className="grid gap-4 lg:grid-cols-2">
        {data.positions.map((position) => (
          <PositionCard key={position.owner} position={position} />
        ))}
      </section>

      <AiBriefCard brief={data.brief} disclaimer={data.disclaimer} />
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
