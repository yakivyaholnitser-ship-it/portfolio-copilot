import type { CopilotResponse } from "@/types/copilot";

interface MorningBriefHeroProps {
  readonly copilot: CopilotResponse;
}

const answerStyles: Record<
  CopilotResponse["morningBrief"]["todaysDecision"]["answer"],
  string
> = {
  "No action": "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
  Review: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
  "Consider trimming": "border-amber-300/25 bg-amber-300/10 text-amber-100",
  Caution: "border-rose-300/25 bg-rose-300/10 text-rose-100",
};

export function MorningBriefHero({ copilot }: MorningBriefHeroProps) {
  const decision = copilot.morningBrief.todaysDecision;

  return (
    <section className="rounded-lg border border-white/10 bg-[linear-gradient(135deg,rgba(14,165,233,0.16),rgba(15,23,42,0.86)_42%,rgba(2,6,23,0.96))] p-6 shadow-2xl shadow-black/30 sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-cyan-200">
            Morning brief
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Good morning, {copilot.displayName}
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
            {decision.reason}
          </p>
        </div>

        <div className="rounded-lg border border-white/10 bg-slate-950/50 p-4 lg:min-w-64">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            Today's Decision
          </p>
          <p className="mt-3 text-3xl font-semibold text-white">{decision.answer}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${answerStyles[decision.answer]}`}>
              {decision.confidence}% confidence
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
              {copilot.morningBrief.estimatedReadingTime} read
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-white/10 bg-slate-950/35 p-4">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
          Personal action
        </p>
        <p className="mt-2 text-base leading-7 text-slate-100">{decision.userAction}</p>
      </div>
    </section>
  );
}
