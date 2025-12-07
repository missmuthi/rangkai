---
description: Git push and deploy to Cloudflare Pages (production)
---

# Git Push and Deploy

Use this workflow to commit, push, and deploy to production at https://rangkai-d3k.pages.dev

## Steps

// turbo

1. Stage all changes

```bash
git add -A
```

2. Commit with a descriptive message

```bash
git commit -m "feat: your commit message here"
```

// turbo 3. Push to remote

```bash
git push
```

// turbo 4. Build the Nuxt application

```bash
npm run build
```

// turbo 5. Deploy to Cloudflare Pages

```bash
npx wrangler pages deploy dist --project-name=rangkai --branch=main
```

## Important

- **Do NOT use `npm run deploy`** - This deploys to the wrong target (Workers)
- The correct target is **rangkai-d3k.pages.dev**
