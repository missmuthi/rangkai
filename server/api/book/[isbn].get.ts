/**
 * GET /api/book/[isbn] - Fetch merged book metadata from multiple sources
 *
 * Uses hubKV() for caching with 24h TTL.
 * Waterfall priority: Google Books > Open Library > Library of Congress
 */

import { fetchGoogleBooks } from '../../utils/metadata/google'
import { fetchOpenLibrary } from '../../utils/metadata/openlibrary'
import { fetchLoc } from '../../utils/metadata/loc'
import type { BookMetadata } from '../../utils/metadata/types'
import { mergeMetadata, calculateCompleteness } from '../../utils/merge'

const CACHE_TTL_SECONDS = 60 * 60 * 24 // 24 hours

interface BookResponse {
  metadata: BookMetadata | null
  sources: {
    google: boolean
    openlibrary: boolean
    loc: boolean
  }
  completeness: number
  cached: boolean
}

export default defineEventHandler(async (event): Promise<BookResponse> => {
  const isbn = getRouterParam(event, 'isbn')

  if (!isbn) {
    throw createError({
      statusCode: 400,
      message: 'ISBN is required'
    })
  }

  // Validate ISBN format (10 or 13 digits, with optional hyphens)
  const cleanIsbn = isbn.replace(/[-\s]/g, '')
  if (!/^(\d{10}|\d{13})$/.test(cleanIsbn)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid ISBN format. Must be 10 or 13 digits.'
    })
  }

  const cacheKey = `book:${cleanIsbn}`
  const kv = hubKV()

  // Check cache first
  try {
    const cached = await kv.get<BookResponse>(cacheKey)
    if (cached) {
      console.info(`[api:book] Cache hit for ISBN ${cleanIsbn}`)
      return { ...cached, cached: true }
    }
  } catch (error) {
    console.warn(`[api:book] Cache read error for ISBN ${cleanIsbn}:`, error)
  }

  console.info(`[api:book] Fetching metadata for ISBN ${cleanIsbn}`)

  // Fetch from all sources in parallel
  const startTime = Date.now()
  const [google, openlibrary, loc] = await Promise.all([
    fetchGoogleBooks(cleanIsbn),
    fetchOpenLibrary(cleanIsbn),
    fetchLoc(cleanIsbn)
  ])
  const duration = Date.now() - startTime

  console.info(`[api:book] Fetched ISBN ${cleanIsbn} in ${duration}ms`, {
    google: !!google,
    openlibrary: !!openlibrary,
    loc: !!loc
  })

  // Merge with waterfall priority
  const merged = mergeMetadata([google, openlibrary, loc])
  const completeness = calculateCompleteness(merged)

  const response: BookResponse = {
    metadata: merged,
    sources: {
      google: google !== null,
      openlibrary: openlibrary !== null,
      loc: loc !== null
    },
    completeness,
    cached: false
  }

  // Cache the result if we have any data
  if (merged) {
    try {
      await kv.set(cacheKey, response, { ttl: CACHE_TTL_SECONDS })
      console.info(`[api:book] Cached ISBN ${cleanIsbn} for ${CACHE_TTL_SECONDS}s`)
    } catch (error) {
      console.warn(`[api:book] Cache write error for ISBN ${cleanIsbn}:`, error)
    }
  }

  return response
})
