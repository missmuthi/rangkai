# Architecture

This document describes the technical architecture of Rangkai (Nuxt 3 Edition), focusing on system layers, data flow, component boundaries, and key design decisions.

**TL;DR:** A serverless Nuxt 3 app on Cloudflare Pages that fetches book metadata from Google Books API, caches results in KV, and stores scan history in D1.

---

## System Layers

Rangkai follows a **3-tier serverless architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  (Nuxt 3 SSR + Client-Side Hydration)                       │
│                                                              │
│  • Vue 3 SFCs with Composition API                          │
│  • Auto-imported composables (useAuth, useHistory, etc.)    │
│  • Tailwind CSS + Shadcn-style components                   │
│  • PWA support via @vite-pwa/nuxt                           │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/JSON
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                         │
│  (Nitro Server - Cloudflare Workers Runtime)                │
│                                                              │
│  • API Routes (server/api/*)                                │
│  • Custom OAuth (Google Sign-In)                            │
│  • KV Caching (hubKV)                                       │
│  • Session management (server/utils/session.ts)            │
└──────────────────────┬──────────────────────────────────────┘
                       │ SQL/KV/HTTP
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────────┐  │
│  │ D1 Database │  │ KV Storage  │  │ External APIs      │  │
│  │ (SQLite)    │  │ (Cache)     │  │ • Google Books     │  │
│  │             │  │             │  │                    │  │
│  │ • Users     │  │ • Book data │  │                    │  │
│  │ • Scans     │  │ • Sessions  │  │                    │  │
│  │ • Sessions  │  │ (24h TTL)   │  │                    │  │
│  └─────────────┘  └─────────────┘  └────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Modules & Responsibilities

### Presentation Layer

| Module        | Path                        | Responsibility                         |
| ------------- | --------------------------- | -------------------------------------- |
| **Dashboard** | `app/pages/dashboard.vue`   | Central search interface, recent scans |
| **Scanner**   | `app/pages/scan/mobile.vue` | Camera-based ISBN scanning             |
| **History**   | `app/pages/history.vue`     | Scan history, export to CSV            |
| **Profile**   | `app/pages/profile.vue`     | User stats                             |
| **Settings**  | `app/pages/settings.vue`    | Theme toggle, account info             |

### Application Layer (Composables)

| Composable         | Responsibility                     |
| ------------------ | ---------------------------------- |
| `useAuth`          | Authentication state, OAuth flow   |
| `useHistory`       | Fetch/save scan history            |
| `useBookSearch`    | ISBN lookup via `/api/book/[isbn]` |
| `useScanner`       | html5-qrcode integration           |
| `useSearchRouting` | Smart ISBN vs title routing        |

### Server API Routes

| Route                       | Method   | Purpose                      |
| --------------------------- | -------- | ---------------------------- |
| `/api/book/[isbn]`          | GET      | Fetch book metadata (cached) |
| `/api/scans`                | GET/POST | Scan history CRUD            |
| `/api/auth/google`          | GET      | OAuth initiation             |
| `/api/auth/callback/google` | GET      | OAuth callback               |
| `/api/auth/sign-out`        | POST     | Logout                       |

---

## Data Flow

### Book Metadata Fetch (Cache Miss)

```
┌─────┐    ┌─────────┐    ┌────────┐    ┌─────┐
│ User│    │ Nitro   │    │   KV   │    │ API │
└──┬──┘    └────┬────┘    └───┬────┘    └──┬──┘
   │            │              │            │
   │ GET /api/book/123         │            │
   │───────────▶│              │            │
   │            │ GET book:123 │            │
   │            │─────────────▶│            │
   │            │ null (MISS)  │            │
   │            │◀─────────────│            │
   │            │              │            │
   │            │ GET googleapis.com        │
   │            │──────────────────────────▶│
   │            │ { volumeInfo: ... }       │
   │            │◀──────────────────────────│
   │            │              │            │
   │            │ SET book:123 │            │
   │            │─────────────▶│            │
   │            │              │            │
   │ { metadata, cached:false }│            │
   │◀───────────│              │            │
   │ X-Cache: MISS             │            │
```

---

## Key Design Decisions

### 1. Nuxt 3 over SvelteKit

- **Rationale:** Vue ecosystem, auto-imports, better TypeScript DX.
- **Tradeoff:** Slightly larger bundle than Svelte.

### 2. Google Books Only (for now)

- **Rationale:** Single source first, add OpenLibrary/LoC later.
- **Benefit:** Simpler merge logic, faster iteration.

### 3. NuxtHub for D1/KV

- **Rationale:** Zero-config Cloudflare bindings via `@nuxthub/core`.
- **Benefit:** `hubKV()`, `hubDB()` auto-configured.

### 4. Custom OAuth (no Better Auth)

- **Rationale:** Simpler flow, custom session management.
- **Files:** `server/api/auth/google.get.ts`, `server/utils/session.ts`.

---

## Scalability & Limits

| Resource         | Current  | Limit (Free) | Notes         |
| ---------------- | -------- | ------------ | ------------- |
| Workers Requests | ~1K/day  | 100K/day     | 100x headroom |
| D1 Rows          | ~500     | 100K         | 200x headroom |
| KV Reads         | ~700/day | 100K/day     | 142x headroom |
| KV Writes        | ~300/day | 1K/day       | 3x headroom   |

---

## Security

| Threat            | Mitigation                    | Status     |
| ----------------- | ----------------------------- | ---------- |
| SSRF              | Whitelist image domains       | ⚠️ Partial |
| SQL Injection     | Drizzle parameterized queries | ✅         |
| XSS               | Vue auto-escaping             | ✅         |
| Session Hijacking | HttpOnly, Secure cookies      | ✅         |
| API Key Leakage   | Server-side env vars          | ✅         |

---

## File Structure

```
rangkai/
├── app/
│   ├── components/      # Vue components
│   ├── composables/     # useAuth, useHistory, etc.
│   ├── layouts/         # app.vue layout
│   ├── pages/           # File-based routing
│   └── types/           # TypeScript types
├── server/
│   ├── api/             # Nitro API routes
│   ├── db/              # Drizzle schema & migrations
│   ├── middleware/      # Auth middleware
│   └── utils/           # Session, metadata fetchers
├── nuxt.config.ts       # Nuxt configuration
└── wrangler.toml        # Cloudflare bindings (optional)
```
