import type { BookMetadata } from '~/types/book'

export function useBookFetch() {
  const book = ref<BookMetadata | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchBook(isbn: string) {
    loading.value = true
    error.value = null
    book.value = null

    try {
      const data = await $fetch<BookMetadata>(`/api/book/${isbn}`)
      book.value = data
    } catch (e: unknown) {
      const err = e as { data?: { message?: string } }
      error.value = err.data?.message || 'Failed to fetch book metadata'
    } finally {
      loading.value = false
    }
  }

  async function cleanMetadata(metadata: Partial<BookMetadata>) {
    try {
      const cleaned = await $fetch<BookMetadata>('/api/ai/clean', {
        method: 'POST',
        body: metadata
      })
      return cleaned
    } catch {
      return metadata as BookMetadata
    }
  }

  return { book, loading, error, fetchBook, cleanMetadata }
}
