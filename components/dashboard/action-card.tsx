import type { ActionRecommendation } from "@/types/copilot";

interface ActionCardProps {
  readonly recommendation: ActionRecommendation;
}

const answerStyles: Record<ActionRecommendation["answer"], string> = {
  "No action": "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
  Review: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
  "Consider trimming": "border-amber-300/25 bg-amber-300/10 text-amber-100",
  Caution: "border-rose-300/25 bg-rose-300/10 text-rose-100",
};

export function ActionCard({ recommendation }: ActionCardProps) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/25">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-300">
        Should I do anything?
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h2 className="text-4xl font-semibold tracking-tight text-white">
          {recommendation.answer}
        </h2>
        <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${answerStyles[recommendation.answer]}`}>
          {recommendation.confidence}% confidence
        </span>
      </div>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
        {recommendation.reason}
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <OwnerAction owner="Yakiv" value={recommendation.yakivAction} />
        <OwnerAction owner="Anastasiia" value={recommendation.anastasiiaAction} />
      </div>
    </section>
  );
}

function OwnerAction({
  owner,
  value,
}: {
  readonly owner: string;
  readonly value: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/40 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
        {owner}
      </p>
      <p className="mt-2 text-base leading-7 text-slate-200">{value}</p>
    </div>
  );
}
