import { beforeEach, describe, expect, it, vi } from 'vitest'

const signOut = vi.fn().mockResolvedValue(new Response(null, { status: 200 }))

vi.mock('better-auth', () => ({
  betterAuth: vi.fn(() => ({
    api: {
      signOut,
    },
  })),
}))

vi.mock('better-auth/adapters/drizzle', () => ({
  drizzleAdapter: vi.fn(() => ({})),
}))

vi.mock('drizzle-orm/d1', () => ({
  drizzle: vi.fn(() => ({})),
}))

;(globalThis as typeof globalThis & {
  hubDatabase?: () => Record<string, never>
  useRuntimeConfig?: () => {
    authSecret: string
    oauthGoogleClientId: string
    oauthGoogleClientSecret: string
    public: { siteUrl: string }
  }
}).hubDatabase = vi.fn(() => ({}))
;(globalThis as typeof globalThis & {
  hubDatabase?: () => Record<string, never>
  useRuntimeConfig?: () => {
    authSecret: string
    oauthGoogleClientId: string
    oauthGoogleClientSecret: string
    public: { siteUrl: string }
  }
}).useRuntimeConfig = vi.fn(() => ({
  authSecret: 'test-secret',
  oauthGoogleClientId: '',
  oauthGoogleClientSecret: '',
  public: {
    siteUrl: 'http://localhost:3000',
  },
}))

const authModule = await import('../../../server/utils/auth')

describe('signOutFromEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('delegates to Better Auth with the incoming headers and returnHeaders enabled', async () => {
    const headers = new Headers()
    headers.set('cookie', '__Secure-rangkai.session_token=token; __Secure-rangkai.session_data=data')
    headers.set('host', 'localhost:3000')
    headers.set('origin', 'http://localhost:3000')

    await authModule.signOutFromEvent({
      headers,
    } as never)

    expect(signOut).toHaveBeenCalledTimes(1)
    expect(signOut).toHaveBeenCalledWith({
      headers,
      returnHeaders: true,
    })
  })
})
