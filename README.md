# Portfolio Copilot

A production-oriented Next.js 16 application scaffold using the App Router, TypeScript, and Tailwind CSS.

## Scripts

- `npm run dev` starts the local development server.
- `npm run build` creates a production build.
- `npm run start` serves the production build.
- `npm run typecheck` runs TypeScript validation.

## API

- `GET /api/health` returns service status and version metadata.
- `GET /api/quote?symbol=AAPL` returns a typed quote response from the configured quote provider.
