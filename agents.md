# 🤖 Rangkai AI Agent Documentation

**Version:** 1.0.0  
**Framework:** Nuxt 3 + NuxtHub (Cloudflare)  
**Last Updated:** December 3, 2025

---

## 🎯 Project Overview

Rangkai is a book metadata harvester for Indonesian librarians, migrating from SvelteKit to Nuxt 3 + NuxtHub. This document provides guidance for AI coding agents working on this project.

### Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Nuxt 3.17+ (Nuxt 4 compat mode) | SSR, routing, server functions |
| **Runtime** | NuxtHub + Cloudflare | Edge computing, CDN |
| **Database** | D1 via `hubDatabase()` | Relational data storage |
| **Cache** | KV via `hubKV()` | Book metadata caching |
| **Storage** | R2 via `hubBlob()` | Image/file storage |
| **ORM** | Drizzle ORM | Type-safe database queries |
| **Auth** | Better Auth | Session management |
| **State** | Vue 3 refs + composables | Client-side reactivity |
| **Styling** | Tailwind CSS | Utility-first styling |
| **Package Manager** | pnpm | Dependency management |

---

## 🏗️ Directory Structure (Nuxt 4)

```
rangkai/
├── app/                        # Client-side code (Nuxt 4 structure)
│   ├── app.vue                 # Root component
│   ├── layouts/                # Layout components
│   │   └── default.vue
│   ├── pages/                  # File-based routing
│   │   ├── index.vue           # Home/search page
│   │   ├── login.vue           # Login page
│   │   ├── dashboard.vue       # User dashboard
│   │   └── scan/
│   │       └── mobile.vue      # Mobile scanner
│   ├── components/             # Vue components
│   │   ├── BookDetailModal.vue
│   │   ├── CameraScanner.vue
│   │   └── ui/                 # UI primitives
│   ├── composables/            # Vue composables
│   │   ├── useHistory.ts       # Scan history state
│   │   ├── useToast.ts         # Toast notifications
│   │   └── useAuth.ts          # Authentication
│   └── utils/                  # Client utilities
│       ├── isbn.ts             # ISBN validation
│       └── export.ts           # CSV export
├── server/                     # Nitro server
│   ├── api/                    # API endpoints
│   │   ├── book/
│   │   │   └── [isbn].get.ts   # Book metadata
│   │   ├── scans/
│   │   │   └── [id].get.ts     # Scan CRUD
│   │   ├── auth/               # Auth endpoints
│   │   └── health.get.ts       # Health check
│   ├── database/               # Database layer
│   │   ├── schema.ts           # Drizzle schema
│   │   └── migrations/         # SQL migrations
│   ├── middleware/             # Server middleware
│   │   ├── auth.ts             # Auth protection
│   │   └── redirects.ts        # URL redirects
│   ├── utils/                  # Server utilities
│   │   ├── db.ts               # useDrizzle() helper
│   │   ├── cache.ts            # KV cache helpers
│   │   ├── logger.ts           # Structured logging
│   │   └── ai/                 # AI utilities
│   └── routes/                 # Non-API routes
│       └── images/             # Blob serving
├── public/                     # Static assets
├── types/                      # TypeScript types
│   └── index.ts                # Shared types
├── nuxt.config.ts              # Nuxt configuration
├── drizzle.config.ts           # Drizzle ORM config
└── package.json                # Dependencies
```

---

## 🤖 Specialized AI Agents

### 1. Vue 3 / Nuxt Frontend Architect 🎨

**When to Use:** Frontend development, component creation, page routing, client-side state.

**Key Responsibilities:**
- Build Vue 3 components using Composition API
- Implement pages in `app/pages/` with proper routing
- Create composables in `app/composables/` for shared state
- Ensure TypeScript strict mode on all components
- Implement responsive Tailwind CSS layouts
- Handle loading states and error boundaries

**Critical Patterns:**

```typescript
// ✅ Page with data fetching (app/pages/history.vue)
<script setup lang="ts">
const { data: scans, pending, error, refresh } = await useFetch('/api/scans')

// Reactive computed
const isEmpty = computed(() => !scans.value?.length)
</script>

<template>
  <div v-if="pending">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else v-for="scan in scans" :key="scan.id">
    {{ scan.title }}
  </div>
</template>
```

```typescript
// ✅ Composable pattern (app/composables/useHistory.ts)
export function useHistory() {
  const items = ref<BookData[]>([])
  
  const add = (book: BookData) => {
    items.value = [book, ...items.value].slice(0, 50)
    if (import.meta.client) {
      localStorage.setItem('history', JSON.stringify(items.value))
    }
  }
  
  return { items: readonly(items), add }
}
```

**Rules:**
- ✅ Use `<script setup lang="ts">` for all components
- ✅ Use `useFetch()` or `useAsyncData()` for data fetching
- ✅ Use `defineProps()` and `defineEmits()` for component APIs
- ✅ Use `computed()` and `watch()` for reactivity
- ❌ NEVER use Options API
- ❌ NEVER access server-only code in client components

---

### 2. Nitro Backend Engineer 🔧

**When to Use:** API endpoints, server middleware, database operations, caching.

**Key Responsibilities:**
- Create API endpoints in `server/api/`
- Implement server middleware for auth/logging
- Handle database operations with Drizzle ORM
- Manage KV cache for metadata
- Implement proper error handling

**Critical Patterns:**

```typescript
// ✅ API endpoint with DB (server/api/scans.get.ts)
export default eventHandler(async (event) => {
  const user = event.context.user
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })
  
  const db = useDrizzle()
  const scans = await db.select().from(tables.scans)
    .where(eq(tables.scans.userId, user.id))
    .orderBy(desc(tables.scans.createdAt))
  
  return scans
})
```

```typescript
// ✅ API with KV cache (server/api/book/[isbn].get.ts)
export default eventHandler(async (event) => {
  const isbn = getRouterParam(event, 'isbn')
  if (!isbn) throw createError({ statusCode: 400, message: 'ISBN required' })
  
  // Check cache first
  const cached = await hubKV().get<BookData>(`book:${isbn}`)
  if (cached) return cached
  
  // Fetch and cache
  const book = await fetchBookMetadata(isbn)
  await hubKV().set(`book:${isbn}`, book, { ttl: 86400 })
  
  return book
})
```

```typescript
// ✅ Server middleware (server/middleware/auth.ts)
export default eventHandler(async (event) => {
  if (import.meta.prerender) return
  
  const publicRoutes = ['/api/health', '/api/auth', '/login', '/']
  if (publicRoutes.some(r => event.path.startsWith(r))) return
  
  const session = await getSession(event)
  if (!session) {
    if (event.path.startsWith('/api/')) {
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }
    return sendRedirect(event, '/login')
  }
  
  event.context.session = session
  event.context.user = session.user
})
```

**NuxtHub API Reference:**

| Method | SvelteKit Equivalent | NuxtHub Pattern |
|--------|---------------------|-----------------|
| Database | `platform.env.DB` | `hubDatabase()` or `useDrizzle()` |
| KV Cache | `platform.env.BOOK_CACHE` | `hubKV()` |
| Blob Storage | N/A | `hubBlob()` |
| Get Param | `event.params.id` | `getRouterParam(event, 'id')` |
| Get Body | `await request.json()` | `await readBody(event)` |
| Throw Error | `throw error(404)` | `throw createError({ statusCode: 404 })` |
| Redirect | `throw redirect(302, url)` | `return sendRedirect(event, url)` |

---

### 3. Database Architect 🗃️

**When to Use:** Schema design, migrations, Drizzle queries.

**Key Responsibilities:**
- Design and maintain Drizzle schema
- Create database migrations
- Optimize queries for D1 (SQLite)
- Handle data migrations

**Critical Patterns:**

```typescript
// ✅ Drizzle schema (server/database/schema.ts)
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})

export const scans = sqliteTable('scans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id),
  isbn: text('isbn').notNull(),
  title: text('title').notNull(),
  metadata: text('metadata', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})
```

```typescript
// ✅ useDrizzle helper (server/utils/drizzle.ts)
import { drizzle } from 'drizzle-orm/d1'
export { sql, eq, and, or, desc } from 'drizzle-orm'
import * as schema from '../database/schema'

export const tables = schema

export function useDrizzle() {
  return drizzle(hubDatabase(), { schema })
}
```

**Commands:**
```bash
# Generate migration from schema changes
pnpm db:generate

# Migrations auto-apply on:
# - npm run dev
# - npm run build (deploy)
```

---

### 4. DevOps & Deployment Engineer 🚀

**When to Use:** Deployment, CI/CD, environment configuration.

**Key Responsibilities:**
- Configure `nuxt.config.ts` for NuxtHub
- Set up environment variables
- Manage Cloudflare bindings
- Handle CI/CD pipelines

**Configuration:**

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2025-04-25',
  future: { compatibilityVersion: 4 },
  
  modules: [
    '@nuxthub/core',
    '@nuxt/eslint',
    '@nuxtjs/tailwindcss',
  ],
  
  hub: {
    database: true,  // D1 database
    kv: true,        // KV storage
    blob: true,      // R2 storage
    cache: true,     // Edge caching
  },
  
  runtimeConfig: {
    openaiApiKey: '',           // Server-only
    betterAuthSecret: '',
    public: {
      appUrl: '',               // Client-accessible
    }
  },
  
  devtools: { enabled: true },
})
```

**Deployment Commands:**
```bash
# Development
pnpm dev                    # Local dev server
pnpm dev --remote           # Use remote storage (production data)

# Production
pnpm build                  # Build for production
pnpm preview                # Preview production build locally
pnpm deploy                 # Deploy to NuxtHub (deprecated) or use Cloudflare CI
```

---

## 📋 Code Style Rules

### TypeScript
```typescript
// ✅ Good: Explicit types
function fetchBook(isbn: string): Promise<BookData> { ... }

// ❌ Bad: Implicit any
function fetchBook(isbn) { ... }
```

### Vue Components
```vue
<!-- ✅ Good: script setup with TypeScript -->
<script setup lang="ts">
const props = defineProps<{ book: BookData }>()
const emit = defineEmits<{ select: [book: BookData] }>()
</script>

<!-- ❌ Bad: Options API -->
<script>
export default {
  props: ['book'],
  emits: ['select']
}
</script>
```

### API Endpoints
```typescript
// ✅ Good: Method-specific files
// server/api/books/[id].get.ts
// server/api/books/[id].put.ts
// server/api/books/[id].delete.ts

// ❌ Bad: Single file with switch
// server/api/books/[id].ts with if (method === 'GET')
```

---

## 🚨 Common Mistakes to Avoid

1. **Don't use `event.platform.env`** - Use `hubDatabase()`, `hubKV()`, `hubBlob()` instead
2. **Don't mix client/server code** - Server utils go in `server/utils/`, client in `app/utils/`
3. **Don't forget `import.meta.client`** - Wrap browser-only code
4. **Don't use Svelte syntax** - This is Vue 3, use `ref()`, `computed()`, not `$state`, `$derived`
5. **Don't create API routes without validation** - Always validate input with Zod

---

## 🔗 Quick References

- [NuxtHub Docs](https://hub.nuxt.com/docs)
- [Nuxt 3 Docs](https://nuxt.com/docs)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Nitro Docs](https://nitro.build/)

---

## 📝 Versioning & Changelog ✅

We track project versions using a changelog file at the repository root: `changelog.md`.

Rules:

- Start at version `0.0.1` (already initialized in the `changelog.md`).
- Every time a change is merged to `main` that introduces changes (code, docs, tests, configs), the Pull Request must include an update to `changelog.md`.
- Before merge, update `changelog.md` with:
  - the new version header using semantic versioning (or increment patch only for docs/typos),
  - date (YYYY-MM-DD),
  - a concise summary of changes, and a list with categories: Added, Changed, Fixed, Deprecated, Removed.
- Keep changelog entries short and actionable.
- For hotfixes, increment the patch version; for new features, increment the minor version; for breaking changes, increment the major version.
- Small documentation changes may be merged to a non-main branch; however when merging to `main`, ensure the `changelog.md` entry is updated accordingly.

Example entry (already captured as `0.0.1` in `changelog.md`):

### 0.0.1 — 2025-12-03
 - Added initial `agents.md` and `instructions.md` docs (NuxtHub migration guidance)

Use this file and rules to keep a human-friendly summary of project changes.

### Enforcement & Developer Experience

- The repository includes a GitHub PR template `.github/PULL_REQUEST_TEMPLATE.md` which reminds contributors to add an entry to `changelog.md` when the PR touches code, docs, tests or configs.
- A GitHub Actions job (`.github/workflows/check-changelog.yml`) runs on PRs and will fail the PR if source/config/doc changes are detected without an update to `changelog.md`.
