interface BriefSectionCardProps {
  readonly title: string;
  readonly value?: string;
  readonly bullets?: readonly string[];
}

export function BriefSectionCard({ title, value, bullets }: BriefSectionCardProps) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.045] p-6">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
        {title}
      </p>
      {value ? <p className="mt-4 text-xl leading-8 text-slate-100">{value}</p> : null}
      {bullets ? (
        <ul className="mt-4 grid gap-3">
          {bullets.map((bullet) => (
            <li key={bullet} className="flex gap-3 text-slate-300">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
              <span className="leading-7">{bullet}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
