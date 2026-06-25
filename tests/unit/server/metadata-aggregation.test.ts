import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../server/utils/metadata/google', () => ({
  fetchGoogleBooks: vi.fn((_isbn: string, signal?: AbortSignal) => {
    return new Promise((_resolve, reject) => {
      signal?.addEventListener('abort', () => {
        reject(new DOMException('Aborted', 'AbortError'))
      })
    })
  }),
}))

vi.mock('../../../server/utils/metadata/openlibrary', () => ({
  fetchOpenLibrary: vi.fn(async (isbn: string) => ({
    isbn,
    title: 'Fast provider result',
    subtitle: null,
    authors: ['Test Author'],
    publisher: null,
    publishedDate: null,
    description: null,
    pageCount: null,
    categories: [],
    language: 'en',
    thumbnail: null,
    source: 'openlibrary',
  })),
}))

vi.mock('../../../server/utils/metadata/loc', () => ({
  fetchLoc: vi.fn(async () => {
    throw new Error('Provider unavailable')
  }),
}))

describe('metadata aggregation', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns successful metadata after a slow provider is aborted', async () => {
    vi.useFakeTimers()
    const { fetchBookByIsbn } = await import('../../../server/utils/metadata')

    const resultPromise = fetchBookByIsbn('9780306406157')
    await vi.advanceTimersByTimeAsync(4600)
    const result = await resultPromise

    expect(result.data?.title).toBe('Fast provider result')
    expect(result.data?.source).toBe('openlibrary')
    expect(result.meta).toMatchObject({
      sourceStatus: {
        google: 'timeout',
        openlibrary: 'found',
        loc: 'failed',
      },
    })
  })
})
