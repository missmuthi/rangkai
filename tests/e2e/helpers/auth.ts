import { expect, type Page } from '@playwright/test'
import { randomUUID } from 'node:crypto'

export interface TestAuthUser {
  email: string
  password: string
  name: string
}

export async function createAuthenticatedUser(page: Page, overrides: Partial<TestAuthUser> = {}) {
  const user: TestAuthUser = {
    email: overrides.email ?? `playwright-${randomUUID()}@example.test`,
    password: overrides.password ?? 'Playwright-Auth-123!',
    name: overrides.name ?? 'Playwright E2E',
  }

  await page.goto('/')

  const signUpResult = await page.evaluate(async (credentials) => {
    const response = await fetch('/api/auth/sign-up/email', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    return {
      ok: response.ok,
      status: response.status,
      body: await response.text(),
    }
  }, user)

  expect(
    signUpResult.ok,
    `Expected sign-up to succeed, got ${signUpResult.status}: ${signUpResult.body}`
  ).toBe(true)

  let sessionResult = await page.evaluate(async () => {
    const response = await fetch('/api/auth-session', {
      credentials: 'include',
    })

    return {
      ok: response.ok,
      status: response.status,
      body: await response.json(),
    }
  })

  expect(sessionResult.ok).toBe(true)

  const currentEmail = (sessionResult.body as { user?: { email?: string } | null })?.user?.email
  if (currentEmail !== user.email) {
    const signInResult = await page.evaluate(async (credentials) => {
      const response = await fetch('/api/auth/sign-in/email', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      })

      return {
        ok: response.ok,
        status: response.status,
        body: await response.text(),
      }
    }, user)

    expect(
      signInResult.ok,
      `Expected sign-in fallback to succeed, got ${signInResult.status}: ${signInResult.body}`
    ).toBe(true)

    sessionResult = await page.evaluate(async () => {
      const response = await fetch('/api/auth-session', {
        credentials: 'include',
      })

      return {
        ok: response.ok,
        status: response.status,
        body: await response.json(),
      }
    })
  }

  expect((sessionResult.body as { user?: { email?: string } | null })?.user?.email).toBe(user.email)

  return user
}
