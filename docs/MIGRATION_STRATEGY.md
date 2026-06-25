# Database Migration Strategy

## Current Behavior
Migrations are explicit and environment-specific:

```bash
bun run migrate:preview
bun run migrate:prod
```

Deploy workflows do not apply D1 migrations automatically. Verify the target
database first, apply the migration separately, then deploy code.

## Risk
Large migrations (adding indexes on 100k+ rows) can timeout during Cloudflare deployment.

## Recommended Decoupling (For Future Scale)

### Option 1: Manual GitHub Action
Create `.github/workflows/migrate.yml`:
```yaml
name: Database Migration
on:
  workflow_dispatch:  # Manual trigger button
    inputs:
      migration_file:
        description: 'Migration file to run'
        required: true
        default: 'server/db/migrations/0001_init.sql'

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: bun install
      - name: Run Migration
        run: bunx wrangler d1 execute rangkai-db --remote --file=${{ github.event.inputs.migration_file }}
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

### Preview and Production

- Preview database: `rangkai-preview`
- Production database: `rangkai-db`
- Runtime binding name remains `DB`.
- `preview_database_id` in `wrangler.toml` prevents remote preview development
  and preview uploads from falling back to the production D1 database.

## When to Switch
- If `bun run migrate:prod` takes >15 seconds
- If deployment fails with timeout errors
- Before any breaking schema change (column type changes, etc.)
