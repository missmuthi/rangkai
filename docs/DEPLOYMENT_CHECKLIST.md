# Pre-Deployment Checklist

## Tier 1: Git Push (Routine Code Saving)
- [ ] `pnpm lint` — 0 errors
- [ ] `pnpm typecheck` — 0 errors
- [ ] `pnpm build` — succeeds

## Tier 2: Production Deploy (Major Release)

### Code Quality
- [ ] `pnpm lint` — 0 errors
- [ ] `pnpm typecheck` — 0 errors
- [ ] `pnpm test` — 100% passing
- [ ] `pnpm test:e2e` — 100% passing

### Build & Bundle
- [ ] `pnpm build` — succeeds
- [ ] Bundle size < 200KB gzipped (check .output/public/_nuxt/)
- [ ] No console errors in dev tools

### Performance
- [ ] Lighthouse Performance > 90
- [ ] Lighthouse Accessibility > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s

### Accessibility
- [ ] All images have alt text
- [ ] Color contrast WCAG AA compliant
- [ ] Keyboard navigation works
- [ ] Screen reader tested

### Security
- [ ] No secrets in code (check .env.example)
- [ ] CSP headers configured
- [ ] Auth routes protected
- [ ] User data isolation verified
- [ ] Google OAuth credentials added as secrets (NUXT_OAUTH_GOOGLE_CLIENT_ID, NUXT_OAUTH_GOOGLE_CLIENT_SECRET)

### Documentation
- [ ] README.md updated
- [ ] CHANGELOG.md updated with version
- [ ] API docs current
- [ ] Migration notes if breaking changes

### Version & Git
- [ ] Version bumped in package.json (semver)
- [ ] Git tag created: `git tag -a v{x.y.z} -m "Release v{x.y.z}"`
- [ ] Git push with tags: `git push origin main --tags`

### Deployment
- [ ] Environment variables set in NuxtHub dashboard
- [ ] D1 migrations applied (if any)
- [ ] Deploy: `npx nuxthub deploy`
- [ ] Smoke test production URL
- [ ] Monitor error logs for 30 minutes
