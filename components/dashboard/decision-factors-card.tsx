import type { DecisionResult } from "@/types/decision";

interface DecisionFactorsCardProps {
  readonly decision: DecisionResult;
}

const factorLabels: Record<keyof DecisionResult["factorScores"], string> = {
  momentum: "Momentum",
  positionPl: "Position P/L",
  volatility: "Volatility",
  session: "Session",
};

export function DecisionFactorsCard({ decision }: DecisionFactorsCardProps) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.05] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
            Decision engine
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {decision.signal} · {decision.totalScore}/100
          </h2>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(decision.factorScores).map(([key, value]) => (
          <Factor
            key={key}
            label={factorLabels[key as keyof DecisionResult["factorScores"]]}
            value={value}
          />
        ))}
      </div>

      <p className="mt-5 text-sm leading-6 text-slate-400">{decision.explanation}</p>
    </section>
  );
}

function Factor({ label, value }: { readonly label: string; readonly value: number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/40 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}/10</p>
      <div className="mt-3 h-1.5 rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-cyan-300"
          style={{ width: `${Math.min(100, Math.max(0, value * 10))}%` }}
        />
      </div>
    </div>
  );
}
