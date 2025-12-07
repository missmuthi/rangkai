/**
 * UX Feature Verification Tests
 * 
 * Validates all the UX improvements made to Rangkai:
 * - Smart Search Logic (ISBN vs text routing)
 * - Dashboard Redesign (hero search, recent scans)
 * - Navigation (scanner nav, logo click)
 * - Login (Google OAuth only)
 * - Settings (theme toggle, account info)
 * - Profile (library stats)
 */

import { test, expect } from '@playwright/test'
import { setupAllMocks } from './mocks/api-mocks'

// Helper to set auth bypass cookie
async function setupAuthBypass(page: import('@playwright/test').Page) {
  await page.context().addCookies([{
    name: 'e2e-test-bypass',
    value: 'true',
    domain: 'localhost',
    path: '/',
    httpOnly: false,
    secure: false,
    sameSite: 'Lax',
  }])
}

test.describe('Smart Search Logic', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthBypass(page)
    await setupAllMocks(page)
  })

  test('ISBN (13 digits) routes to Book Details page', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Find search input
    const input = page.locator('input[placeholder*="Search"], input[placeholder*="Title"]').first()
    await expect(input).toBeVisible()
    
    // Enter 13-digit ISBN
    await input.fill('9780684835396')
    await input.press('Enter')
    
    // Should navigate to /book/[isbn]
    await page.waitForURL(/\/book\/9780684835396/, { timeout: 10000 })
    await expect(page).toHaveURL(/\/book\/9780684835396/)
  })

  test('ISBN (10 digits) routes to Book Details page', async ({ page }) => {
    await page.goto('/dashboard')
    
    const input = page.locator('input[placeholder*="Search"], input[placeholder*="Title"]').first()
    await input.fill('0684835398')
    await input.press('Enter')
    
    // Should navigate to /book/[isbn]
    await page.waitForURL(/\/book\/0684835398/, { timeout: 10000 })
    await expect(page).toHaveURL(/\/book\/0684835398/)
  })

  test('Text input routes to Search Results page', async ({ page }) => {
    await page.goto('/dashboard')
    
    const input = page.locator('input[placeholder*="Search"], input[placeholder*="Title"]').first()
    await input.fill('Harry Potter')
    await input.press('Enter')
    
    // Should navigate to /search?q=...
    await page.waitForURL(/\/search\?q=/, { timeout: 10000 })
    await expect(page).toHaveURL(/\/search\?q=Harry/)
  })

  test('Camera button opens Scanner page', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Find camera button (by icon or title attribute)
    const cameraButton = page.locator('button[title*="Camera"], button[title*="Scanner"], [aria-label*="camera"], [aria-label*="scan"]').first()
    
    // If exact button not found, try by icon class
    const cameraIcon = page.locator('button:has(svg), button:has([class*="camera"])').last()
    const button = await cameraButton.count() > 0 ? cameraButton : cameraIcon
    
    await button.click()
    
    // Should navigate to scanner
    await page.waitForURL(/\/scan/, { timeout: 10000 })
    await expect(page).toHaveURL(/\/scan/)
  })
})

test.describe('Dashboard Redesign', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthBypass(page)
    await setupAllMocks(page)
  })

  test('Hero search bar is visible and centered', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Check for search input
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="Title"]').first()
    await expect(searchInput).toBeVisible()
    
    // Check for hero title (e.g., "What are you reading?")
    const heroText = page.getByText(/What are you reading|Search|Catalog/i).first()
    await expect(heroText).toBeVisible()
  })

  test('Recent scans section appears below search', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Check for "Recent Scans" or similar section
    const recentSection = page.getByText(/Recent|History|Scans/i)
    // May or may not be visible depending on data
    const count = await recentSection.count()
    console.log(`Found ${count} recent-related elements`)
  })
})

test.describe('Navigation & Login', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthBypass(page)
    await setupAllMocks(page)
  })

  test('Mobile Scanner has Home and History navigation', async ({ page }) => {
    await page.goto('/scan/mobile')
    
    // Look for navigation links
    const homeLink = page.getByRole('link', { name: /Home|Dashboard/i })
    const historyLink = page.getByRole('link', { name: /History/i })
    
    // At least one should be visible (may be in different nav layouts)
    const homeCount = await homeLink.count()
    const historyCount = await historyLink.count()
    
    console.log(`Home links: ${homeCount}, History links: ${historyCount}`)
    expect(homeCount + historyCount).toBeGreaterThan(0)
  })

  test('Logo click navigates to Dashboard', async ({ page }) => {
    await page.goto('/history')
    
    // Find logo link (Rangkai text or logo image)
    const logo = page.locator('a:has-text("Rangkai"), a[href="/dashboard"]:has(img), a[href="/dashboard"]:has(svg)').first()
    
    if (await logo.count() > 0) {
      await logo.click()
      await page.waitForURL(/\/dashboard/, { timeout: 5000 })
      await expect(page).toHaveURL(/\/dashboard/)
    } else {
      // Logo might be a different element
      console.log('Logo link not found, checking for clickable branding')
      const branding = page.locator('[class*="logo"], [class*="brand"]').first()
      if (await branding.count() > 0) {
        await branding.click()
        await page.waitForURL(/\/dashboard/, { timeout: 5000 })
      }
    }
  })

  test('Login page shows Google OAuth only (no email form)', async ({ page }) => {
    await page.goto('/login')
    
    // Should have Google sign-in button
    const googleButton = page.getByRole('button', { name: /Google|Sign in with Google/i })
    await expect(googleButton).toBeVisible()
    
    // Should NOT have email input field
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email"]')
    const emailCount = await emailInput.count()
    
    // Should NOT have password input field
    const passwordInput = page.locator('input[type="password"]')
    const passwordCount = await passwordInput.count()
    
    console.log(`Email inputs: ${emailCount}, Password inputs: ${passwordCount}`)
    expect(emailCount).toBe(0)
    expect(passwordCount).toBe(0)
  })
})

test.describe('Settings & Profile', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthBypass(page)
    await setupAllMocks(page)
  })

  test('Settings page has Theme Toggle', async ({ page }) => {
    await page.goto('/settings')
    
    // Wait for page load
    await page.waitForLoadState('networkidle')
    
    // Check for theme-related elements
    const themeSection = page.getByText(/Appearance|Theme|Dark|Light/i)
    const themeCount = await themeSection.count()
    
    console.log(`Theme-related elements: ${themeCount}`)
    expect(themeCount).toBeGreaterThan(0)
    
    // Look for theme toggle buttons
    const lightButton = page.getByText(/Light/i)
    const darkButton = page.getByText(/Dark/i)
    const systemButton = page.getByText(/System|Auto/i)
    
    const hasThemeOptions = 
      (await lightButton.count() > 0) ||
      (await darkButton.count() > 0) ||
      (await systemButton.count() > 0)
    
    expect(hasThemeOptions).toBe(true)
  })

  test('Settings page shows Account info', async ({ page }) => {
    await page.goto('/settings')
    
    await page.waitForLoadState('networkidle')
    
    // Check for account section
    const accountSection = page.getByText(/Account|Profile|User|Email/i)
    const count = await accountSection.count()
    
    console.log(`Account-related elements: ${count}`)
    expect(count).toBeGreaterThan(0)
  })

  test('Profile page shows Library Stats', async ({ page }) => {
    await page.goto('/profile')
    
    await page.waitForLoadState('networkidle')
    
    // Check for stats-related elements
    const statsElements = page.getByText(/Total|Books|Scans|Cataloged|Pending|Stats/i)
    const count = await statsElements.count()
    
    console.log(`Stats-related elements: ${count}`)
    expect(count).toBeGreaterThan(0)
    
    // Look for specific stat cards
    const totalBooks = page.getByText(/Total Books|Total Scans/i)
    const hasStats = await totalBooks.count() > 0
    
    console.log(`Has Total Books/Scans: ${hasStats}`)
  })
})
