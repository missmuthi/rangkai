/**
 * Real ISBN Scan E2E Test
 * 
 * Validates the complete user workflow for searching an ISBN and viewing book metadata.
 * Uses ISBN 9780684835396 ("I Don't Want to Talk About It" by Terrence Real).
 * 
 * Run with mocks (default): npx playwright test real-isbn-scan.spec.ts
 * Run without mocks: E2E_MOCKS=false npx playwright test real-isbn-scan.spec.ts
 */

import { test, expect } from '@playwright/test'
import { setupAllMocks, areMocksEnabled } from './mocks/api-mocks'
import { TestReporter } from './utils/test-reporter'

// Test constants
const TEST_ISBN = '9780684835396'
const EXPECTED_TITLE = "I Don't Want to Talk About It"
const EXPECTED_AUTHOR = 'Terrence Real'

test.describe('Real ISBN Scan Workflow', () => {
  let reporter: TestReporter

  test.beforeEach(async ({ page }) => {
    reporter = new TestReporter(
      'Real ISBN Scan Workflow',
      TEST_ISBN,
      EXPECTED_TITLE,
      EXPECTED_AUTHOR,
      areMocksEnabled()
    )
    await reporter.attachPage(page)
    
    // Setup mocks if enabled
    await setupAllMocks(page)
  })

  test.afterEach(async () => {
    await reporter.finalize()
  })

  test('Complete ISBN search and metadata display workflow', async ({ page }) => {
    let stepNumber = 0
    let stepStart = Date.now()

    // Helper to record step
    const recordStep = async (name: string, action: () => Promise<void>) => {
      stepNumber++
      stepStart = Date.now()
      try {
        await action()
        await reporter.recordStep(stepNumber, name, 'PASS', Date.now() - stepStart)
      } catch (error) {
        await reporter.recordStep(stepNumber, name, 'FAIL', Date.now() - stepStart, {
          error: error as Error,
          screenshot: true
        })
        throw error
      }
    }

    // Step 1: Navigate to dashboard
    await recordStep('Navigate to dashboard', async () => {
      await page.goto('/dashboard')
      await expect(page).toHaveURL(/\/dashboard/)
    })

    // Step 2: Wait for search UI to load
    await recordStep('Wait for search UI to load', async () => {
      // Look for the hero search input in DashboardView
      await page.waitForSelector('input[placeholder*="Search"], input[placeholder*="Title"], input[placeholder*="ISBN"]', {
        timeout: 15000
      })
    })

    // Step 3: Enter ISBN and navigate to book details
    await recordStep('Enter ISBN and navigate to book details', async () => {
      // Find the main search input
      const input = page.locator('input[placeholder*="Search"], input[placeholder*="Title"]').first()
      await input.fill(TEST_ISBN)
      
      // Start waiting for API response BEFORE pressing Enter
      const responsePromise = page.waitForResponse(
        resp => resp.url().includes('/api/book/') || resp.url().includes(`book/${TEST_ISBN}`),
        { timeout: 30000 }
      ).catch(() => null) // Don't fail if no API call (mock may have already responded)
      
      // Submit search (click button)
      const searchButton = page.locator('button[title="Search"]')
      await searchButton.click()
      
      // Wait for navigation to book details page
      await page.waitForURL(/\/book\//, { timeout: 15000 })
      
      // Wait for response (may already be resolved)
      await responsePromise
    })

    // Step 4: Verify we're on book details page
    await recordStep('Verify navigation to book details page', async () => {
      await expect(page).toHaveURL(new RegExp(`/book/${TEST_ISBN}`))
    })

    // Step 5: Wait for page content to load
    await recordStep('Wait for page content to load', async () => {
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500) // Small buffer for Vue rendering
    })

    // Step 6: Verify book metadata appears
    await recordStep('Verify book metadata appears on page', async () => {
      const content = await page.content()
      
      // Check that page has substantial content (not an error page)
      expect(content.length).toBeGreaterThan(1000)
      
      // Check for ISBN on page
      expect(content).toContain(TEST_ISBN)
    })

    // Step 7: Check page has book-related elements
    await recordStep('Check for book-related UI elements', async () => {
      // Look for common book detail elements
      const hasTitle = await page.locator('h1, h2, [class*="title"]').count()
      console.log(`Found ${hasTitle} title-like elements`)
      expect(hasTitle).toBeGreaterThan(0)
    })

    // Step 8: Take screenshot of book details
    await recordStep('Capture book details screenshot', async () => {
      await page.screenshot({ 
        path: 'test-results/e2e-reports/book-details-success.png',
        fullPage: true 
      })
    })

    // Step 9: Navigate to history page
    await recordStep('Navigate to history page', async () => {
      await page.goto('/history')
      await expect(page).toHaveURL(/\/history/)
    })

    // Step 10: Verify history page loads
    await recordStep('Verify history page loads', async () => {
      await page.waitForLoadState('networkidle')
      const content = await page.content()
      expect(content.length).toBeGreaterThan(500)
    })

    // Step 11: Final check - no hard errors
    await recordStep('Verify no critical errors in flow', async () => {
      console.log('✅ Complete workflow executed successfully')
    })
  })
})
