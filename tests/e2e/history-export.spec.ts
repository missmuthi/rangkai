import { test, expect } from '@playwright/test'

test.describe('History & Export', () => {
  test('displays scan history list', async ({ page }) => {
    await page.goto('/history')

    // Should show either list or empty state
    const hasScans = await page.locator('[data-testid="scan-item"]').count() > 0
    const hasEmptyState = await page.locator('text=No scans found').isVisible()

    expect(hasScans || hasEmptyState).toBe(true)
  })

  test('exports CSV when button clicked', async ({ page }) => {
    await page.goto('/history')

    // Wait for download
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('text=Export CSV')
    ])

    // Verify filename
    expect(download.suggestedFilename()).toMatch(/rangkai-scans-\d{4}-\d{2}-\d{2}\.csv/)
  })

  test('search filters scan list', async ({ page }) => {
    await page.goto('/history')

    // Enter search query
    await page.fill('input[type="search"]', 'JavaScript')

    // Wait for filter to apply
    await page.waitForTimeout(300)

    // All visible items should contain search term
    const items = page.locator('[data-testid="scan-item"]')
    const count = await items.count()

    for (let i = 0; i < count; i++) {
      const text = await items.nth(i).textContent()
      expect(text?.toLowerCase()).toContain('javascript')
    }
  })

  test('deletes scan with confirmation', async ({ page }) => {
    await page.goto('/history')

    const initialCount = await page.locator('[data-testid="scan-item"]').count()

    if (initialCount > 0) {
      // Set up dialog handler
      page.on('dialog', dialog => dialog.accept())

      // Click first delete button
      await page.click('[data-testid="delete-scan"]:first-child')

      // Verify item removed
      await expect(page.locator('[data-testid="scan-item"]')).toHaveCount(initialCount - 1)
    }
  })
})
