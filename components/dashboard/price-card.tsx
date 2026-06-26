import type { Quote } from "@/types/quote";

interface PriceCardProps {
  readonly quote: Quote;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

function formatPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export function PriceCard({ quote }: PriceCardProps) {
  const isPositive = quote.todayChangePercent >= 0;

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20 backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
            Market
          </p>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight text-white">
            {quote.symbol}
          </h2>
        </div>
        <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm font-medium capitalize text-cyan-100">
          {quote.session}
        </span>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Metric label="Market price" value={currencyFormatter.format(quote.marketPrice)} />
        <Metric label="Reference price" value={currencyFormatter.format(quote.wsLikePrice)} />
        <Metric
          label="Today"
          value={formatPercent(quote.todayChangePercent)}
          tone={isPositive ? "positive" : "negative"}
        />
      </div>
    </section>
  );
}

interface MetricProps {
  readonly label: string;
  readonly value: string;
  readonly tone?: "positive" | "negative";
}

function Metric({ label, value, tone }: MetricProps) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-300"
      : tone === "negative"
        ? "text-rose-300"
        : "text-white";

  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/40 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}
