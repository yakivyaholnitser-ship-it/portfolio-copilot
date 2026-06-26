import type { PortfolioBrief } from "@/types/brief";

interface AiBriefCardProps {
  readonly brief: PortfolioBrief;
  readonly disclaimer: string;
}

const signalStyles: Record<PortfolioBrief["signal"], string> = {
  Bullish: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
  Hold: "border-amber-300/25 bg-amber-300/10 text-amber-100",
  Caution: "border-rose-300/25 bg-rose-300/10 text-rose-100",
};

export function AiBriefCard({ brief, disclaimer }: AiBriefCardProps) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
            AI brief
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Portfolio signal</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${signalStyles[brief.signal]}`}>
            {brief.signal}
          </span>
          <span className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-1 text-sm text-slate-200">
            {brief.confidence}% confidence
          </span>
        </div>
      </div>

      <p className="mt-6 text-xl leading-8 text-slate-100">{brief.summary}</p>

      <div className="mt-6">
        <Note label="Personal note" value={brief.userNote} />
      </div>

      <p className="mt-6 text-sm text-slate-500">{disclaimer}</p>
    </section>
  );
}

interface NoteProps {
  readonly label: string;
  readonly value: string;
}

function Note({ label, value }: NoteProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/40 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-base leading-7 text-slate-200">{value}</p>
    </div>
  );
}
