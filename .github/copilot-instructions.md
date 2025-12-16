# Rangkai Copilot Onboarding

Overview the agent should know on first load: Rangkai is a Nuxt 3/NuxtHub app for scanning ISBNs (mobile-first) and aggregating book metadata (Google Books/OpenLibrary/LoC/Perpusnas), with AI-assisted cleanup and SLiMS-ready exports. Runs on Cloudflare Pages Functions with D1 + KV.

## Stack & Key Modules
- Nuxt 3.17+ with Nuxt 4 compatibility flags; TypeScript-first `<script setup>`.
- Styling: Tailwind + @nuxt/ui; @nuxt/image (Cloudflare provider). Color palette set in `app.config.ts`; CSP and image domains locked in `nuxt.config.ts`.
- Backend: Nitro on Cloudflare (NuxtHub). Data via `hubDatabase()` (D1) + drizzle ORM (`server/utils/db.ts`), caching via KV (bindings `KV`/`CACHE` in `wrangler.toml`). Blob storage disabled for now.
- Auth: Hybrid Better Auth + custom Google OAuth. Global middleware (`server/middleware/auth.ts`) injects `event.context.user/session`; frontend composable `useAuth` manages client state. Additional auth helpers in `server/utils/auth.ts` and `server/utils/session.ts`.
- AI/classification: `server/api/ai/clean.post.ts` (Groq, needs `GROQ_API_KEY`) with classification cache table.
- Shared types: `app/types/index.ts`; metadata helpers in `server/utils/metadata/*`.

## Project Layout
- `app/` Nuxt client: `pages/` (file routing; protected pages set `middleware: 'auth'`), `components/` (UI primitives under `ui/`), `composables/` (useAuth/useHistory/useSlimsExport/etc.), `middleware/auth.ts` (client auth guard with E2E bypass cookie), `plugins/` (auth bootstrap + QR code wasm override), `types/`, `utils/`.
- `server/` Nitro: `api/` routes (book, scans CRUD/export/dedupe, auth, AI clean, profile, groups, image-proxy, health), `db/` Drizzle schema + migrations, `middleware/` (auth), `utils/` (auth/session/rate-limit/metadata merge/cache/sanitize/etc.).
- `public/` static assets including `wasm/` for `vue-qrcode-reader`.
- `tests/`: Playwright E2E (`tests/e2e`, config in `playwright.config.ts`), Vitest unit (`tests/unit`, `vitest.config.ts`). Docs in `docs/` (E2E guide, migration strategy, deployment checklist, Better Auth notes), plus `ARCHITECTURE.md`, `AUTH_FLOW_ANALYSIS.md`, `PHASE4_QUICKSTART.md`, `ROUTES.md`.

## Setup & Commands (prefer Bun to match lockfile)
- Install: `bun install` (runs `nuxt prepare` and patches `ms` package). If `nuxt prepare` wasn’t run (missing `.nuxt`), run `bunx nuxi prepare`.
- Dev: `bun run dev` (3000). NuxtHub provides local D1/KV bindings automatically; `NUXT_PUBLIC_SITE_URL` defaults to Pages URL.
- Quality: `bun run lint` / `bun run lint:fix`; `bun run typecheck`.
- Tests: Vitest `bun run test` (unit only) or `bun run test:coverage`. Playwright `bun run test:e2e` (runs dev server via config). Install browsers first via `npx playwright install` if needed. `E2E_MOCKS` default true; set `E2E_MOCKS=false` for real API calls.
- Build/preview: `bun run build`; `bun run preview` or `bunx nuxthub preview`. Deploy script: `bun run deploy` (build then `wrangler pages deploy dist`). Migrations: `bunx drizzle-kit generate`; production helper `bun run migrate:prod`.

## Coding Guidelines
- TypeScript everywhere; avoid `any` (eslint warns). 2-space indent, single quotes. Tailwind classes ordered layout → spacing → color.
- Use composables for shared state (`useAuth`, `useHistory`, `useSearchRouting`, etc.). Shared types come from `app/types/index.ts`; server-side metadata types in `server/utils/metadata/types.ts`.
- Protect server handlers with `requireAuth`/`requireUserSession` (from `server/utils/auth` or `server/utils/session`) instead of re-implementing guards. Access DB via `useDb()` (Drizzle+D1).
- Follow Nuxt file naming: API routes `*.get.ts`/`*.post.ts`/`*.patch.ts`, composables prefixed `use`. Keep SSR-disabled route rules in `nuxt.config.ts` for dashboard/history/scan/profile/diagnostics.
- When adding external images/APIs, update CSP + `image.domains` in `nuxt.config.ts` and image proxy if needed.
- Frontend auth: new protected pages should set `definePageMeta({ middleware: 'auth' })`; client middleware honors `e2e-test-bypass` cookie for tests. Auth plugin preloads session on mount.
- QR scanner: `vue-qrcode-reader` expects wasm assets at `/public/wasm` (see `app/plugins/vue-qrcode-reader.client.ts`).

## Data & Feature Flow Highlights
- Book lookup (`server/api/book/[isbn].get.ts`): validates ISBN, checks books table cache, otherwise calls `fetchBookByIsbn` (Google/OL/LoC/Perpusnas merge), upserts books table, then upserts user scan. User-specific overrides (DDC/LCC/callNumber/aiLog/source) override cached metadata.
- Scan management: CRUD under `/api/scans*`; history composable `useHistory` handles pagination and optimistic updates. Exports via `useSlimsExport` (CSV; TODO placeholder for SLiMS API push).
- AI clean flow: `POST /api/ai/clean` uses classification cache → OpenLibrary → Groq. Requires `GROQ_API_KEY`; caches results in `classification_cache`.
- Auth: Better Auth catch-all route (`server/api/auth/[...all].ts`) plus custom Google endpoints (`/api/auth/google`, `/api/auth/callback`). Session cookie `session` read in server middleware; `useAuth` fetches `/api/auth-session`.

## Config & Environment
- `nuxt.config.ts`: compatibilityDate `2025-04-25`, `@nuxt/security` headers incl. camera permissions policy; PWA enabled (workbox runtime caching) and SSR disabled for main app routes. Hub config enables DB+KV, disables blob.
- `wrangler.toml`: Pages build output `dist`; bindings `DB`, `KV`, `CACHE`; `NUXT_PUBLIC_SITE_URL` default set. Keep in sync with Nuxt runtime config.
- Env vars commonly needed: `AUTH_SECRET`, `OAUTH_GOOGLE_CLIENT_ID`, `OAUTH_GOOGLE_CLIENT_SECRET`, `NUXT_PUBLIC_SITE_URL`, `GROQ_API_KEY` (for AI clean). Missing Google creds disables provider gracefully; auth still works for email/password.

## Testing Notes
- Playwright uses `playwright/.auth/user.json` from setup project; webServer command already `bun run dev`. For auth-required pages in E2E, use the provided storage state or set `e2e-test-bypass=true` cookie (middleware check).
- Vitest alias `~` → `app`; happy-dom environment. Coverage includes `app` and `server`, excludes `tests`.

## Gotchas
- Postinstall patch: `patches/ms.patch` fixes ESM issue for NuxtHub cache; keep script intact.
- AI clean without `GROQ_API_KEY` throws 500; guard in tests or set the key.
- CSP/image domains strict—add new domains before loading assets. Permissions Policy currently only allows camera.
- D1 migrations live in `server/db/migrations`; keep schema and migration aligned when touching tables.
- Avoid editing generated artifacts (`dist/`, `.nuxt/`, `node_modules/`, `bundle-analysis.json`).
