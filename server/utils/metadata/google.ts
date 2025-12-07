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
  // Strategy: Try strict ISBN search first. If that fails (totalItems: 0), 
  // try a general search with the ISBN (fallback).
  // Google Books API is sometimes flakey with 'isbn:' prefix for certain books.
  const queries = [`isbn:${isbn}`, isbn] 

  for (const query of queries) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

      try {
        const url = `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&maxResults=1`
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'RangkaiBot/1.0 (https://rangkai.app)'
          }
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          // Retry on rate limit (429) or server error (500+)
          if (response.status === 429 || response.status >= 500) {
             if (attempt < MAX_RETRIES) {
               await sleep(Math.pow(2, attempt) * 200)
               continue
             }
          }
           // For 400/403/404, we don't retry, just return null (or try next query)
           console.warn(`[metadata:google] HTTP ${response.status} for query "${query}"`)
           break // Break retry loop, move to next query (or exit if last)
        }

        const data: GoogleBooksResponse = await response.json()

        if (data.totalItems > 0 && data.items?.[0]) {
           const volume = data.items[0].volumeInfo
           
           // Verify ISBN match to prevent fuzzy search false positives
           const identifiers = volume.industryIdentifiers || []
           const isbn10 = identifiers.find(i => i.type === 'ISBN_10')?.identifier
           const isbn13 = identifiers.find(i => i.type === 'ISBN_13')?.identifier
           
           // Normalization helper
           const clean = (s: string) => s.replace(/[^0-9X]/g, '')
           const target = clean(isbn)
           
           if (clean(isbn10 || '') !== target && clean(isbn13 || '') !== target) {
             console.warn(`[metadata:google] ISBN mismatch for query "${query}". Found: ${isbn10}/${isbn13}, Expected: ${isbn}`)
             // If strict query failed, this fallback is bad.
             // If valid query failed, maybe data is bad.
             // In either case, skip this result.
             // But if we are in loop, maybe next query works? 
             // Actually if 'isbn:...' returned 0, and '...' returned mismatch, we are probably done.
             // Just break and return null effectively (after loop ends)
             break
           }

           // FOUND IT
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
        } else {
            // No items found for this query, break retry loop to try next query immediately
            break 
        }

      } catch (error) {
        clearTimeout(timeoutId)
        if (attempt < MAX_RETRIES) {
          // Exponential backoff
          await sleep(Math.pow(2, attempt) * 200)
          continue
        }
        console.error(`[metadata:google] Error fetching for query "${query}":`, error)
      }
    }
    // If we are here, the retry loop finished without returning.
    // Loop continues to next query.
  }

  return null
}

/**
 * Sleep helper for exponential backoff
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
