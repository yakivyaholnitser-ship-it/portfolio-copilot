import type { PortfolioPosition } from "@/types/portfolio";

interface PositionCardProps {
  readonly position: PortfolioPosition;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

function formatPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export function PositionCard({ position }: PositionCardProps) {
  const toneClass = position.isPositive ? "text-emerald-300" : "text-rose-300";
  const badgeClass = position.isPositive
    ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
    : "border-rose-300/20 bg-rose-300/10 text-rose-100";

  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.05] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Position</p>
          <h3 className="mt-1 text-2xl font-semibold text-white">{position.owner}</h3>
        </div>
        <span className={`rounded-full border px-3 py-1 text-sm font-medium ${badgeClass}`}>
          {position.isPositive ? "Positive" : "Below entry"}
        </span>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4">
        <PositionMetric label="Bought" value={currencyFormatter.format(position.bought)} />
        <PositionMetric
          label="Reference"
          value={currencyFormatter.format(position.referencePrice)}
        />
        <PositionMetric
          label="P/L per share"
          value={currencyFormatter.format(position.gainDollarPerShare)}
          className={toneClass}
        />
        <PositionMetric
          label="P/L percent"
          value={formatPercent(position.gainPercent)}
          className={toneClass}
        />
      </dl>
    </article>
  );
}

interface PositionMetricProps {
  readonly label: string;
  readonly value: string;
  readonly className?: string;
}

function PositionMetric({ label, value, className = "text-white" }: PositionMetricProps) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
        {label}
      </dt>
      <dd className={`mt-1 text-lg font-semibold ${className}`}>{value}</dd>
    </div>
  );
}
