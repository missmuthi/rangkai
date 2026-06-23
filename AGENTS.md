# AGENTS.md

## Agent Operating Principles
- Ask clarifying questions when requirements are ambiguous.
- Prefer the simplest working solution before adding abstraction.
- Do not modify unrelated files or refactor outside the requested scope.
- Clearly state uncertainty, assumptions, and tradeoffs.
- Read existing code and docs before making changes.
- Verify changes with tests, linting, or type checks when available.
- Do not claim success unless verification actually ran.
- Minimize surprise: explain destructive, broad, or irreversible changes before doing them.

## Project Overview
- Rangkai is a Nuxt 3 app for book scanning and metadata management.
- The app focuses on ISBN scanning, history tracking, and book detail workflows.
- It includes auth flows, protected pages, and profile/settings features.
- Server routes handle book lookup, scans, groups, profile data, auth, health, and AI cleanup.
- The repo includes unit, integration, and end-to-end tests.
- The project is set up for Cloudflare Pages deployment through NuxtHub and Wrangler.
- The codebase includes PWA assets and scanner support.
- Documentation under `docs/` covers deployment, auth, migration, and E2E testing.

## Tech Stack
- Language: TypeScript
- UI framework: Nuxt 3 with Vue 3
- Styling: Tailwind CSS and Nuxt UI
- Package manager: Bun
- Backend/runtime: Nitro via NuxtHub on Cloudflare Pages
- Database: Cloudflare D1 with Drizzle ORM
- Caching/storage: Cloudflare KV and NuxtHub cache
- Auth: Better Auth
- Testing: Vitest and Playwright
- Linting: ESLint
- Deploy tooling: Wrangler, Nuxthub CLI, and GitHub Actions

## Repository Structure
- `app/` contains the Nuxt client app: pages, layouts, components, composables, plugins, types, and utilities.
- `server/` contains Nitro API routes, middleware, utilities, and D1 schema and migrations.
- `tests/` contains Vitest unit and integration tests plus Playwright E2E tests.
- `docs/` contains project notes, testing guidance, migration strategy, and deployment checklists.
- `artifacts/` may be used for browser-baseline outputs and should stay ignored or temporary.
- `public/` contains static assets, including PWA icons and scanner wasm files.
- `scripts/` contains utility scripts such as scanner recording helpers.
- `.github/` contains CI, release, and pull request workflows.
- `wrangler.toml` is the source of truth for Cloudflare Pages bindings and should be edited carefully.
- `server/db/migrations/` contains checked-in database migrations; update schema and migrations together.
- Do not edit generated or transient outputs casually, including `.nuxt/`, `dist/`, `test-results/`, `playwright-report/`, and `node_modules/`.

## Common Commands
See [`COMMANDS.md`](./COMMANDS.md) for the verified command list.

## Browser Automation
- Use the installed `agent-browser` binary for interactive browser investigation and migration smoke testing.
- Start with `agent-browser open <url>`, then `snapshot -i`, then interact using accessibility refs.
- Take a new snapshot after navigation or major DOM updates.
- Inspect console, errors, and network requests during browser sessions.
- Preserve screenshots, traces, and videos under an ignored artifacts directory.
- Do not use `agent-browser` as a substitute for deterministic CI tests covering critical application contracts.

## Coding Standards
- TypeScript-first codebase.
- Use Nuxt file conventions for routes, middleware, composables, and server handlers.
- Prefer `<script setup lang="ts">` in Vue files.
- Use two-space indentation and single quotes in code that follows the existing style.
- Keep imports and naming aligned with current Nuxt/Vue conventions.
- Use the existing lint rules instead of inventing local style exceptions.
- Keep server handlers focused and validate inputs before use.
- Keep tests close to the behavior they cover and prefer stable selectors in E2E tests.

## Agent Workflow
1. Read relevant files first.
2. Make the smallest safe change.
3. Update or add tests when behavior changes.
4. Run the most relevant verification command.
5. Summarize files changed, reasoning, and verification result.

## Boundaries
- Do not make broad refactors without explicit permission.
- Do not upgrade dependencies unless asked.
- Do not change database schema or migrations casually.
- Do not delete files unless explicitly requested.
- Do not change public APIs without confirming the contract.
- Do not modify generated files unless the task is specifically about generated output.
- Do not change security, auth, or payment logic without explicit review.
- Do not rewrite formatting across unrelated files.

## Decision Memory
- Durable project notes live in [`MEMORY.md`](./MEMORY.md).
- The app is configured for NuxtHub/Cloudflare Pages with D1 and KV bindings in `wrangler.toml`.
- `bun.lock` indicates Bun is the expected package manager.
- `patches/ms.patch` is applied during `postinstall` to keep the `ms` dependency working with the current setup.
- `nuxt.config.ts` disables SSR for dashboard, history, settings, scan, profile, and diagnostics routes.
- `nuxt.config.ts` enables camera permissions, strict security headers, and PWA behavior for the scanner workflow.
- `app.config.ts` sets the Nuxt UI primary theme to `deep-space-blue`.

## Known Issues and Error Patterns
- Recurring issues and troubleshooting notes live in [`ERRORS.md`](./ERRORS.md).
- `bun install` runs `nuxt prepare` and the `ms` patch; if Nuxt types are missing, rerun installation first.
- E2E tests depend on the Playwright auth setup and may require `E2E_MOCKS` or a local dev server.
- Cloudflare deploys and D1 migration commands require the correct Wrangler bindings and secrets.
- Missing auth or API env vars can disable login or cause server routes to fail.

## When to Ask First
- Requirements are unclear.
- Multiple plausible implementations exist.
- A change is destructive, broad, or hard to reverse.
- The change affects security, auth, or payment logic.
- Environment variables or credentials are missing.
- Tests fail in a way that appears unrelated to the current change.
- Proposed behavior conflicts with existing docs or checked-in workflows.
