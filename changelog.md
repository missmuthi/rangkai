### 0.1.0 — 2025-12-14

- Changed: Migrated from pnpm to Bun runtime for faster development and CI/CD
- Changed: Updated all `package.json` scripts to use `bun`/`bunx` instead of `npm`/`npx`/`pnpm`
- Changed: Migrated 4 GitHub workflows (`deploy.yml`, `nuxthub.yml`, `release.yml`, `check-changelog.yml`) to use Bun
- Changed: Updated `playwright.config.ts` webServer command to use Bun
- Changed: Updated all documentation files to reference Bun commands
- Changed: Re-enabled `hub.cache: true` in `nuxt.config.ts` (previously disabled due to ms issue)
- Removed: `pnpm-lock.yaml` (replaced by `bun.lock`)
- Fixed: ESM compatibility issue with `ms` package via patch (auto-applied on install)

### 0.0.5 — 2025-12-08

- Fixed: Critical `aiLog` crash by normalizing legacy string arrays to object format
- Fixed: Persistence of AI-cleaned data (DDC, LCC, Source) on History and Book Detail pages
- Fixed: Component crashes due to double-encoded JSON in `authors` and `categories` fields
- Changed: Updated `BookMetadata` types to support `ai` and `local_cache` sources
- Added: `source` column to `scans` table via migration `0008`
- Added: Robust data normalization layer in `server/api/book/[isbn].get.ts`

### 0.0.4 — 2025-12-07

- Fixed: Corrected toWebRequest imports in auth routes (from 'better-auth/h3' to 'h3')
- Deployed: Updated deployment to Cloudflare Pages with import fixes

### 0.0.3 — 2025-12-07

- Fixed: Auth routing by adding missing toWebRequest import and explicit sign-in provider route
- Deployed: Manual deployment to Cloudflare Pages to resolve 404 on auth endpoints

### 0.0.2 — 2025-12-03

- Added: Phase 1 NuxtHub migration dependencies (drizzle-orm, zod, tailwindcss, html5-qrcode, better-auth)
- Added: Dev dependencies (drizzle-kit, vitest, @playwright/test, @vite-pwa/nuxt, @nuxtjs/tailwindcss)
- Added: `server/db/schema.ts` with Drizzle schema (scans, users, sessions tables)
- Added: `server/utils/db.ts` wrapper exporting useDb() helper
- Added: `server/api/health.get.ts` endpoint for DB connectivity validation
- Changed: Added pnpm override for ms@^2.1.3 to fix @nuxthub/core build compatibility
- Changed: Upgraded @nuxthub/core to 0.9.1, nuxt to 3.20.1

### 0.0.1 — 2025-12-03

- Added initial `agents.md` and `instructions.md` docs (NuxtHub migration guidance)

---

## Changelog Rules

- This file is the source of truth for project version changes.
- Always update this file in the same PR that introduces the change.
- Follow Semantic Versioning (MAJOR.MINOR.PATCH) where:
  - PATCH: Bug fixes, documentation updates
  - MINOR: New features and enhancements
  - MAJOR: Breaking changes
- Include date (YYYY-MM-DD), a brief summary, and categorized bullet points: `Added`, `Changed`, `Fixed`, `Deprecated`, `Removed`.

Example:

```
### 0.0.2 — 2025-12-20
 - Added: `server/api/ai/clean.post.ts`
 - Changed: `useDrizzle()` helper added
 - Fixed: Typo in `README.md`
```

Notes:

- This file should be updated as part of the PR. If a PR does not include a changelog update, reviewers should request update before merging.
- Small documentation-only changes may use a `PATCH` version bump.
- Hotfixes should use the `PATCH` bump and be merged to `main` quickly.

---

Keep entries short and immutable — never rewrite earlier versions (unless fixing a proven mistake), but rather add an additional entry to correct or clarify.
