# Browser Behavior Baseline

This document records observed Nuxt 3 behavior from live browser sessions on `http://127.0.0.1:3000`.

## Environment

- App URL: `http://127.0.0.1:3000`
- Hostname used: `127.0.0.1`
- Browser tool: `agent-browser 0.29.1`
- Desktop session: `rangkai-nuxt3-baseline`
- Mobile session: `rangkai-mobile-baseline`
- Saved screenshots:
  - `artifacts/browser-baseline/nuxt3/screenshots/home.png`
  - `artifacts/browser-baseline/nuxt3/screenshots/mobile-home.png`

## Observed Behavior

| Workflow | Start URL | Auth State | Observed Behavior | Console / Network Notes | Status |
|---|---|---|---|---|---|
| Home page | `/` | Unauthenticated | Loads the marketing landing page with the headline "The Fastest Way to Catalog Books for SLiMS" and visible CTAs for starting or learning more. | No hydration warnings or `/docs` router warnings after the fix. Dev browser sessions still report a PWA service-worker registration failure because `.nuxt/dev-sw-dist/sw.js` is missing. | Intended, with a dev-only PWA warning |
| Login page | `/login` | Unauthenticated | Loads a login screen with a single "Continue with Google" button. No username/password form is present. | No hydration warnings or `/docs` router warnings after the fix. Dev browser sessions still report the same PWA service-worker registration failure. | Intended, with a dev-only PWA warning |
| Dashboard route | `/dashboard` | Unauthenticated | Redirects to `/login?redirect=/dashboard` before the dashboard shell renders. | No private dashboard content renders. The previous `/api/groups 401` fetch is no longer reached on direct unauthenticated visits. | Intended |
| History route | `/history` | Unauthenticated | Redirects to `/login?redirect=/history`. | No route content remains on `/history` after redirect. | Intended |
| Scan route | `/scan` | Unauthenticated | Redirects to `/login?redirect=/scan/mobile`. | No route content remains on `/scan`. | Intended |
| Mobile home | `/` on iPhone 14 viewport | Unauthenticated | Shows the same marketing page in a mobile layout. The visible content matches the desktop structure. | Same hydration warnings and `/docs` router warning are present. | Intended, with warnings |

## Baseline Notes

- The public home page is accessible without authentication.
- The login page is present, but no local credentials were exercised during this baseline.
- Protected-route behavior is now consistent for the observed private routes:
  - `dashboard`, `history`, and `scan` all redirect to login when unauthenticated.
  - `history` preserves `/history` in the redirect query.
  - `scan` preserves `/scan/mobile` in the redirect query.
- The landing page no longer emits the earlier hydration warnings or `/docs` router warning.
- Dev browser sessions still show a PWA service-worker registration failure caused by the missing `.nuxt/dev-sw-dist/sw.js` file. This did not block the critical contract suite, but it is still visible in live browser debugging.
- This baseline now covers the unauthenticated contract only. It does not validate auth success, export, or scanner workflows because no authenticated session was available in the browser session.

## Evidence Map

- `artifacts/browser-baseline/nuxt3/screenshots/home.png`
- `artifacts/browser-baseline/nuxt3/screenshots/mobile-home.png`

## Follow-Up Needed

- Capture an authenticated baseline before treating the critical-path browser contract as complete.
- Decide whether the dev-only PWA service-worker failure should be suppressed in the dev browser setup or accepted as known noise.
