import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

const state = ref<Record<string, unknown>>({})
const fetchMock = vi.fn()

vi.stubGlobal('ref', ref)
vi.stubGlobal('useState', () => state)
vi.stubGlobal('$fetch', fetchMock)

describe('useBookSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    state.value = {}
  })

  it('reuses one in-flight scan request for duplicate ISBN calls', async () => {
    let resolveRequest: ((value: unknown) => void) | undefined
    fetchMock.mockImplementation(() => new Promise(resolve => {
      resolveRequest = resolve
    }))

    const { useBookSearch } = await import('../../../app/composables/useBookSearch')
    const first = useBookSearch()
    const second = useBookSearch()
    const firstRequest = first.scanByISBN('978-0-306-40615-7')
    const secondRequest = second.scanByISBN('9780306406157')

    expect(fetchMock).toHaveBeenCalledTimes(1)

    resolveRequest?.({
      saved: true,
      scan_id: 'scan-1',
      isbn: '9780306406157',
      book: {
        isbn: '9780306406157',
        title: 'Test Book',
        authors: [],
        source: 'database',
      },
      cache: { status: 'hit' },
      requestId: 'request-1',
    })

    await Promise.all([firstRequest, secondRequest])
    expect(first.scanId.value).toBe('scan-1')
    expect(second.scanId.value).toBe('scan-1')
  })
})
