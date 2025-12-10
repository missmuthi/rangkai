import { test, expect } from '@playwright/test'

test.describe('Scanner page (camera disabled for test)', () => {
  test.beforeEach(async ({ page }) => {
    // Prevent real camera access; hook is consumed in useScanner
    await page.addInitScript(() => {
      // @ts-expect-error test flag
      window.__SCANNER_DISABLED__ = true
    })
  })

  test('loads scanner UI and shows status', async ({ page }) => {
    await page.goto('/scan/mobile')

    await expect(page.locator('#scanner-reader')).toBeVisible()
    await expect(page.getByText(/Rapid Fire Mode/i)).toBeVisible()
    await expect(page.getByText(/Auto AI Clean/i)).toBeVisible()
    await expect(page.getByText(/Starting camera/i)).toBeVisible()
  })
})
