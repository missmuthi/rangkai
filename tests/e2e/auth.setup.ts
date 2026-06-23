import { mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { test as setup } from '@playwright/test'
import { createAuthenticatedUser } from './helpers/auth'

const authFile = 'playwright/.auth/user.json'

setup('authenticate', async ({ page }) => {
  await mkdir(dirname(authFile), { recursive: true })

  await page.goto('/')
  await createAuthenticatedUser(page)
  await page.context().storageState({ path: authFile })
})
