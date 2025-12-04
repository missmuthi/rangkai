import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'

interface BookMetadata {
  title?: string
  authors?: string[]
  isbn13?: string
}

// Mock $fetch
const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

// Simplified composable for testing
function useBookFetch() {
  const book = ref<BookMetadata | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchBook(isbn: string) {
    loading.value = true
    error.value = null
    book.value = null

    try {
      const data = await mockFetch(`/api/book/${isbn}`)
      book.value = data
    } catch (e: unknown) {
      const err = e as { data?: { message?: string } }
      error.value = err.data?.message || 'Failed to fetch book metadata'
    } finally {
      loading.value = false
    }
  }

  return { book, loading, error, fetchBook }
}

describe('useBookFetch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches book metadata successfully', async () => {
    const mockBook = {
      title: 'Test Book',
      authors: ['Test Author'],
      isbn13: '9780306406157'
    }
    mockFetch.mockResolvedValueOnce(mockBook)

    const { book, loading, error, fetchBook } = useBookFetch()

    expect(loading.value).toBe(false)

    const fetchPromise = fetchBook('9780306406157')
    expect(loading.value).toBe(true)

    await fetchPromise

    expect(loading.value).toBe(false)
    expect(book.value).toEqual(mockBook)
    expect(error.value).toBeNull()
  })

  it('handles fetch errors', async () => {
    mockFetch.mockRejectedValueOnce({ data: { message: 'Book not found' } })

    const { book, error, fetchBook } = useBookFetch()

    await fetchBook('invalid-isbn')

    expect(book.value).toBeNull()
    expect(error.value).toBe('Book not found')
  })

  it('sets loading state correctly during fetch', async () => {
    const loadingStates: boolean[] = []
    mockFetch.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve({ title: 'Test' }), 10)
    }))

    const { loading, fetchBook } = useBookFetch()

    loadingStates.push(loading.value) // Before fetch
    const promise = fetchBook('9780306406157')
    loadingStates.push(loading.value) // During fetch
    await promise
    loadingStates.push(loading.value) // After fetch

    expect(loadingStates).toEqual([false, true, false])
  })
})
