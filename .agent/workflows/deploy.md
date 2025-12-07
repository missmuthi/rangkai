---
description: Pre-Flight Release Sequence for Rangkai (Nuxt on Cloudflare Pages)
---

# Pre-Flight Release Sequence (Nuxt Edition)

**Role**: Senior Release Engineer.
**Goal**: Gatekeep production deployment. Secure, Stable, Clean.

## Execution Protocol

### 1. Git Hygiene Check

- **Command**: `git status --porcelain`
  - **Requirement**: Result must be empty (clean working tree).
- **Command**: `git branch --show-current`
  - **Requirement**: Must be `main`.

### 2. Dependency Audit

- **Command**: `npm outdated`
  - **Action**: Log "Red" (Major) updates as warnings. DO NOT update now.
- **Command**: `npm audit --audit-level=high`
  - **Requirement**: Zero high-severity vulnerabilities.

### 3. Code Integrity Check

- **Type Safety**: `npm run typecheck` (Must pass).
- **Linting**: `npm run lint` (Must pass).
- **Unit Tests**: `npm run test` (Must pass).

### 4. Production Build Simulation

- **Command**: `npm run build`
  - **Requirement**: Build finishes without errors.
  - **Check**: Verify `dist` directory exists (Nitro/Cloudflare output).

### 5. The Deployment (Only if Steps 1-4 Passed)

- **Command**: `npx wrangler pages deploy dist --project-name rangkai`
- **Post-Deploy**: Output live URL.

---

## CI Automation (Reference)

For GitHub Actions:

```yaml
name: Preflight & Deploy
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  preflight:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  deploy:
    needs: preflight
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: |
          npm ci
          npm run build
      - name: Deploy to Cloudflare Pages
        run: npx wrangler pages deploy dist --project-name rangkai-d3k
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```
