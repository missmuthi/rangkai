# Database Migration Strategy

## Current Behavior
Migrations run automatically on `npx nuxthub deploy` via the hook in `package.json`:
```json
"nuxthub": {
  "hooks": {
    "deploy": "npm run migrate:prod"
  }
}
```

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
        default: 'server/db/migrations/latest.sql'

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - name: Run Migration
        run: npx wrangler d1 execute rangkai-db --remote --file=${{ github.event.inputs.migration_file }}
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

### Option 2: Keep Current (Acceptable for Now)
Current approach is fine until:
- Table has 50k+ rows
- Migration involves complex indexes or data transforms
- Deployment timeouts occur

## When to Switch
- If `npm run migrate:prod` takes >15 seconds
- If deployment fails with timeout errors
- Before any breaking schema change (column type changes, etc.)
