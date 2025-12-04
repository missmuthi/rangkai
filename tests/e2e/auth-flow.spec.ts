import { test, expect } from '@playwright/test'

function uniqueEmail() {
  return `playwright+${Date.now()}@example.com`
}

test.describe('Full Auth Flow: register -> login -> profile -> history -> sign out', () => {
  test('register, update profile, visit history, sign out', async ({ page }) => {
    // Register a new user
    const email = uniqueEmail()
    const password = 'password123'
    const name = 'Playwright Test'

    await page.goto('/register')

    await page.fill('#name', name)
    await page.fill('#email', email)
    await page.fill('#password', password)
    await page.click('button[type="submit"]')

    // Wait for success message then go to login (register may not auto login)
    await page.waitForSelector('text=Account created successfully', { timeout: 5000 })
    await page.goto('/login')

    // Sign in
    await page.fill('#email', email)
    await page.fill('#password', password)
    await page.click('button[type="submit"]')
    // Wait for redirect after sign-in
    await page.waitForURL(/\/(scan\/mobile|)/, { timeout: 10000 })
    // Click profile link from header
    await page.click('text=Profile')

    // Wait for profile to load
    await page.waitForURL('/profile', { timeout: 5000 })
    await expect(page.locator('text=' + email)).toBeVisible()

    // Update profile name
    await page.fill('#name', name + ' Updated')
    await page.click('button[type="submit"]')

    // Expect success message in edit form
    await expect(page.locator('text=Profile updated successfully')).toBeVisible()

    // Visit history (should be protected but we're authenticated now)
    await page.goto('/history')
    await expect(page).toHaveURL('/history')

    // Sign out using the header button
    const signOutButton = page.locator('button', { hasText: 'Sign Out' })
    await signOutButton.click()

    // After sign out, history should redirect to login
    await page.goto('/history')
    await page.waitForURL(/\/login\?redirect=%2Fhistory/, { timeout: 5000 })
    expect(page.url()).toContain('/login?redirect=%2Fhistory')
  })
})
