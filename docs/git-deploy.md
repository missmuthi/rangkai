# Rangkai Deployment Guide

This guide covers best practices for deploying the Rangkai Book Scanner application to Cloudflare Pages using **wrangler.toml as the source of truth**.

> ✅ **Recommended Approach**: Use `wrangler.toml` to configure all bindings and deploy via CLI. This ensures reproducible deployments and version-controlled configuration.

## Prerequisites

- A [Cloudflare account](https://dash.cloudflare.com/sign-up)
- A GitHub repository with your Rangkai project
- Node.js 20+ and pnpm installed locally
- Wrangler CLI: `npm install -g wrangler`

## Architecture Overview

Rangkai uses the following Cloudflare services:
- **Cloudflare Pages** - Edge hosting for the Nuxt application with SSR
- **D1 Database** - SQLite-compatible database for scans, users, sessions
- **KV Storage** - Key-value cache for book metadata (24h TTL)

> **Note**: R2 Blob Storage is optional and disabled by default. Enable it in `nuxt.config.ts` if needed.

---

## Quick Start (One-time Setup)

### Step 1: Create Cloudflare Resources

```bash
# Login to Cloudflare
npx wrangler login

# Create D1 database
npx wrangler d1 create rangkai-db

# Create KV namespaces
npx wrangler kv namespace create KV
npx wrangler kv namespace create CACHE
```

Note the IDs returned for each resource.

### Step 2: Configure wrangler.toml

Update `wrangler.toml` with the resource IDs:

```toml
# Wrangler configuration for Rangkai
# This file is the SOURCE OF TRUTH for Pages Functions configuration
# https://developers.cloudflare.com/pages/functions/wrangler-configuration/

name = "rangkai"
compatibility_date = "2025-04-25"
compatibility_flags = ["nodejs_compat"]

# Pages configuration - enables wrangler.toml as source of truth
pages_build_output_dir = "dist"

# D1 Database
[[d1_databases]]
binding = "DB"
database_name = "rangkai-db"
database_id = "YOUR_DATABASE_ID"  # From step 1

# KV Namespaces
[[kv_namespaces]]
binding = "KV"
id = "YOUR_KV_NAMESPACE_ID"  # From step 1

[[kv_namespaces]]
binding = "CACHE"
id = "YOUR_CACHE_NAMESPACE_ID"  # From step 1

# Environment Variables
[vars]
NUXT_PUBLIC_SITE_URL = "https://your-project.pages.dev"
```

### Step 3: Apply Database Migrations

```bash
npx wrangler d1 execute rangkai-db --remote --file=./server/db/migrations/0001_init.sql
```

### Step 4: Add Secrets

```bash
# Generate and add auth secret
openssl rand -base64 32 | npx wrangler pages secret put NUXT_AUTH_SECRET --project-name=rangkai
```

### Step 5: Build and Deploy

```bash
# Build the application
pnpm build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name=rangkai --branch=main
```

---

## Deployment Workflow

### Local Development

```bash
# Start dev server with local bindings
pnpm dev

# Or connect to remote Cloudflare resources
pnpm dev --remote
```

### Quality Checks (before deployment)

```bash
# Run all checks
pnpm typecheck && pnpm lint && pnpm test
```

### Production Deployment

```bash
# Build and deploy
pnpm build
npx wrangler pages deploy dist --project-name=rangkai --branch=main
```

---

## GitHub Actions CI/CD

Create `.github/workflows/deploy.yml`:

```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality:
    name: Quality Checks
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm test

  deploy:
    name: Deploy to Production
    needs: quality
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
    environment:
      name: production
      url: ${{ steps.deploy.outputs.deployment-url }}
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm build
      - name: Deploy to Cloudflare Pages
        id: deploy
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy dist --project-name=rangkai --branch=main
```

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | API token with Pages:Edit, D1:Edit, KV:Edit permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |

---

## Configuration Reference

### nuxt.config.ts

```typescript
export default defineNuxtConfig({
  modules: ['@nuxthub/core', '@nuxt/eslint', '@nuxtjs/tailwindcss', '@vite-pwa/nuxt'],
  hub: {
    database: true,
    kv: true,
    blob: false,  // Enable if R2 is available
    cache: true,
  },
})
```

### wrangler.toml Structure

```toml
name = "rangkai"
compatibility_date = "2025-04-25"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = "dist"

# Bindings (applied to all environments)
[[d1_databases]]
binding = "DB"
database_name = "rangkai-db"
database_id = "xxx"

[[kv_namespaces]]
binding = "KV"
id = "xxx"

[[kv_namespaces]]
binding = "CACHE"
id = "xxx"

[vars]
NUXT_PUBLIC_SITE_URL = "https://rangkai-d3k.pages.dev"

# Environment overrides (optional)
# [env.preview]
# [env.preview.vars]
# NUXT_PUBLIC_SITE_URL = "https://preview.rangkai-d3k.pages.dev"
```

---

## Troubleshooting

### 500 Error After Deployment

1. Check bindings are configured in `wrangler.toml`
2. Verify `pages_build_output_dir = "dist"` is set
3. Ensure `nodejs_compat` flag is enabled

### TypeScript Errors with hubBlob()

If R2 is not enabled, set `blob: false` in `nuxt.config.ts` and remove blob-related API files.

### Database Not Found

```bash
# Verify D1 exists
npx wrangler d1 list

# Check binding name matches "DB"
```

### KV Access Errors

```bash
# Verify KV namespaces exist
npx wrangler kv namespace list

# Check binding names match "KV" and "CACHE"
```

---

## Useful Commands

```bash
# List all resources
npx wrangler d1 list
npx wrangler kv namespace list
npx wrangler pages project list

# View deployment logs
npx wrangler pages deployment tail rangkai

# Execute SQL on production D1
npx wrangler d1 execute rangkai-db --remote --command="SELECT * FROM users"

# Rollback to previous deployment
# Go to Cloudflare Dashboard → Pages → rangkai → Deployments → Rollback
```

---

## Production Checklist

Before going public:

- [x] `wrangler.toml` configured with all bindings
- [x] D1 database created and migrations applied
- [x] KV namespaces created (KV and CACHE)
- [x] `NUXT_AUTH_SECRET` secret added
- [x] `NUXT_PUBLIC_SITE_URL` environment variable set
- [x] All quality checks pass (typecheck, lint, test)
- [x] Production deployment successful
- [ ] Google OAuth configured (if using authentication)
- [ ] Custom domain configured (optional)

---

## Current Production Status

| Resource | Status | URL/ID |
|----------|--------|--------|
| Pages Project | ✅ Deployed | https://rangkai-d3k.pages.dev |
| D1 Database | ✅ Created | `rangkai-db` |
| KV Namespace | ✅ Created | `KV` binding |
| Cache Namespace | ✅ Created | `CACHE` binding |
| Auth Secret | ✅ Configured | NUXT_AUTH_SECRET |

---

## Additional Resources

- [Cloudflare Pages Wrangler Configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/)
- [NuxtHub Documentation](https://hub.nuxt.com/docs)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Cloudflare KV Documentation](https://developers.cloudflare.com/kv/)
