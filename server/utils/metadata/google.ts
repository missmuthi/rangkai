/**
 * Google Books API client for book metadata
 * https://developers.google.com/books/docs/v1/using
 */

import type { BookMetadata } from './types'

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes'
const TIMEOUT_MS = 10000

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

export async function fetchGoogleBooks(isbn: string): Promise<BookMetadata | null> {
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

    if (!response.ok) {
      console.warn(`[metadata:google] HTTP ${response.status} for ISBN ${isbn}`)
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
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn(`[metadata:google] Timeout after ${TIMEOUT_MS}ms for ISBN ${isbn}`)
    } else {
      console.error(`[metadata:google] Error fetching ISBN ${isbn}:`, error)
    }
    return null
  } finally {
    clearTimeout(timeoutId)
  }
}
