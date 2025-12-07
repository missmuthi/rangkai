import { test, expect } from '@playwright/test'

test.describe('History & Export', () => {
  test('displays scan history list', async ({ page }) => {
    await page.goto('/history')
    
    // Wait for loading to finish
    await page.locator('text=Syncing history...').waitFor({ state: 'hidden', timeout: 10000 })

    // Should show either list or empty state
    const hasScans = await page.locator('[data-testid="scan-item"]').count() > 0
    // Updated text to match actual UI
    const hasEmptyState = await page.locator('text=No books scanned').isVisible()

    expect(hasScans || hasEmptyState).toBe(true)
  })

  test('exports CSV when button clicked', async ({ request, page }) => {
    // Seed a scan to ensure button appears
    const response = await request.post('/api/scans', {
      data: {
        isbn: '9780743273565',
        status: 'complete',
        title: 'Seeded Book'
      }
    })
    expect(response.ok()).toBeTruthy()

    await page.goto('/history')
    
    // Check if scan appears (wait for it)
    await page.waitForSelector('[data-testid="scan-item"]')

    // Wait for download
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('text=Export All')
    ])

    // Verify filename
    expect(download.suggestedFilename()).toMatch(/rangkai-slims-\d{4}-\d{2}-\d{2}\.csv/)
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
