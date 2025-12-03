# 📚 Rangkai Project Instructions

**Version:** 1.0.0  
**Framework:** Nuxt 3.17+ with NuxtHub  
**Target Repo:** https://github.com/missmuthi/rangkai  
**Source Repo:** https://github.com/missmuthi/rangkai-book-metadata (SvelteKit)  
**Last Updated:** December 3, 2025

---

## 🎯 What is Rangkai?

Rangkai is a **book metadata harvester** designed for Indonesian librarians. It fetches book data from multiple APIs (Google Books, OpenLibrary, Library of Congress), merges the data intelligently, and exports it in SLiMS-compatible formats.

### Core Features
1. **Triple-Source Search** - ISBN/title search across 3 APIs
2. **Waterfall Data Merging** - Priority: Google → OpenLibrary → Library of Congress
3. **Authoritative Classifications** - DDC + LCC from Library of Congress
4. **Auto Call Number Generation** - Cutter-Sanborn system
5. **Mobile Barcode Scanner** - Rapid scanning mode
6. **SLiMS CSV Export** - UTF-8 BOM compatible
7. **User Authentication** - Google OAuth via Better Auth
8. **Scan History** - Persisted in D1 database

---

## 🏗️ Technology Stack

### Current (NuxtHub) - FOCUS ON THIS

| Layer | Technology | Status |
|-------|------------|--------|
| **Framework** | Nuxt 3.17+ (Nuxt 4 compat) | ✅ Active |
| **Runtime** | NuxtHub on Cloudflare | ✅ Active |
| **Database** | D1 via `hubDatabase()` | ✅ Active |
| **Cache** | KV via `hubKV()` | ✅ Active |
| **Storage** | R2 via `hubBlob()` | ✅ Available |
| **ORM** | Drizzle ORM | ✅ Recommended |
| **Auth** | Better Auth | ✅ Recommended |
| **Styling** | Tailwind CSS | ✅ Active |
| **Package Manager** | pnpm | ✅ Active |

### Deprecated (DO NOT USE)

| Technology | Replacement | Notes |
|------------|-------------|-------|
| SvelteKit | Nuxt 3 | Migration in progress |
| Svelte 5 runes (`$state`, `$derived`) | Vue 3 (`ref()`, `computed()`) | Different reactivity model |
| `event.platform.env.DB` | `hubDatabase()` | NuxtHub provides helpers |
| `event.platform.env.BOOK_CACHE` | `hubKV()` | NuxtHub provides helpers |
| NuxtHub Admin CLI (`nuxthub deploy`) | Cloudflare Pages CI or Wrangler | NuxtHub Admin sunset Dec 31, 2025 |
| `hubAI()` | `process.env.AI` or Vercel AI SDK | Deprecated in NuxtHub v0.10 |
| `event.params.id` | `getRouterParam(event, 'id')` | Nitro pattern |
| `throw error(404)` | `throw createError({ statusCode: 404 })` | Nitro pattern |
| `throw redirect(302, url)` | `return sendRedirect(event, url)` | Nitro pattern |

---

## 📂 Project Structure

```
rangkai/
├── app/                        # 📱 Client-side (Nuxt 4 structure)
│   ├── app.vue                 # Root component
│   ├── layouts/
│   │   └── default.vue         # App layout with nav/footer
│   ├── pages/                  # File-based routing
│   │   ├── index.vue           # Main search interface
│   │   ├── login.vue           # OAuth login
│   │   ├── dashboard.vue       # User history & stats
│   │   ├── history.vue         # Scan history list
│   │   ├── features.vue        # Features page
│   │   └── scan/
│   │       └── mobile.vue      # Mobile barcode scanner
│   ├── components/             # Vue components
│   │   ├── BookDetailModal.vue # Book details popup
│   │   ├── CameraScanner.vue   # Barcode scanner (client-only)
│   │   ├── ShareButtons.vue    # Social sharing
│   │   ├── Toast.vue           # Notifications
│   │   ├── SkeletonCard.vue    # Loading skeleton
│   │   └── ui/                 # Design system primitives
│   │       ├── Button.vue
│   │       ├── Card.vue
│   │       ├── Input.vue
│   │       └── ...
│   ├── composables/            # Vue composables (state management)
│   │   ├── useHistory.ts       # Local scan history
│   │   ├── useToast.ts         # Toast notifications
│   │   ├── useAuth.ts          # Authentication state
│   │   └── useApi.ts           # API client helpers
│   ├── utils/                  # Client-side utilities
│   │   ├── isbn.ts             # ISBN validation/normalization
│   │   └── export.ts           # CSV/SLiMS export
│   └── assets/
│       └── css/
│           └── main.css        # Global styles + Tailwind
│
├── server/                     # 🔧 Nitro server
│   ├── api/                    # API endpoints
│   │   ├── book/
│   │   │   └── [isbn].get.ts   # GET /api/book/:isbn
│   │   ├── scans/
│   │   │   ├── index.get.ts    # GET /api/scans (list)
│   │   │   ├── index.post.ts   # POST /api/scans (create)
│   │   │   └── [id].get.ts     # GET /api/scans/:id
│   │   ├── search/
│   │   │   └── title.get.ts    # GET /api/search/title?q=
│   │   ├── ai/
│   │   │   └── clean.post.ts   # POST /api/ai/clean
│   │   ├── auth/               # Better Auth endpoints
│   │   │   └── [...all].ts     # Catch-all auth routes
│   │   ├── dashboard/
│   │   │   └── stats.get.ts    # GET /api/dashboard/stats
│   │   ├── health.get.ts       # GET /api/health
│   │   └── openlibrary.get.ts  # OpenLibrary proxy
│   │
│   ├── database/               # Database layer
│   │   ├── schema.ts           # Drizzle ORM schema
│   │   └── migrations/         # Auto-generated SQL migrations
│   │       └── 0001_create-tables.sql
│   │
│   ├── middleware/             # Server middleware
│   │   ├── auth.ts             # Authentication check
│   │   └── redirects.ts        # URL redirects
│   │
│   ├── utils/                  # Server utilities
│   │   ├── drizzle.ts          # useDrizzle() helper
│   │   ├── cache.ts            # KV cache helpers
│   │   ├── logger.ts           # Structured logging
│   │   ├── auth.ts             # Auth utilities
│   │   ├── rate-limiter.ts     # Rate limiting
│   │   ├── cutter.ts           # Call number generation
│   │   ├── merge.ts            # Data merging logic
│   │   ├── schemas.ts          # Zod validation schemas
│   │   ├── versioning.ts       # Version history
│   │   ├── metadata/           # Metadata fetchers
│   │   │   ├── google.ts       # Google Books API
│   │   │   ├── openlibrary.ts  # OpenLibrary API
│   │   │   └── loc.ts          # Library of Congress API
│   │   └── ai/                 # AI utilities
│   │       └── clean.ts        # AI data cleaning
│   │
│   └── routes/                 # Non-API server routes
│       └── images/
│           └── [...pathname].get.ts  # Serve blob images
│
├── public/                     # Static assets
│   ├── favicon.ico
│   ├── manifest.json           # PWA manifest
│   └── robots.txt
│
├── types/                      # TypeScript types
│   └── index.ts                # Shared types (BookData, etc.)
│
├── nuxt.config.ts              # Nuxt configuration
├── drizzle.config.ts           # Drizzle ORM configuration
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies (pnpm)
└── .env                        # Environment variables (gitignored)
```

---

## ⚙️ Configuration

### nuxt.config.ts

```typescript
export default defineNuxtConfig({
  compatibilityDate: '2025-04-25',
  
  // Enable Nuxt 4 directory structure
  future: { compatibilityVersion: 4 },
  
  modules: [
    '@nuxthub/core',
    '@nuxt/eslint',
    '@nuxtjs/tailwindcss',
    '@vite-pwa/nuxt',          // Optional: PWA support
  ],
  
  // NuxtHub features
  hub: {
    database: true,   // D1 database
    kv: true,         // KV storage for caching
    blob: true,       // R2 blob storage
    cache: true,      // Edge caching
  },
  
  // Environment variables
  runtimeConfig: {
    // Server-only (access via useRuntimeConfig())
    openaiApiKey: process.env.OPENAI_API_KEY,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    betterAuthSecret: process.env.BETTER_AUTH_SECRET,
    
    // Public (exposed to client)
    public: {
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000',
    },
  },
  
  // Nitro server config
  nitro: {
    experimental: {
      openAPI: true,  // Enable API documentation
      tasks: true,    // Enable Nitro tasks
    },
  },
  
  // Development tools
  devtools: { enabled: true },
})
```

### drizzle.config.ts

```typescript
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'sqlite',
  schema: './server/database/schema.ts',
  out: './server/database/migrations',
})
```

### Environment Variables (.env)

```bash
# Authentication
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
BETTER_AUTH_SECRET=random-32-char-secret

# AI (optional)
OPENAI_API_KEY=sk-...

# Public
NUXT_PUBLIC_APP_URL=https://rangkai.nuxt.dev

# Remote storage (for `pnpm dev --remote`)
NUXT_HUB_PROJECT_SECRET_KEY=random-uuid
```

---

## 🚀 Commands

### Development

```bash
# Start development server
pnpm dev

# Start with remote storage (production data)
pnpm dev --remote

# Start with preview environment data
pnpm dev --remote=preview
```

### Database

```bash
# Generate migration from schema changes
pnpm db:generate

# Check migration status
npx nuxthub database migrations list

# Check production migrations
npx nuxthub database migrations list --production
```

### Build & Deploy

```bash
# Build for production
pnpm build

# Preview production build locally
pnpm preview
# OR
npx nuxthub preview

# Deploy (use Cloudflare Pages CI instead for production)
# NuxtHub Admin is deprecated as of Dec 31, 2025
```

### Quality

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Fix lint errors
pnpm lint --fix
```

---

## 🔄 Migration Reference (SvelteKit → Nuxt)

### Reactivity

| SvelteKit (Svelte 5) | NuxtHub (Vue 3) |
|---------------------|-----------------|
| `let x = $state(value)` | `const x = ref(value)` |
| `$derived(expr)` | `computed(() => expr)` |
| `$effect(() => {})` | `watchEffect(() => {})` |
| `$effect.pre(() => {})` | `watch(..., { flush: 'pre' })` |
| `onMount(() => {})` | `onMounted(() => {})` |
| `export let prop` | `defineProps<{ prop: Type }>()` |
| `dispatch('event')` | `emit('event')` |

### Data Fetching

| SvelteKit | NuxtHub |
|-----------|---------|
| `+page.server.ts` load | `useFetch('/api/...')` in page |
| `export const load` | Server: `server/api/*.ts` |
| `export const actions` | Server: `server/api/*.post.ts` |

### Component Syntax

**SvelteKit:**
```svelte
<script lang="ts">
  let { book }: { book: BookData } = $props()
  let localBook = $state<BookData | null>(null)
  
  $effect(() => {
    if (book) localBook = { ...book }
  })
</script>

{#if book}
  <div class="modal">
    <input bind:value={localBook.title} />
    <button onclick={save}>Save</button>
  </div>
{/if}
```

**NuxtHub:**
```vue
<script setup lang="ts">
const props = defineProps<{ book: BookData | null }>()
const emit = defineEmits<{ save: [book: BookData] }>()

const localBook = ref<BookData | null>(null)

watch(() => props.book, (newBook) => {
  if (newBook) localBook.value = { ...newBook }
}, { immediate: true })
</script>

<template>
  <div v-if="book" class="modal">
    <input v-model="localBook.title" />
    <button @click="emit('save', localBook!)">Save</button>
  </div>
</template>
```

### API Endpoints

**SvelteKit:**
```typescript
// src/routes/api/book/[isbn]/+server.ts
import { json, error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params, platform }) => {
  const { isbn } = params
  const db = platform.env.DB
  const cache = platform.env.BOOK_CACHE
  
  if (!isbn) throw error(400, 'ISBN required')
  
  const cached = await cache.get(isbn)
  if (cached) return json(JSON.parse(cached))
  
  // ... fetch logic
  return json(book)
}
```

**NuxtHub:**
```typescript
// server/api/book/[isbn].get.ts
export default eventHandler(async (event) => {
  const isbn = getRouterParam(event, 'isbn')
  if (!isbn) {
    throw createError({ statusCode: 400, message: 'ISBN required' })
  }
  
  // Use NuxtHub helpers instead of platform.env
  const cached = await hubKV().get<BookData>(`book:${isbn}`)
  if (cached) return cached
  
  // ... fetch logic
  await hubKV().set(`book:${isbn}`, book, { ttl: 86400 })
  return book
})
```

---

## 🗄️ NuxtHub Runtime APIs

### Database (`hubDatabase()`)

```typescript
// Direct D1 queries
const db = hubDatabase()
const { results } = await db.prepare('SELECT * FROM users').all()

// With Drizzle ORM (recommended)
const db = useDrizzle()
const users = await db.select().from(tables.users).where(eq(tables.users.id, id))
```

### KV Storage (`hubKV()`)

```typescript
// Set with TTL (24 hours)
await hubKV().set('book:978123456', bookData, { ttl: 86400 })

// Get
const book = await hubKV().get<BookData>('book:978123456')

// Delete
await hubKV().del('book:978123456')

// List keys by prefix
const keys = await hubKV().keys('book:')

// Clear namespace
await hubKV().clear('book')
```

### Blob Storage (`hubBlob()`)

```typescript
// Upload
const blob = await hubBlob().put('covers/978123456.jpg', file, {
  contentType: 'image/jpeg',
  addRandomSuffix: false,
})

// Serve (in a route)
export default eventHandler(async (event) => {
  const { pathname } = getRouterParams(event)
  return hubBlob().serve(event, pathname)
})

// List
const { blobs } = await hubBlob().list({ prefix: 'covers/' })

// Delete
await hubBlob().del('covers/978123456.jpg')
```

### Caching (`cachedEventHandler`)

```typescript
// Cache API response for 1 hour
export default cachedEventHandler(async (event) => {
  const isbn = getRouterParam(event, 'isbn')
  return await fetchBookMetadata(isbn)
}, {
  maxAge: 60 * 60,
  getKey: (event) => getRouterParam(event, 'isbn')!,
})
```

---

## 🔐 Authentication Pattern

```typescript
// server/utils/auth.ts
import { betterAuth } from 'better-auth'

export const auth = betterAuth({
  database: hubDatabase(),
  socialProviders: {
    google: {
      clientId: useRuntimeConfig().googleClientId,
      clientSecret: useRuntimeConfig().googleClientSecret,
    },
  },
})

// server/api/auth/[...all].ts
export default eventHandler((event) => auth.handler(event))

// server/middleware/auth.ts
export default eventHandler(async (event) => {
  if (import.meta.prerender) return
  
  const publicRoutes = ['/api/health', '/api/auth', '/login', '/']
  if (publicRoutes.some(r => event.path.startsWith(r))) return
  
  const session = await auth.getSession(event)
  if (!session) {
    if (event.path.startsWith('/api/')) {
      throw createError({ statusCode: 401 })
    }
    return sendRedirect(event, '/login')
  }
  
  event.context.user = session.user
})
```

---

## 🚫 Deprecated Features (Avoid)

### NuxtHub Admin (Sunset Dec 31, 2025)

**DO NOT USE:**
- `npx nuxthub deploy` - Use Cloudflare Pages CI instead
- `npx nuxthub link` - Use self-hosted configuration
- NuxtHub Admin dashboard - Use Cloudflare Dashboard

**Self-hosted deployment:**
1. Create D1, KV, R2 resources in Cloudflare Dashboard
2. Create a Cloudflare Pages project linked to GitHub
3. Configure bindings: `DB`, `KV`, `BLOB`, `CACHE`
4. Set `nodejs_compat` compatibility flag
5. Deploy via Git push

### hubAI() (Deprecated in v0.10)

**OLD:**
```typescript
const ai = hubAI()
await ai.run('@cf/meta/llama-3.1-8b-instruct', { prompt })
```

**NEW:**
```typescript
// Direct binding
const ai = process.env.AI
await ai.run('@cf/meta/llama-3.1-8b-instruct', { prompt })

// OR with Vercel AI SDK (recommended)
import { streamText } from 'ai'
import { createWorkersAI } from 'workers-ai-provider'

const workersAI = createWorkersAI({ binding: process.env.AI })
return streamText({
  model: workersAI('@cf/meta/llama-3.1-8b-instruct'),
  messages,
}).toDataStreamResponse()
```

---

## 📦 Dependencies to Add

```bash
# Core (already in starter)
# @nuxthub/core, nuxt, @nuxt/eslint

# Add for full Rangkai migration
pnpm add drizzle-orm zod better-auth @ai-sdk/openai ai html5-qrcode
pnpm add -D drizzle-kit @nuxtjs/tailwindcss @vite-pwa/nuxt
pnpm add -D @vue/test-utils vitest @playwright/test
```

---

## 📝 Migration Phases

### Phase 1: Database & Server Utils ✅
1. Create `server/database/schema.ts`
2. Create `server/utils/drizzle.ts`
3. Create `server/utils/cache.ts`
4. Test with `server/api/health.get.ts`

### Phase 2: Authentication 🔄
1. Create `server/utils/auth.ts`
2. Create `server/middleware/auth.ts`
3. Create `server/api/auth/[...all].ts`
4. Create `app/composables/useAuth.ts`

### Phase 3: Core API Endpoints 🔄
1. `server/api/book/[isbn].get.ts`
2. `server/api/scans/*.ts`
3. `server/api/search/title.get.ts`
4. `server/api/ai/clean.post.ts`

### Phase 4: Pages & Components ⏳
1. `app/layouts/default.vue`
2. `app/pages/index.vue`
3. `app/pages/login.vue`
4. `app/pages/dashboard.vue`
5. `app/pages/history.vue`
6. `app/pages/scan/mobile.vue`

### Phase 5: State & Composables ⏳
1. `app/composables/useHistory.ts`
2. `app/composables/useToast.ts`
3. `app/composables/useApi.ts`

### Phase 6: Testing & Polish ⏳
1. Set up Vitest
2. Update Playwright tests
3. Test PWA
4. Performance optimization

---

## 🔗 Resources

### Official Documentation
- [NuxtHub Docs](https://hub.nuxt.com/docs)
- [Nuxt 3 Docs](https://nuxt.com/docs)
- [Vue 3 Docs](https://vuejs.org/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Nitro](https://nitro.build/)
- [Tailwind CSS](https://tailwindcss.com/)

### Cloudflare
- [D1 Database](https://developers.cloudflare.com/d1/)
- [KV Storage](https://developers.cloudflare.com/kv/)
- [R2 Storage](https://developers.cloudflare.com/r2/)
- [Workers AI](https://developers.cloudflare.com/workers-ai/)

### Migration Source
- [rangkai-book-metadata](https://github.com/missmuthi/rangkai-book-metadata) - SvelteKit source

---

**Need Help?** Check the `agents.md` file for specialized AI agent prompts.

---

## 📝 Versioning & Changelog (Policy)

All team members must use a single `changelog.md` at the project root. This file records versioned, human-readable changes to the project and is required for all PRs that change the repository.

Rules (strict):

- Initialize the changelog at version `0.0.1`. This is the starting point and is already recorded.
- When creating a PR for any change which will be merged to `main`, include an entry in `changelog.md` with the next version number and a short description.
- Use Semantic Versioning where possible: MAJOR.MINOR.PATCH
  - increment `PATCH` for bug fixes, docs or small changes
  - increment `MINOR` for newly added features or improvements
  - increment `MAJOR` for breaking changes (rare — requires coordination)
- Write entries using categories: `Added`, `Changed`, `Fixed`, `Deprecated`, `Removed`.
- Example PR checklist items to enforce:
  - [ ] Updated `changelog.md` with a new version
  - [ ] Added/updated tests (if needed)
  - [ ] Updated docs (if changes impact docs)
- Example changelog entry format:

```
### 0.0.2 — 2025-12-20
 - Added: server/api/ai/clean.post.ts
 - Changed: Migration to Drizzle ORM helpers
```

Implementation notes:

- For PRs that introduce multiple small changes, pick a single version bump that best represents the combined changes (e.g. `0.0.2` → `0.1.0`) and summarize the highlights.
- When merging to `main`, doublecheck the `changelog.md` entry is included and accurate.
- Optionally include a link to the PR or commit hash in the changelog entry.

This policy helps maintain a readable history and reduces release friction when we publish versions or create deployment notes.

### Enforcement

- A GitHub Actions workflow (`.github/workflows/check-changelog.yml`) will run on pull requests and fail checks if source/config/docs/tests changes are detected without a `changelog.md` update.
- Use the PR template (`.github/PULL_REQUEST_TEMPLATE.md`) to add a changelog note and version when opening or editing a PR.
