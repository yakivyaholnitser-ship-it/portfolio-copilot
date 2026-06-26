import type { Advisor } from "@/types/advisor";

interface InvestmentCommitteeProps {
  readonly advisors: readonly Advisor[] | null;
}

const signalStyles: Record<Advisor["signal"], string> = {
  positive: "border-emerald-300/30 bg-emerald-300/10 text-emerald-200",
  neutral: "border-slate-300/20 bg-slate-300/10 text-slate-200",
  caution: "border-amber-300/30 bg-amber-300/10 text-amber-200",
  review: "border-cyan-300/30 bg-cyan-300/10 text-cyan-200",
  unavailable: "border-slate-500/20 bg-slate-500/10 text-slate-400",
};

function formatFreshness(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function InvestmentCommittee({ advisors }: InvestmentCommitteeProps) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.045] p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Investment Committee
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Why this decision was made
          </h2>
        </div>
        <p className="max-w-lg text-sm leading-6 text-slate-400">
          Each advisor evaluates one part of the decision. The final brief
          combines their signals.
        </p>
      </div>

      {!advisors ? (
        <div className="mt-5 rounded-lg border border-white/10 bg-slate-950/35 p-4">
          <p className="text-sm text-slate-400">Loading advisor signals...</p>
        </div>
      ) : null}

      {advisors ? (
        <div className="mt-5 grid gap-3">
          {advisors.map((advisor) => (
            <AdvisorRow key={advisor.id} advisor={advisor} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function AdvisorRow({ advisor }: { readonly advisor: Advisor }) {
  return (
    <article className="rounded-lg border border-white/10 bg-slate-950/35 p-4 transition hover:border-white/20 hover:bg-slate-950/45">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-white">{advisor.title}</h3>
            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${signalStyles[advisor.signal]}`}
            >
              {advisor.signal}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {advisor.summary}
          </p>
        </div>

        <div className="grid min-w-52 grid-cols-2 gap-2 text-sm sm:grid-cols-4 lg:grid-cols-2">
          <Metric label="Confidence" value={`${advisor.confidence}%`} />
          <Metric label="Importance" value={`${advisor.importance}%`} />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-3 text-xs text-slate-500 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p>Sources: {advisor.dataSources.join(", ")}</p>
        <p>Freshness: {formatFreshness(advisor.freshness)}</p>
      </div>
    </article>
  );
}

function Metric({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2">
      <p className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-semibold text-slate-100">{value}</p>
    </div>
  );
}
