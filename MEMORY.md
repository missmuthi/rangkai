# MEMORY.md

Persistent project decisions and context discovered from the repository.

## Repository Identity
- Rangkai is a Nuxt 3 book-scanning and metadata app.
- The repo is configured for Cloudflare Pages deployment with NuxtHub.
- The app uses Cloudflare D1 for persistent data and KV for caching.
- Bun is the expected package manager.

## Architecture Decisions
- `wrangler.toml` is the source of truth for Cloudflare Pages bindings.
- `server/db/migrations/` is the checked-in D1 migration source.
- `server/db/schema.ts` and the migrations should stay aligned.
- `patches/ms.patch` is applied on install to keep the current toolchain working.
- `nuxt.config.ts` disables SSR for dashboard, history, settings, scan, profile, and diagnostics routes.
- `nuxt.config.ts` enables strict security headers, PWA behavior, and camera permissions for the scanner.
- `app.config.ts` sets Nuxt UI theming to `deep-space-blue`.

## Product Context
- The primary user flow is scanning books and enriching metadata.
- The repo includes protected auth flows for logged-in app areas.
- The scanner experience relies on PWA assets and wasm support in `public/wasm`.
- The project includes E2E support for mocked and real API flows.

## Operational Context
- `bun install` is not a passive install; it also runs `nuxt prepare` and the `ms` patch.
- Production deploys build `dist` and publish through Wrangler Pages.
- D1 production migration is exposed as `bun run migrate:prod`.
- Cloudflare secrets and bindings are expected to come from Wrangler or the Cloudflare dashboard, not hard-coded into the repo.
