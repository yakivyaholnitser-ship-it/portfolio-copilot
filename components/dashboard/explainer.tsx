interface ExplainerProps {
  readonly title?: string;
  readonly children: string;
}

export function Explainer({ title = "What does this mean?", children }: ExplainerProps) {
  return (
    <details className="mt-4 rounded-lg border border-white/10 bg-slate-950/35 p-4 text-sm text-slate-400 open:bg-slate-950/50">
      <summary className="cursor-pointer select-none font-medium text-slate-300">
        {title}
      </summary>
      <p className="mt-3 leading-6">{children}</p>
    </details>
  );
}
