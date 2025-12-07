import type { BookMetadata } from '~/types'

export function useBookSearch() {
  const book = ref<BookMetadata | null>(null)
  const scanId = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  interface BookResponse {
    metadata: BookMetadata | null
    scan_id: string | null
    source: string
    cached: boolean
  }

  async function searchByISBN(isbn: string) {
    loading.value = true
    error.value = null
    book.value = null
    scanId.value = null

    try {
      const data = await $fetch<BookResponse>(`/api/book/${isbn}`)
      if (data.metadata) {
        book.value = data.metadata
        scanId.value = data.scan_id
      }
    } catch (e: unknown) {
      const err = e as { data?: { message?: string }, message?: string }
      error.value = err.data?.message || err.message || 'Failed to fetch book metadata'
    } finally {
      loading.value = false
    }
  }

  async function cleanMetadata(metadata: Partial<BookMetadata>) {
    // Throw errors to caller so they can handle them properly
    const cleaned = await $fetch<BookMetadata>('/api/ai/clean', {
      method: 'POST',
      body: { metadata }
    })
    return cleaned
  }

  return { book, scanId, loading, error, searchByISBN, cleanMetadata }
}

