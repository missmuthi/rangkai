# ERRORS.md

Recurring errors and debugging notes captured from the repository.

## Install and Tooling
- If Nuxt types or generated files are missing, rerun `bun install` so `nuxt prepare` runs.
- If the `ms` package behaves incorrectly after install, check `patches/ms.patch` and the `patch:ms` script.

## Auth and Environment
- Missing auth secrets or OAuth variables can break login and protected routes.
- If Google sign-in does not appear, verify the Cloudflare/Nuxt auth environment variables in the deployment environment.

## Testing
- Playwright E2E tests use `playwright.config.ts` with an auth setup project.
- If E2E tests fail on auth pages, verify the auth setup file and the `playwright/.auth/user.json` storage state.
- If tests need to run without live APIs, check whether the suite expects mocked API responses.

## Deployment and Database
- Cloudflare deploys require the correct Wrangler bindings and production secrets.
- D1 migration failures usually point to missing bindings, wrong database names, or an out-of-date migration file path.
- If deploys fail after build, verify `bun run build` still produces `dist`.

## Scanner and Browser Behavior
- Scanner pages depend on camera permissions and wasm assets.
- If the camera flow breaks, check the camera permissions policy in `nuxt.config.ts` and the assets under `public/wasm`.
