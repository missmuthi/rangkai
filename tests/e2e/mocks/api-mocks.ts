/**
 * API Mocks for E2E Testing
 * 
 * Provides mock responses for API endpoints to enable reliable, fast E2E tests.
 * Controlled by E2E_MOCKS environment variable.
 */

import type { Page, Route } from '@playwright/test'

// Import fixture data directly as object
const bookFixture = {
  isbn: "9780684835396",
  title: "I Don't Want to Talk About It",
  subtitle: "Overcoming the Secret Legacy of Male Depression",
  authors: ["Terrence Real"],
  publisher: "Scribner",
  publishedDate: "1998-02-17",
  description: "A groundbreaking book about male depression.",
  pageCount: 432,
  categories: ["Psychology", "Self-Help", "Mental Health"],
  language: "en",
  thumbnail: "https://books.google.com/books/content?id=EXAMPLE",
  source: "google"
}

const USE_MOCKS = process.env.E2E_MOCKS !== 'false'

/**
 * Mock book API responses
 */
export async function mockBookApi(page: Page): Promise<void> {
  if (!USE_MOCKS) return

  await page.route('**/api/book/**', async (route: Route) => {
    const url = route.request().url()
    const isbnMatch = url.match(/\/api\/book\/(\d{10,13})/)
    
    if (isbnMatch) {
      const isbn = isbnMatch[1]
      
      // Return fixture for known ISBN
      if (isbn === '9780684835396') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            metadata: bookFixture,
            cached: false
          }),
          headers: {
            'X-Cache': 'MOCK'
          }
        })
        return
      }
      
      // Return 404 for unknown ISBNs
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          metadata: null,
          cached: false
        })
      })
      return
    }
    
    await route.continue()
  })
}

/**
 * Mock history/scans API responses
 */
export async function mockHistoryApi(page: Page): Promise<void> {
  if (!USE_MOCKS) return

  // GET /api/scans - Return empty or mock history
  await page.route('**/api/scans', async (route: Route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      })
      return
    }

    // POST /api/scans - Return success
    if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON()
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: `scan-${Date.now()}`,
          isbn: body?.isbn || '9780684835396',
          title: body?.title || bookFixture.title,
          status: 'complete',
          created_at: new Date().toISOString()
        })
      })
      return
    }

    await route.continue()
  })
}

/**
 * Mock auth session for authenticated routes
 */
export async function mockAuthSession(page: Page): Promise<void> {
  if (!USE_MOCKS) return

  await page.route('**/api/auth-session*', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: 'test-user-123',
          name: 'Test User',
          email: 'test@example.com',
          image: null
        }
      })
    })
  })
}

/**
 * Setup all mocks for a page
 */
export async function setupAllMocks(page: Page): Promise<void> {
  await mockBookApi(page)
  await mockHistoryApi(page)
  await mockAuthSession(page)
}

/**
 * Check if mocks are enabled
 */
export function areMocksEnabled(): boolean {
  return USE_MOCKS
}
