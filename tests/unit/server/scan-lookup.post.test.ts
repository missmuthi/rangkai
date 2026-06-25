import { beforeEach, describe, expect, it, vi } from 'vitest'

const requireAuth = vi.fn()
const resolveBook = vi.fn()
const scanGet = vi.fn()
const persistedGet = vi.fn()
const run = vi.fn()

vi.mock('../../../server/utils/auth', () => ({
  requireAuth,
}))

vi.mock('../../../server/utils/book-resolver', () => ({
  resolveBook,
}))

vi.mock('../../../server/utils/db', () => ({
  useDb: () => ({
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => ({
            get: scanGet.mock.calls.length === 0 ? scanGet : persistedGet,
          }),
        }),
      }),
    }),
    run,
  }),
}))

function setupNitroGlobals() {
  vi.stubGlobal('defineEventHandler', (handler: unknown) => handler)
  vi.stubGlobal('readBody', vi.fn(async () => ({ isbn: '978-0-306-40615-7' })))
  vi.stubGlobal('setResponseHeader', vi.fn())
  vi.stubGlobal('createError', (input: {
    statusCode: number
    message: string
    data?: unknown
    cause?: unknown
  }) => Object.assign(new Error(input.message), input))
}

describe('POST /api/scans/lookup', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    setupNitroGlobals()
    requireAuth.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      name: 'User',
    })
    resolveBook.mockResolvedValue({
      bookRecord: { id: 'book-1' },
      metadata: {
        isbn: '9780306406157',
        title: 'Test Book',
        authors: ['Test Author'],
        source: 'database',
      },
      cached: true,
      meta: { sourcesFound: ['database'] },
      timings: {
        bookReadMs: 1,
        metadataFetchMs: 0,
        bookWriteMs: 0,
      },
    })
    scanGet.mockResolvedValue(undefined)
    persistedGet.mockResolvedValue({ id: 'persisted-scan-id' })
    run.mockResolvedValue({})
  })

  it('returns the ID confirmed by D1', async () => {
    const { default: handler } = await import('../../../server/api/scans/lookup.post')

    const response = await handler({} as never)

    expect(response).toMatchObject({
      saved: true,
      scan_id: 'persisted-scan-id',
      isbn: '9780306406157',
    })
  })

  it('returns a non-2xx error when the scan write fails', async () => {
    run.mockRejectedValue(Object.assign(new Error('D1 constraint failed'), {
      code: 'SQLITE_CONSTRAINT',
    }))
    const { default: handler } = await import('../../../server/api/scans/lookup.post')

    await expect(handler({} as never)).rejects.toMatchObject({
      statusCode: 500,
      message: 'Book metadata was resolved, but scan history could not be saved.',
    })
  })

  it('stops before database work when authentication fails', async () => {
    requireAuth.mockRejectedValue(Object.assign(new Error('Unauthorized'), {
      statusCode: 401,
    }))
    const { default: handler } = await import('../../../server/api/scans/lookup.post')

    await expect(handler({} as never)).rejects.toMatchObject({
      statusCode: 401,
    })
    expect(resolveBook).not.toHaveBeenCalled()
    expect(scanGet).not.toHaveBeenCalled()
  })
})
