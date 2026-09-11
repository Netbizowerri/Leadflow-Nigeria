# LeadFlow Nigeria — Agent Instructions

## What this is

Lead generation SPA for discovering Nigerian businesses without websites. React 19 + Vite 6 + Tailwind CSS v4 + TypeScript. Express server for local dev; Vercel serverless functions for production API.

## Commands

- `npm run dev` — starts Express dev server with Vite middleware (`tsx server.ts`, port 3000). Do NOT run `vite` directly.
- `npm run build` — `vite build` then `esbuild` bundles `server.ts` to `dist/server.cjs`.
- `npm run lint` — TypeScript type-check only (`tsc --noEmit`). No ESLint configured.
- `npm run start` — production server (`node dist/server.cjs`).
- `npm run clean` — removes `dist/`.

No test framework is configured.

## Architecture

```
server.ts              Express server (dev: Vite middleware SPA; prod: serves dist/)
api/search.ts          Vercel serverless — Gemini-powered directory search
api/proxy-webhook.ts   Vercel serverless — CORS proxy for webhook delivery
src/
  main.tsx             React entrypoint
  App.tsx              Router + protected routes + layout shell
  context/AppContext.tsx  Global state (localStorage-persisted, no DB)
  pages/               Home, Login, Search, Results, Leads, Webhook
  components/          Sidebar, LeadCard, RadarAnimation
  types.ts             Lead, WebhookLog, ScanProgress types
  index.css            Tailwind v4 import + custom fonts + glass/radar styles
index.html             CSP headers set here
vercel.json            SPA rewrite rules for Vercel deploy
```

## Key quirks

- **Two backend entry points**: `server.ts` (Express, local dev) and `api/*.ts` (Vercel serverless). They duplicate logic (search handler, phone normalizer). Keep both in sync when changing API behavior.
- **`npm run dev` runs `tsx server.ts`**, not `vite`. The Express server creates the Vite dev server as middleware.
- **Path alias**: `@/*` maps to project root (configured in both `tsconfig.json` and `vite.config.ts`).
- **Tailwind CSS v4**: uses `@tailwindcss/vite` plugin, not PostCSS. Import in `index.css` is `@import "tailwindcss"`.
- **All state is localStorage** — no database, no backend persistence. Keys are prefixed `lf_`.
- **Auth is a localStorage boolean** (`lf_is_logged_in`). No real auth system.
- **`api/` is excluded from tsconfig** — Vercel functions have their own runtime context.
- **`GEMINI_API_KEY`** required in `.env.local` for search to work. Set via `dotenv` in `server.ts`.
- **HMR can be disabled** via `DISABLE_HMR=true` env var (designed for AI editor environments).

## Style conventions

- Dark theme: `bg-[#0A0F1E]`, `text-slate-100`
- Fonts: Inter (body), Sora (headings), IBM Plex Mono (code)
- Animations via `motion/react` (Framer Motion v12)
- Glass-morphism pattern: `.glass-panel` class in `index.css`
- `lucide-react` for icons
