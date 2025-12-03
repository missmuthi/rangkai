# Pull Request Template

Please include the following in your PR. This helps maintainers review changes quickly and ensures project release notes are accurate.

## Summary
A short description of the changes in this PR.

## Checklist
- [ ] I have added/updated documentation if required
- [ ] I have added/updated tests if required
- [ ] I have updated `changelog.md` with a new entry and version number (required for changes to code/docs/tests/configs)
- [ ] This PR updates package dependencies only (no other source-file changes) — if yes, add details below

## Changelog Entry
Add a short changelog entry here (add the version to be used, a date, and one-line bullet points):

```
### 0.0.X — YYYY-MM-DD
 - Added: Example change
 - Changed: Example change
```

Notes:
- If the PR touches files under `app/`, `server/`, `types/`, `docs/`, or configuration files (like `nuxt.config.ts`, `drizzle.config.ts`), you MUST update `changelog.md` with the new version and a short entry.
- Minor docs-only changes (no functional code) still require a `changelog.md` update as a patch release.
