import { beforeEach, describe, expect, it, vi } from 'vitest'

const signOutFromEventMock = vi.fn()
const getAuthCookieConfigMock = vi.fn()
const deleteSessionMock = vi.fn()
const dbMock = { db: true }

vi.mock('../../../server/utils/db', () => ({
  useDb: () => dbMock,
}))

vi.mock('../../../server/utils/auth', () => ({
  extractSetCookieHeaders: (headers?: Headers | null) => {
    if (!headers) {
      return []
    }

    const getSetCookie = (headers as Headers & { getSetCookie?: () => string[] }).getSetCookie
    if (typeof getSetCookie === 'function') {
      return getSetCookie.call(headers)
    }

    const header = headers.get('set-cookie')
    return header ? [header] : []
  },
  getAuthCookieConfig: getAuthCookieConfigMock,
  signOutFromEvent: signOutFromEventMock,
}))

vi.mock('../../../server/utils/session', () => ({
  deleteSession: deleteSessionMock,
}))

;(globalThis as typeof globalThis & {
  defineEventHandler?: (handler: unknown) => unknown
  createError?: (error: { statusCode?: number, statusMessage?: string }) => Error
  getRequestURL?: (event: { node?: { req?: { headers?: Record<string, string> } } }) => URL
  hubDatabase?: () => Record<string, never>
}).defineEventHandler = (handler: unknown) => handler
;(globalThis as typeof globalThis & {
  defineEventHandler?: (handler: unknown) => unknown
  createError?: (error: { statusCode?: number, statusMessage?: string }) => Error
  getRequestURL?: (event: { node?: { req?: { headers?: Record<string, string> } } }) => URL
  hubDatabase?: () => Record<string, never>
}).createError = (error: { statusCode?: number, statusMessage?: string }) =>
  Object.assign(new Error(error.statusMessage ?? 'Error'), error)
;(globalThis as typeof globalThis & {
  defineEventHandler?: (handler: unknown) => unknown
  createError?: (error: { statusCode?: number, statusMessage?: string }) => Error
  getRequestURL?: (event: { node?: { req?: { headers?: Record<string, string> } } }) => URL
  hubDatabase?: () => Record<string, never>
}).getRequestURL = (event: { node?: { req?: { headers?: Record<string, string> } } }) => {
  const host = event.node?.req?.headers?.host || 'localhost:3000'
  return new URL(`http://${host}/api/auth/sign-out`)
}
;(globalThis as typeof globalThis & {
  defineEventHandler?: (handler: unknown) => unknown
  createError?: (error: { statusCode?: number, statusMessage?: string }) => Error
  getRequestURL?: (event: { node?: { req?: { headers?: Record<string, string> } } }) => URL
  hubDatabase?: () => Record<string, never>
}).hubDatabase = () => ({})

const { default: signOutHandler } = await import('../../../server/api/auth/sign-out.post')

function createResponseStub() {
  const headers = new Map<string, string | string[]>()

  return {
    statusCode: 200,
    writeHead(code: number) {
      this.statusCode = code
    },
    end() {
      return undefined
    },
    getHeader(name: string) {
      return headers.get(name.toLowerCase())
    },
    setHeader(name: string, value: string | string[]) {
      headers.set(name.toLowerCase(), value)
    },
    appendHeader(name: string, value: string) {
      const key = name.toLowerCase()
      const current = headers.get(key)
      if (current === undefined) {
        headers.set(key, value)
        return
      }

      if (Array.isArray(current)) {
        headers.set(key, [...current, value])
        return
      }

      headers.set(key, [current, value])
    },
    removeHeader(name: string) {
      headers.delete(name.toLowerCase())
    },
    rawHeaders: headers,
  }
}

function createEvent(cookieHeader: string) {
  const headers = new Headers()
  headers.set('cookie', cookieHeader)
  headers.set('host', 'localhost:3000')
  headers.set('origin', 'http://localhost:3000')

  return {
    headers,
    node: {
      req: {
        url: '/api/auth/sign-out',
        headers: Object.fromEntries(headers.entries()),
      },
      res: createResponseStub(),
    },
    context: {},
    runtime: {},
  } as never
}

function setCookieHeaders(headers: string[]) {
  const responseHeaders = new Headers()
  for (const header of headers) {
    responseHeaders.append('set-cookie', header)
  }

  ;(responseHeaders as Headers & { getSetCookie?: () => string[] }).getSetCookie = () => headers
  return responseHeaders
}

function getSetCookieValues(event: ReturnType<typeof createEvent>) {
  const header = (event.node.res as { rawHeaders: Map<string, string | string[]> }).rawHeaders.get(
    'set-cookie'
  )

  if (!header) {
    return []
  }

  return Array.isArray(header) ? header : [header]
}

beforeEach(() => {
  vi.clearAllMocks()
  getAuthCookieConfigMock.mockReturnValue({
    sessionToken: {
      name: 'rangkai.session_token',
      options: {
        path: '/',
        secure: false,
        httpOnly: true,
        sameSite: 'lax',
      },
    },
    sessionData: {
      name: 'rangkai.session_data',
      options: {
        path: '/',
        secure: false,
        httpOnly: true,
        sameSite: 'lax',
      },
    },
    legacySession: {
      name: 'session',
      options: {
        path: '/',
        secure: false,
        httpOnly: true,
        sameSite: 'lax',
      },
    },
  })
})

describe('sign-out handler', () => {
  it('forwards Better Auth set-cookie headers, clears local cookies, and invalidates legacy sessions', async () => {
    signOutFromEventMock.mockResolvedValue({
      headers: setCookieHeaders([
        'rangkai.session_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax',
        'rangkai.session_data=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax',
      ]),
    })

    const event = createEvent('rangkai.session_token=signed-token; rangkai.session_data=cache; session=legacy-token')

    await signOutHandler(event)

    expect(signOutFromEventMock).toHaveBeenCalledTimes(1)
    expect(deleteSessionMock).toHaveBeenCalledWith(dbMock, 'legacy-token')
    expect(event.node.res.statusCode).toBe(204)

    const setCookies = getSetCookieValues(event)
    expect(setCookies.some((value) => value.includes('rangkai.session_token'))).toBe(true)
    expect(setCookies.some((value) => value.includes('rangkai.session_data'))).toBe(true)
    expect(setCookies.some((value) => value.startsWith('session='))).toBe(true)
    expect(setCookies.every((value) => !value.includes(','))).toBe(true)
  })

  it('uses secure cookie names in production mode and still returns separate Set-Cookie headers', async () => {
    getAuthCookieConfigMock.mockReturnValue({
      sessionToken: {
        name: '__Secure-rangkai.session_token',
        options: {
          path: '/',
          secure: true,
          httpOnly: true,
          sameSite: 'lax',
        },
      },
      sessionData: {
        name: '__Secure-rangkai.session_data',
        options: {
          path: '/',
          secure: true,
          httpOnly: true,
          sameSite: 'lax',
        },
      },
      legacySession: {
        name: 'session',
        options: {
          path: '/',
          secure: true,
          httpOnly: true,
          sameSite: 'lax',
        },
      },
    })

    signOutFromEventMock.mockResolvedValue({
      headers: setCookieHeaders([
        '__Secure-rangkai.session_token=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax',
        '__Secure-rangkai.session_data=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax',
      ]),
    })

    const event = createEvent('__Secure-rangkai.session_token=signed-token; __Secure-rangkai.session_data=cache')

    await signOutHandler(event)

    const setCookies = getSetCookieValues(event)
    expect(setCookies.some((value) => value.includes('__Secure-rangkai.session_token'))).toBe(true)
    expect(setCookies.some((value) => value.includes('__Secure-rangkai.session_data'))).toBe(true)
    expect(setCookies.every((value) => !value.includes(','))).toBe(true)
  })

  it('succeeds when there is no active session cookie and still responds with 204', async () => {
    signOutFromEventMock.mockResolvedValue({
      headers: setCookieHeaders([
        'rangkai.session_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax',
        'rangkai.session_data=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax',
      ]),
    })

    const event = createEvent('')

    await signOutHandler(event)

    expect(deleteSessionMock).not.toHaveBeenCalled()
    expect(event.node.res.statusCode).toBe(204)
  })
})
