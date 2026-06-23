import type { Page } from '@playwright/test'
import { mockBookApi, mockHistoryApi } from '../mocks/api-mocks'

export async function setupContentMocks(page: Page) {
  await mockBookApi(page)
  await mockHistoryApi(page)
}

