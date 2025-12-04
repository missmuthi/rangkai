import { test, expect } from '@playwright/test'

test.describe('Scanner Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/')
    // Add login steps here when auth is implemented
  })

  test('displays scanner page with camera permission prompt', async ({ page }) => {
    await page.goto('/scan/mobile')

    // Check scanner UI elements
    await expect(page.locator('#scanner-reader')).toBeVisible()
    await expect(page.locator('text=Auto-clean metadata')).toBeVisible()
  })

  test('shows book card after successful scan', async ({ page }) => {
    await page.goto('/scan/mobile')

    // Mock scanner result by directly calling the handler
    await page.evaluate(() => {
      // Simulate successful ISBN scan
      window.dispatchEvent(new CustomEvent('test-scan', {
        detail: { isbn: '9780596517748' }
      }))
    })

    // Wait for book card to appear
    await expect(page.locator('[data-testid="book-card"]')).toBeVisible({ timeout: 10000 })
  })

  test('navigates to history from scanner', async ({ page }) => {
    await page.goto('/scan/mobile')

    await page.click('text=View History')

    await expect(page).toHaveURL('/history')
  })
})
