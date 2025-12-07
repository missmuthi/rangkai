import { test, expect } from '@playwright/test'

test.describe('Dashboard Smoke Test', () => {
  test('should load the dashboard and sidebar', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Check page title
    await expect(page).toHaveTitle(/Rangkai/i)
    
    // Check Sidebar Navigation presence
    // Desktop Sidebar
    const desktopSidebar = page.locator('aside.hidden.lg\\:flex')
    await expect(desktopSidebar).toBeVisible()
    
    // Check "Dashboard" link is active or present
    await expect(page.getByRole('link', { name: 'Dashboard' }).first()).toBeVisible()
    
    // Check Empty State
    await expect(page.getByText('No scans yet')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Start Scanning' })).toBeVisible()
  })

  test('should have accessible buttons', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Basic check: Ensure all buttons have text or aria-label
    // This is a naive check, a real accessibility test would use axe-core
    const buttons = await page.getByRole('button').all()
    for (const button of buttons) {
      const text = await button.textContent()
      const label = await button.getAttribute('aria-label')
      const title = await button.getAttribute('title')
      
      expect(text?.trim() || label || title).toBeTruthy()
    }
  })
})
