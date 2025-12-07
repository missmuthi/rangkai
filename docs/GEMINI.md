# GEMINI.md - Rangkai Project Architecture & Best Practices

**"The Brain" of Rangkai**
This document serves as the single source of truth for the project's architectural decisions, ensuring all future AI agents and developers adhere to the same standards.

---

## 🏗️ Tech Stack & Philosophy

- **Framework**: Nuxt 3 (Server-Side Rendering)
- **Deployment**: Nuxt Hub -> Cloudflare Pages (Edge Runtime)
- **Database**: Cloudflare D1 (SQLite) with Drizzle ORM
- **Cache**: Nuxt Hub Cache (KV-based) + Native Edge SWR
- **Philosophy**: **Edge First**. No Node.js-only APIs. All features must work in a Serverless environment.

---

## 🛡️ Core Directives (Rules of Engagement)

### 1. Database & ORM

- **D1 is the only DB**: Using `hub.database` and `drizzle-orm/d1`.
- **Drizzle Kit**: Configuration is in `drizzle.config.ts`.
- **Migrations**:
  - Locally: `npx drizzle-kit migrate` or `drizzle-kit push` (development only)
  - Production: Automated via `nuxthub:deploy` hook in `package.json` calling `migrate:prod`.

### 2. Caching Strategy

- **Edge SWR**: Use `cachedEventHandler` for high-read APIs (e.g., public metadata).
- **User-Scoped Data**: Do **NOT** globally cache endpoints that return user-specific data (e.g., scan history, profile).
  - Use `defineCachedFunction` internally to cache expensive external calls (like Google Books/OpenLibrary) while keeping the API handler dynamic.
- **KV**: Use `hub.kv` for session data and feature flags.

### 3. API Architecture

- **Separation of Concerns**:
  - `GET /api/book/[isbn]`: Fetches merged metadata. Side-effects (saving history) should theoretically be separated, but current implementation combines them for UX speed.
  - **Refactoring Note**: Future iterations should split `GET` (Clean Metadata) and `POST` (Save Scan) to fully leverage Edge caching.
- **Fail Gracefully**: External APIs (Google, OL) are unreliable. Always wrap them in try/catch and use fallbacks.

### 4. Rendering & Performance

- **Prerendering**: `nitro.prerender` is configured in `nuxt.config.ts` for static pages (`/`, `/about`).
- **Hybrid Rendering**: Route Rules are preferred over global settings for granular control.

### 5. Debugging

- **Logs**: Use `console.log` sparingly; explicit error handling with `createError` is preferred.
- **Local Dev**: Use `npm run dev` (Nuxt Hub CLI). If DB fails, check `.data/hub` folder or `wrangler.toml` binding.

---

## 🔄 Current Implementation Status (Verification)

- [x] `drizzle.config.ts`: Present.
- [x] `hub.cache`: Enabled.
- [x] `deploy` hook: Configured.
- [x] Auth: Better Auth + Custom Google implementation (Secure).

---

> **Note to AI**: Before modifying architecture, consult this file. If you introduce a new pattern, update this file.
