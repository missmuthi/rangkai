# E2E Testing Guide

This document describes the E2E testing setup for Rangkai, including the Real ISBN Scan test workflow.

---

## Quick Start

```bash
# Run all E2E tests with mocks (fast, reliable)
npx playwright test

# Run specific real ISBN test
npx playwright test real-isbn-scan.spec.ts

# Run with browser visible
npx playwright test --headed

# Run against real APIs (integration mode)
E2E_MOCKS=false npx playwright test
```

---

## Test Structure

```
tests/e2e/
├── fixtures/
│   └── book-9780684835396.json    # Test data
├── mocks/
│   └── api-mocks.ts               # API route interception
├── utils/
│   └── test-reporter.ts           # JSON report generator
├── auth.setup.ts                  # Auth session setup
├── real-isbn-scan.spec.ts         # Main ISBN workflow test
└── *.spec.ts                      # Other test files
```

---

## Real ISBN Scan Test

The `real-isbn-scan.spec.ts` validates the complete book scanning workflow:

### Test Workflow (11 Steps)

1. Navigate to `/scan/mobile`
2. Wait for scanner UI to load
3. Enter ISBN `9780684835396` and search
4. Verify book title appears
5. Verify author appears
6. Verify ISBN is displayed
7. Open book details view
8. Verify metadata fields
9. Check for cover image
10. Navigate to history page
11. Check for console errors

### Test Data

- **ISBN**: `9780684835396`
- **Title**: "I Don't Want to Talk About It"
- **Author**: Terrence Real

### AI Clean Persistence Test (`ai-clean-persistence.spec.ts`)

Validates that "AI Clean" data allows User Overrides to persist:

1.  Scan/Search for a book (e.g., `9780684854670` - _The Noonday Demon_).
2.  Click "AI Clean".
3.  Verify "AI Enhanced" badge appears.
4.  Refresh the page.
5.  **Verify Badge Persists**.
6.  Verify `source` is "openlibrary" or "ai" (not "google").
7.  Go to History -> Verify "DDC" column is populated.

---

## Mock vs Integration Mode

### Mocks Enabled (Default)

```bash
npx playwright test real-isbn-scan.spec.ts
```

- Uses route interception for `/api/book/*` and `/api/scans`
- Returns fixture data instantly
- Fast and reliable for CI/CD

### Integration Mode

```bash
E2E_MOCKS=false npx playwright test real-isbn-scan.spec.ts
```

- Calls real Google Books API
- Tests actual database operations
- Slower, may fail due to rate limits

---

## Configuration

### Environment Variables

| Variable       | Default                 | Description                      |
| -------------- | ----------------------- | -------------------------------- |
| `E2E_MOCKS`    | `true`                  | Use mocked APIs                  |
| `E2E_BASE_URL` | `http://localhost:3000` | Base URL for tests               |
| `CI`           | -                       | CI mode (retries, single worker) |

### Playwright Config

- **Timeout**: 60s per test
- **Screenshots**: On failure only
- **Video**: Retained on failure
- **Trace**: On first retry

---

## Test Reports

### JSON Reports

Generated to `test-results/e2e-reports/` with:

- Step-by-step results
- API call capture
- Console messages
- Network errors
- Screenshots on failure

### HTML Report

```bash
npx playwright show-report test-results/html-report
```

---

## Adding New Tests

```typescript
import { test, expect } from "@playwright/test";
import { setupAllMocks } from "./mocks/api-mocks";
import { TestReporter } from "./utils/test-reporter";

test.describe("My Feature", () => {
  test.beforeEach(async ({ page }) => {
    await setupAllMocks(page);
  });

  test("should do something", async ({ page }) => {
    await page.goto("/my-page");
    await expect(page.getByText("Hello")).toBeVisible();
  });
});
```

---

## Troubleshooting

### Test Timeout

- Increase timeout in `playwright.config.ts`
- Check if dev server is running

### Element Not Found

- UI may have changed, update selectors
- Check browser console for errors

### API Failures (Integration Mode)

- Check network connectivity
- Verify Google Books API is accessible
- Check for rate limiting
