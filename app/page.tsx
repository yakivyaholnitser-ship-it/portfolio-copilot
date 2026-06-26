import { StatusCard } from "@/components/app-shell/status-card";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-16">
      <section className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
          Portfolio Copilot
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
          A production-ready base for portfolio intelligence.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Built with Next.js App Router, strict TypeScript, provider interfaces,
          and API routes prepared for quote data and future OpenAI integrations.
        </p>
      </section>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <StatusCard label="Health API" value="/api/health" />
        <StatusCard label="Quote API" value="/api/quote?symbol=AAPL" />
      </div>
    </main>
  );
}
