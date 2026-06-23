import { expect, test, type BrowserContext, type Page } from '@playwright/test'
import { createAuthenticatedUser } from './helpers/auth'

const benignConsolePatterns = [
  /Nuxt DevTools/i,
  /\[vite\] connecting/i,
  /\[vite\] connected/i,
  /Suspense/i,
  /\[PWA\] Service Worker registered/i,
  /\[PWA\] Service Worker registration failed/i,
  /A bad HTTP response code \(404\) was received when fetching the script/i,
  /The `integrity` attribute is currently ignored for preload destinations/i,
  /Failed to fetch session: TypeError: Failed to fetch/i,
]

type PageIssue = {
  type: 'console' | 'pageerror' | 'requestfailed'
  text: string
}

type AuthContext = {
  email: string
  password: string
  page: Page
}

function capturePageIssues(page: Page) {
  const issues: PageIssue[] = []

  page.on('console', (message) => {
    const text = message.text()
    const type = message.type()

    if (type !== 'warning' && type !== 'error') {
      return
    }

    if (text.includes('Hydration') || text.includes('No match found for location with path "/docs"')) {
      issues.push({ type: 'console', text: `${type}: ${text}` })
      return
    }

    if (!benignConsolePatterns.some((pattern) => pattern.test(text))) {
      issues.push({ type: 'console', text: `${type}: ${text}` })
    }
  })

  page.on('pageerror', (error) => {
    issues.push({ type: 'pageerror', text: error.message })
  })

  page.on('requestfailed', (request) => {
    const url = request.url()
    const failureText = request.failure()?.errorText ?? 'failed'

    if (failureText.includes('net::ERR_ABORTED')) {
      return
    }

    if (!url.includes('/favicon.ico')) {
      issues.push({
        type: 'requestfailed',
        text: `${failureText}: ${url}`,
      })
    }
  })

  return issues
}

function expectNoCriticalIssues(issues: PageIssue[]) {
  expect(
    issues,
    `Unexpected browser issues:\n${issues.map((issue) => `- ${issue.type}: ${issue.text}`).join('\n')}`
  ).toEqual([])
}

async function bootstrapAuthenticatedPage(page: Page): Promise<AuthContext> {
  const auth = await createAuthenticatedUser(page)
  const sessionResponse = await page.evaluate(async () => {
    const response = await fetch('/api/auth-session', {
      credentials: 'include',
    })

    return {
      ok: response.ok,
      status: response.status,
      body: await response.json(),
    }
  })

  expect(sessionResponse.ok).toBe(true)
  expect((sessionResponse.body as { user?: { email?: string } | null })?.user?.email).toBe(auth.email)

  return { ...auth, page }
}

async function assertAuthenticatedRoute(page: Page, route: string) {
  await page.goto(route)
  await page.waitForLoadState('networkidle')
  await expect(page).not.toHaveURL(/\/login\?redirect=/)
}

async function createSeededScan(page: Page, overrides: Partial<{ isbn: string; title: string }> = {}) {
  const scan = {
    isbn: overrides.isbn ?? '9780684835396',
    title: overrides.title ?? 'Seeded Authenticated Scan',
    authors: ['Terrence Real'],
    status: 'complete',
  }

  const response = await page.evaluate(async (scanData) => {
    const result = await fetch('/api/scans', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(scanData),
    })

    return {
      ok: result.ok,
      status: result.status,
      body: await result.text(),
    }
  }, scan)

  expect(response.ok, `Expected scan seed to succeed, got ${response.status}: ${response.body}`).toBe(true)
}

async function readSafeCookies(context: BrowserContext) {
  const cookies = await context.cookies()
  return cookies.map((cookie) => ({
    name: cookie.name,
    domain: cookie.domain,
    path: cookie.path,
    expires: cookie.expires,
    httpOnly: cookie.httpOnly,
    secure: cookie.secure,
    sameSite: cookie.sameSite,
  }))
}

test.describe('critical unauthenticated routes', () => {
  test('public home page loads without browser errors', async ({ page }) => {
    const issues = capturePageIssues(page)

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await expect(
      page.getByRole('heading', { name: /The Fastest Way to Catalog Books for SLiMS/i })
    ).toBeVisible()
    await expect(page.getByRole('link', { name: 'Start Cataloging Free', exact: true })).toBeVisible()

    expectNoCriticalIssues(issues)
  })

  test('login page shows the Google sign-in action', async ({ page }) => {
    const issues = capturePageIssues(page)

    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: /Welcome to Rangkai/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Continue with Google/i, exact: true })).toBeVisible()

    expectNoCriticalIssues(issues)
  })

  test('unauthenticated dashboard redirects to login', async ({ page }) => {
    const issues = capturePageIssues(page)

    await page.goto('/dashboard')
    await page.waitForURL(/\/login\?redirect=\/dashboard$/)
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveURL(/\/login\?redirect=\/dashboard$/)
    await expect(page.getByRole('button', { name: /Continue with Google/i, exact: true })).toBeVisible()

    expectNoCriticalIssues(issues)
  })

  test('unauthenticated history redirects and preserves destination', async ({ page }) => {
    const issues = capturePageIssues(page)

    await page.goto('/history')
    await page.waitForURL(/\/login\?redirect=\/history$/)
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveURL(/\/login\?redirect=\/history$/)
    await expect(page.getByRole('button', { name: /Continue with Google/i, exact: true })).toBeVisible()

    expectNoCriticalIssues(issues)
  })

  test('unauthenticated scan redirects and preserves destination', async ({ page }) => {
    const issues = capturePageIssues(page)

    await page.goto('/scan')
    await page.waitForURL(/\/login\?redirect=\/scan\/mobile$/)
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveURL(/\/login\?redirect=\/scan\/mobile$/)
    await expect(page.getByRole('button', { name: /Continue with Google/i, exact: true })).toBeVisible()

    expectNoCriticalIssues(issues)
  })

  test('mobile home renders the public marketing page', async ({ browserName, page }) => {
    test.skip(browserName !== 'chromium')

    const issues = capturePageIssues(page)

    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await expect(
      page.getByRole('heading', { name: /The Fastest Way to Catalog Books for SLiMS/i })
    ).toBeVisible()
    await expect(page.getByRole('link', { name: 'Start Cataloging Free', exact: true })).toBeVisible()

    expectNoCriticalIssues(issues)
  })
})

test.describe('critical authenticated routes', () => {
  test('authenticated session fixture succeeds and exposes safe cookie metadata', async ({ page, context }) => {
    const issues = capturePageIssues(page)
    await page.goto('/')

    await bootstrapAuthenticatedPage(page)

    const cookies = await readSafeCookies(context)
    expect(cookies.length).toBeGreaterThan(0)
    expect(cookies.some((cookie) => cookie.httpOnly && cookie.sameSite === 'Lax' && cookie.path === '/' && cookie.secure === false)).toBe(true)

    expectNoCriticalIssues(issues)
  })

  test('session persists after reload and a second page in the same context stays authenticated', async ({ page }) => {
    const issues = capturePageIssues(page)
    const auth = await bootstrapAuthenticatedPage(page)

    await assertAuthenticatedRoute(page, '/dashboard')
    await page.reload()
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: /What are you reading\?/i })).toBeVisible()

    const secondPage = await page.context().newPage()
    try {
      await secondPage.goto('/dashboard')
      await secondPage.waitForLoadState('networkidle')
      await expect(secondPage).toHaveURL(/\/dashboard/)
      await expect(secondPage.getByRole('heading', { name: /What are you reading\?/i })).toBeVisible()
    } finally {
      await secondPage.close()
    }

    expect(auth.email).toContain('@example.test')
    expectNoCriticalIssues(issues)
  })

  test('authenticated dashboard loads and /api/groups is authorized', async ({ page }) => {
    const issues = capturePageIssues(page)
    await bootstrapAuthenticatedPage(page)

    const groupsResponse = page.waitForResponse(
      (response) => response.url().includes('/api/groups') && response.request().method() === 'GET',
    )

    await page.goto('/dashboard')
    const response = await groupsResponse
    expect(response.status()).toBe(200)
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.getByRole('heading', { name: /What are you reading\?/i })).toBeVisible()
    await page.reload()
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL(/\/dashboard/)

    expectNoCriticalIssues(issues)
  })

  test('authenticated history loads with a seeded record', async ({ page }) => {
    const issues = capturePageIssues(page)
    await bootstrapAuthenticatedPage(page)
    await createSeededScan(page)

    await page.goto('/history')
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveURL(/\/history/)
    await expect(page.locator('[data-testid="scan-item"]')).toHaveCount(1)
    await expect(page.getByText('Seeded Authenticated Scan')).toBeVisible()

    await page.locator('input[type="search"]').fill('Seeded')
    await expect(page.locator('[data-testid="scan-item"]')).toHaveCount(1)

    await page.reload()
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Seeded Authenticated Scan')).toBeVisible()

    expectNoCriticalIssues(issues)
  })

  test('authenticated scanner route loads and stays on the mobile scanner route', async ({ page }) => {
    const issues = capturePageIssues(page)
    await bootstrapAuthenticatedPage(page)

    await page.goto('/scan')
    await page.waitForURL(/\/scan\/mobile$/)
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveURL(/\/scan\/mobile$/)
    await expect(page.getByText(/Rapid Fire Mode/i)).toBeVisible()
    await expect(page.getByText(/Auto AI Clean/i)).toBeVisible()
    await expect(page.getByText(/Point camera at barcodes to start scanning/i)).toBeVisible()

    expectNoCriticalIssues(issues)
  })

  test('logout invalidates the session and protected routes redirect afterward', async ({ page, context }) => {
    const issues = capturePageIssues(page)
    await bootstrapAuthenticatedPage(page)

    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/dashboard/)

    const signOutResponse = await page.evaluate(async () => {
      const response = await fetch('/api/auth/sign-out', {
        method: 'POST',
        credentials: 'include',
      })

      return {
        ok: response.ok,
        status: response.status,
        body: await response.text(),
      }
    })

    expect(signOutResponse.ok, `Expected sign-out to succeed, got ${signOutResponse.status}: ${signOutResponse.body}`).toBe(true)

    const sessionResult = await page.evaluate(async () => {
      const response = await fetch('/api/auth-session', {
        credentials: 'include',
      })

      return response.json()
    })

    expect((sessionResult as { user?: unknown }).user ?? null).toBeNull()

    const cookiesAfterLogout = await readSafeCookies(context)
    expect(
      cookiesAfterLogout.some((cookie) =>
        [
          'rangkai.session_token',
          'rangkai.session_data',
          '__Secure-rangkai.session_token',
          '__Secure-rangkai.session_data',
          'session',
        ].includes(cookie.name)
      )
    ).toBe(false)

    await page.goto('/dashboard')
    await page.waitForURL(/\/login\?redirect=\/dashboard$/)
    await page.reload()
    await page.waitForURL(/\/login\?redirect=\/dashboard$/)
    await page.goBack().catch(() => {})
    await page.goto('/history')
    await page.waitForURL(/\/login\?redirect=\/history$/)

    expectNoCriticalIssues(issues)
  })

  test('authenticated and unauthenticated contexts remain isolated', async ({ browser, page }) => {
    const issues = capturePageIssues(page)
    await bootstrapAuthenticatedPage(page)

    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/dashboard/)

    const cleanContext = await browser.newContext()
    try {
      const cleanPage = await cleanContext.newPage()
      await cleanPage.goto('/dashboard')
      await cleanPage.waitForURL(/\/login\?redirect=\/dashboard$/)
      await expect(cleanPage).toHaveURL(/\/login\?redirect=\/dashboard$/)

      await cleanPage.goto('/history')
      await cleanPage.waitForURL(/\/login\?redirect=\/history$/)
      await expect(cleanPage).toHaveURL(/\/login\?redirect=\/history$/)
      await cleanPage.close()
    } finally {
      await cleanContext.close()
    }

    expectNoCriticalIssues(issues)
  })
})
