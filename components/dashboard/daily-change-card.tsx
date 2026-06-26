import type { DailyChangeSummary } from "@/types/copilot";

interface DailyChangeCardProps {
  readonly summary: DailyChangeSummary;
}

export function DailyChangeCard({ summary }: DailyChangeCardProps) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.05] p-6">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
        What changed today?
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-white">{summary.headline}</h2>
      <ul className="mt-5 grid gap-3">
        {summary.bullets.map((bullet) => (
          <li key={bullet} className="flex gap-3 text-slate-300">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-300" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
