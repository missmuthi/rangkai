import { test as setup } from '@playwright/test'

const authFile = 'playwright/.auth/user.json'

setup('authenticate', async ({ page }) => {
  // Set E2E test bypass cookie that the auth middleware recognizes
  await page.context().addCookies([
    {
      name: 'e2e-test-bypass',
      value: 'true',
      domain: 'localhost',
      path: '/',
      httpOnly: false, // Needs to be readable by client-side JS
      secure: false,
      sameSite: 'Lax',
    }
  ])
  
  // Visit home page to ensure cookies are set
  await page.goto('/')
  
  // Save storage state
  await page.context().storageState({ path: authFile })
})
