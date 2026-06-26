import { Explainer } from "@/components/dashboard/explainer";

const dataSources = [
  {
    label: "Yahoo Finance chart API",
    value: "Quote, market price, WS-like reference price, session, and daily change.",
  },
  {
    label: "Finnhub API",
    value: "Company news, analyst trends, earnings calendar, and insider transactions when FINNHUB_API_KEY is configured.",
  },
  {
    label: "Financial Modeling Prep API",
    value: "Income statement, balance sheet, cash flow, key metrics, and financial ratios when FMP_API_KEY is configured.",
  },
  {
    label: "User portfolio config",
    value: "Bought price and personal P/L for the selected investor.",
  },
  {
    label: "Deterministic Decision Engine",
    value: "Score, signal, and factor scores. OpenAI is not used here.",
  },
  {
    label: "Morning Brief Engine",
    value: "Combines independent brains into the structured morning brief.",
  },
  {
    label: "OpenAI optional narrator",
    value: "Only rewrites explanations when available. It does not score or decide.",
  },
];

export function HowBriefBuiltCard() {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
        How this brief was built
      </p>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
        The recommendation comes from deterministic data and scoring. AI can
        explain the result, but it does not make the decision.
      </p>

      <div className="mt-5 grid gap-3">
        {dataSources.map((source) => (
          <div
            key={source.label}
            className="rounded-lg border border-white/10 bg-slate-950/35 p-4"
          >
            <p className="font-medium text-slate-200">{source.label}</p>
            <p className="mt-1 text-sm leading-6 text-slate-400">{source.value}</p>
          </div>
        ))}
      </div>

      <Explainer title="Why this matters">
        You should be able to see where the brief came from and which parts are
        calculated, configured, or narrated.
      </Explainer>
    </section>
  );
}
