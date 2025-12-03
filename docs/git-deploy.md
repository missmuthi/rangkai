# Rangkai Deployment Guide

This guide covers best practices for deploying the Rangkai Book Scanner application to Cloudflare using the **self-hosted** approach (recommended by NuxtHub).

> ⚠️ **Note**: NuxtHub Admin is being sunset on December 31st, 2025. This guide uses the recommended self-hosted deployment with Cloudflare Pages CI.

## Prerequisites

- A [Cloudflare account](https://dash.cloudflare.com/sign-up)
- A GitHub repository with your Rangkai project
- Node.js 20+ and pnpm installed locally

## Architecture Overview

Rangkai uses the following Cloudflare services:
- **D1 Database** - SQLite-compatible database for scans, users, sessions
- **KV Storage** - Key-value cache for book metadata (24h TTL)
- **R2 Blob Storage** - Object storage for book covers/images
- **Pages** - Edge hosting for the Nuxt application

---

## Step 1: Create Cloudflare Resources

Before deploying, create the necessary resources in your Cloudflare dashboard.

### 1.1 Create D1 Database

```bash
# Using Wrangler CLI
npx wrangler d1 create rangkai-db
```

Or via [Cloudflare Dashboard → D1](https://dash.cloudflare.com/?to=/:account/workers/d1):
- Click "Create database"
- Name: `rangkai-db`
- Note the **Database ID** for later

### 1.2 Create KV Namespaces

```bash
# Main KV namespace
npx wrangler kv:namespace create KV

# Cache namespace (separate for clarity)
npx wrangler kv:namespace create CACHE
```

Or via [Cloudflare Dashboard → KV](https://dash.cloudflare.com/?to=/:account/workers/kv/namespaces):
- Create two namespaces: `rangkai-kv` and `rangkai-cache`
- Note both **Namespace IDs**

### 1.3 Create R2 Bucket

```bash
npx wrangler r2 bucket create rangkai-blob
```

Or via [Cloudflare Dashboard → R2](https://dash.cloudflare.com/?to=/:account/r2/new):
- Create bucket: `rangkai-blob`
- Note the **Bucket ID** from Settings → Bucket Details

---

## Step 2: Create Cloudflare Pages Project

1. Go to [Cloudflare Dashboard → Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages/create)
2. Click **"Create"** → **"Pages"** → **"Connect to Git"**
3. Select your GitHub repository (`rangkai`)
4. Configure build settings:
   - **Framework preset**: None (we use custom)
   - **Build command**: `pnpm build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (or your app directory)

---

## Step 3: Configure Bindings

In your Cloudflare Pages project, go to **Settings → Functions → Bindings**:

### Required Bindings

| Type | Variable Name | Resource |
|------|---------------|----------|
| D1 Database | `DB` | Select `rangkai-db` |
| KV Namespace | `KV` | Select `rangkai-kv` |
| KV Namespace | `CACHE` | Select `rangkai-cache` |
| R2 Bucket | `BLOB` | Select `rangkai-blob` |

### Compatibility Flags

Go to **Settings → Functions → Compatibility flags**:
- Add: `nodejs_compat`

---

## Step 4: Environment Variables

In **Settings → Environment Variables**, add:

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NUXT_AUTH_SECRET` | Secret for better-auth sessions (32+ chars) | `openssl rand -base64 32` |
| `NUXT_OAUTH_GOOGLE_CLIENT_ID` | Google OAuth client ID | `xxx.apps.googleusercontent.com` |
| `NUXT_OAUTH_GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `GOCSPX-xxx` |
| `NUXT_PUBLIC_SITE_URL` | Your production URL | `https://rangkai.pages.dev` |

### Optional Variables (for DevTools/Admin features)

| Variable | Description |
|----------|-------------|
| `NUXT_HUB_CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |
| `NUXT_HUB_CLOUDFLARE_API_TOKEN` | API token with R2 Read/Write, KV Read/Write |

### Generating Secrets

```bash
# Generate auth secret
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Step 5: Configure Branch Deployments

### Production Branch
- Set your production branch to `main`
- Production deployments are accessible at your primary domain

### Preview Deployments
- Non-production branches (PRs, feature branches) deploy to:
  - `<commit>.<project>.pages.dev`
  - `<branch>.<project>.pages.dev`

---

## Step 6: GitHub Actions Workflow (Optional)

For more control over deployments, use GitHub Actions with Wrangler. This workflow runs quality checks on all PRs and deploys only when merged to `main`:

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
  # Run quality checks on all pushes and PRs
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

  # Deploy to Cloudflare Pages (main branch only)
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
        env:
          NUXT_PUBLIC_SITE_URL: ${{ secrets.NUXT_PUBLIC_SITE_URL }}
      - name: Deploy to Cloudflare Pages
        id: deploy
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy dist --project-name=rangkai --branch=main
```

### Required GitHub Secrets

Add these to your repository's **Settings → Secrets and variables → Actions**:

| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | API token with Pages:Edit permission |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |
| `NUXT_PUBLIC_SITE_URL` | Your production URL |

---

## Step 7: Database Migrations

After first deployment, run migrations:

```bash
# Apply migrations to production D1
npx wrangler d1 execute rangkai-db --remote --file=./server/db/migrations/0001_init.sql
```

Or use NuxtHub's built-in migration system:
```bash
# Generate migration
npx nuxt dev --remote
# Then use NuxtHub DevTools to run migrations
```

---

## Deployment Commands Cheatsheet

```bash
# Local development
pnpm dev

# Build for production
pnpm build

# Preview production build locally
pnpm preview

# Deploy using NuxtHub (if using admin)
npx nuxthub deploy

# Deploy using Wrangler
npx wrangler pages deploy dist --project-name=rangkai

# Connect to remote storage for local dev
pnpm dev --remote
```

---

## Troubleshooting

### Build Fails with Missing Bindings

Ensure all bindings (D1, KV, R2) are configured in Cloudflare Pages settings.

### OAuth Redirect Issues

1. Add your Pages URL to Google OAuth authorized redirect URIs:
   - `https://your-project.pages.dev/api/auth/callback/google`
   - `https://your-custom-domain.com/api/auth/callback/google`

2. Ensure `NUXT_PUBLIC_SITE_URL` matches your actual domain.

### D1 Database Not Found

1. Verify the D1 database binding is named exactly `DB`
2. Check that `nodejs_compat` compatibility flag is enabled

### KV/R2 Access Errors

1. Verify bindings are named `KV`, `CACHE`, and `BLOB` respectively
2. For blob presigned URLs, add `NUXT_HUB_CLOUDFLARE_*` environment variables

---

## Production Checklist

Before deploying to production:

- [ ] All environment variables configured
- [ ] D1, KV, R2 bindings created and linked
- [ ] `nodejs_compat` compatibility flag enabled
- [ ] Google OAuth redirect URIs configured
- [ ] Database migrations applied
- [ ] Custom domain configured (optional)
- [ ] SSL/TLS mode set to "Full (strict)" (if using custom domain)

---

## Monitoring & Observability

- **Logs**: Cloudflare Dashboard → Workers & Pages → Your Project → Logs
- **Analytics**: Cloudflare Dashboard → Workers & Pages → Your Project → Analytics
- **Real-time Logs**: `npx wrangler pages deployment tail`

---

## Rollback

To rollback to a previous deployment:

1. Go to Cloudflare Dashboard → Workers & Pages → Your Project → Deployments
2. Find the deployment you want to restore
3. Click "..." → "Rollback to this deployment"

---

## Additional Resources

- [NuxtHub Deployment Docs](https://hub.nuxt.com/docs/getting-started/deploy)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- [better-auth Documentation](https://www.better-auth.com/)
