/**
 * Google Books API client with retry logic
 * https://developers.google.com/books/docs/v1/using
 */

import type { BookMetadata } from './types'

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes'

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
export async function fetchGoogleBooks(
  isbn: string,
  signal?: AbortSignal
): Promise<BookMetadata | null> {
  // Strategy: Try strict ISBN search first. If that fails (totalItems: 0), 
  // try a general search with the ISBN (fallback).
  // Google Books API is sometimes flakey with 'isbn:' prefix for certain books.
  const queries = [`isbn:${isbn}`, isbn] 

  for (const query of queries) {
    const url = `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&maxResults=1`
    const response = await fetch(url, {
      signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RangkaiBot/1.0 (https://rangkai.app)'
      }
    })

    if (!response.ok) {
      console.warn(`[metadata:google] HTTP ${response.status} for query "${query}"`)
      continue
    }

    const data: GoogleBooksResponse = await response.json()

    if (data.totalItems > 0 && data.items?.[0]) {
      const volume = data.items[0].volumeInfo
           
      // Verify ISBN match to prevent fuzzy search false positives
      const identifiers = volume.industryIdentifiers || []
      const isbn10 = identifiers.find(i => i.type === 'ISBN_10')?.identifier
      const isbn13 = identifiers.find(i => i.type === 'ISBN_13')?.identifier
           
      const clean = (value: string) => value.replace(/[^0-9X]/g, '')
      const target = clean(isbn)
           
      if (clean(isbn10 || '') !== target && clean(isbn13 || '') !== target) {
        console.warn(`[metadata:google] ISBN mismatch for query "${query}". Found: ${isbn10}/${isbn13}, Expected: ${isbn}`)
        continue
      }

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
    }
  }

  return null
}
