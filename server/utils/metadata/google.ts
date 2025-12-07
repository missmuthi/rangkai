/**
 * Google Books API client with retry logic
 * https://developers.google.com/books/docs/v1/using
 */

import type { BookMetadata } from './types'

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes'
const TIMEOUT_MS = 10000
const MAX_RETRIES = 3

interface GoogleBooksVolumeInfo {
  title?: string
  subtitle?: string
  authors?: string[]
  publisher?: string
  publishedDate?: string
  description?: string
  pageCount?: number
  categories?: string[]
  language?: string
  imageLinks?: {
    thumbnail?: string
    smallThumbnail?: string
  }
  industryIdentifiers?: Array<{
    type: string
    identifier: string
  }>
}

interface GoogleBooksResponse {
  totalItems: number
  items?: Array<{
    volumeInfo: GoogleBooksVolumeInfo
  }>
}

/**
 * Fetch book metadata from Google Books API with retry logic
 * @param isbn - ISBN-10 or ISBN-13
 * @returns BookMetadata or null if not found/failed
 */
export async function fetchGoogleBooks(isbn: string): Promise<BookMetadata | null> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

    try {
      const url = `${GOOGLE_BOOKS_API}?q=isbn:${isbn}&maxResults=1`
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        console.warn(`[metadata:google] Attempt ${attempt}/${MAX_RETRIES}: HTTP ${response.status} for ISBN ${isbn}`)
        if (attempt < MAX_RETRIES) {
          await sleep(Math.pow(2, attempt) * 100) // Exponential backoff: 200ms, 400ms, 800ms
          continue
        }
        return null
      }

      const data: GoogleBooksResponse = await response.json()

      if (!data.items || data.items.length === 0) {
        console.info(`[metadata:google] No results for ISBN ${isbn}`)
        return null
      }

      const firstItem = data.items[0]
      if (!firstItem) {
        console.info(`[metadata:google] No results for ISBN ${isbn}`)
        return null
      }

      const volume = firstItem.volumeInfo
      const thumbnail = volume.imageLinks?.thumbnail || volume.imageLinks?.smallThumbnail || null

      return {
        isbn,
        title: volume.title || null,
        subtitle: volume.subtitle || null,
        authors: volume.authors || [],
        publisher: volume.publisher || null,
        publishedDate: volume.publishedDate || null,
        description: volume.description || null,
        pageCount: volume.pageCount || null,
        categories: volume.categories || [],
        language: volume.language || null,
        thumbnail: thumbnail ? thumbnail.replace('http://', 'https://') : null,
        source: 'google'
      }
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error && error.name === 'AbortError') {
        console.warn(`[metadata:google] Attempt ${attempt}/${MAX_RETRIES}: Timeout after ${TIMEOUT_MS}ms for ISBN ${isbn}`)
      } else {
        console.error(`[metadata:google] Attempt ${attempt}/${MAX_RETRIES}: Error for ISBN ${isbn}:`, error)
      }

      if (attempt < MAX_RETRIES) {
        await sleep(Math.pow(2, attempt) * 100)
        continue
      }
      return null
    }
  }

  return null
}

/**
 * Sleep helper for exponential backoff
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
