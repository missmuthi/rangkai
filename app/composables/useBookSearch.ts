import type { BookMetadata } from '~/types'
import { normalizeISBN } from '~/utils/isbn'

interface BookResponse {
  metadata: BookMetadata | null
  scan_id: string | null
  source: string
  cached: boolean
  requestId?: string
}

interface ScanLookupResponse {
  saved: boolean
  scan_id: string
  isbn: string
  book: BookMetadata
  cache: {
    status: 'hit' | 'miss'
  }
  requestId: string
}

const inFlightScans = new Map<string, Promise<ScanLookupResponse>>()

export function useBookSearch() {
  const book = ref<BookMetadata | null>(null)
  const scanId = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const completedScans = useState<Record<string, ScanLookupResponse>>(
    'completed-scan-lookups',
    () => ({})
  )

  function setError(value: unknown) {
    const fetchError = value as {
      data?: { message?: string }
      message?: string
      statusCode?: number
    }

    if (fetchError.statusCode === 401) {
      error.value = 'Your session has expired. Please sign in again.'
      return
    }

    error.value = fetchError.data?.message || fetchError.message || 'Failed to fetch book metadata'
  }

  async function lookupByISBN(rawIsbn: string) {
    const isbn = normalizeISBN(rawIsbn)
    loading.value = true
    error.value = null
    book.value = null
    scanId.value = null

    try {
      const data = await $fetch<BookResponse>(`/api/book/${isbn}`)
      book.value = data.metadata
      return data
    } catch (fetchError) {
      setError(fetchError)
      throw fetchError
    } finally {
      loading.value = false
    }
  }

  async function scanByISBN(rawIsbn: string) {
    const isbn = normalizeISBN(rawIsbn)
    loading.value = true
    error.value = null

    let request = inFlightScans.get(isbn)
    if (!request) {
      request = $fetch<ScanLookupResponse>('/api/scans/lookup', {
        method: 'POST',
        body: { isbn },
      })
      inFlightScans.set(isbn, request)
    }

    try {
      const data = await request
      if (!data.saved || !data.scan_id) {
        throw new Error('Scan history was not saved')
      }

      book.value = data.book
      scanId.value = data.scan_id
      completedScans.value[isbn] = data
      return data
    } catch (fetchError) {
      setError(fetchError)
      throw fetchError
    } finally {
      if (inFlightScans.get(isbn) === request) {
        inFlightScans.delete(isbn)
      }
      loading.value = false
    }
  }

  async function loadBookByISBN(rawIsbn: string) {
    const isbn = normalizeISBN(rawIsbn)
    const completed = completedScans.value[isbn]

    if (completed) {
      book.value = completed.book
      scanId.value = completed.scan_id
      delete completedScans.value[isbn]
      return completed
    }

    return lookupByISBN(isbn)
  }

  async function cleanMetadata(metadata: Partial<BookMetadata>) {
    return await $fetch<BookMetadata>('/api/ai/clean', {
      method: 'POST',
      body: { metadata },
    })
  }

  return {
    book,
    scanId,
    loading,
    error,
    lookupByISBN,
    scanByISBN,
    loadBookByISBN,
    searchByISBN: scanByISBN,
    cleanMetadata,
  }
}
