/**
 * GET /api/book/[isbn] - Fetch book metadata from Google Books API
 *
 * Features:
 * - KV caching with 24h TTL
 * - X-Cache header (HIT/MISS)
 * - Retry logic (3 attempts with exponential backoff)
 * - Background audit logging via waitUntil
 */

import { fetchGoogleBooks } from '../../utils/metadata/google'
import type { BookMetadata } from '../../utils/metadata/types'

const CACHE_TTL_SECONDS = 60 * 60 * 24 // 24 hours

interface BookResponse {
  metadata: BookMetadata | null
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

  // 1. Check KV cache first
  try {
    const cached = await kv.get<BookResponse>(cacheKey)
    if (cached) {
      console.info(`[api:book] Cache HIT for ISBN ${cleanIsbn}`)
      setHeader(event, 'X-Cache', 'HIT')
      return { ...cached, cached: true }
    }
  } catch (error) {
    console.warn(`[api:book] Cache read error for ISBN ${cleanIsbn}:`, error)
  }

  // Cache MISS - fetch from Google Books API
  setHeader(event, 'X-Cache', 'MISS')
  console.info(`[api:book] Cache MISS - Fetching metadata for ISBN ${cleanIsbn}`)

  const startTime = Date.now()
  const metadata = await fetchGoogleBooks(cleanIsbn)
  const duration = Date.now() - startTime

  console.info(`[api:book] Fetched ISBN ${cleanIsbn} in ${duration}ms`, {
    found: !!metadata
  })

  const response: BookResponse = {
    metadata,
    cached: false
  }

  // 2. Cache the result if we have data
  if (metadata) {
    try {
      await kv.set(cacheKey, response, { ttl: CACHE_TTL_SECONDS })
      console.info(`[api:book] Cached ISBN ${cleanIsbn} for ${CACHE_TTL_SECONDS}s`)
    } catch (error) {
      console.warn(`[api:book] Cache write error for ISBN ${cleanIsbn}:`, error)
    }
  }

  // 3. Background audit log (non-blocking)
  // Note: waitUntil requires Cloudflare runtime context
  // In local dev, this runs synchronously
  const cloudflareContext = event.context.cloudflare
  if (cloudflareContext?.context?.waitUntil) {
    cloudflareContext.context.waitUntil(
      logBookFetch(cleanIsbn, !!metadata, duration).catch(err =>
        console.warn('[api:book] Audit log error:', err)
      )
    )
  }

  return response
})

/**
 * Background audit logging (runs via waitUntil)
 */
async function logBookFetch(isbn: string, found: boolean, durationMs: number): Promise<void> {
  console.info(`[audit] Book fetch: isbn=${isbn} found=${found} duration=${durationMs}ms`)
  // Future: Save to D1 audit table
  // const db = useDrizzle()
  // await db.insert(auditLog).values({ isbn, found, durationMs, timestamp: new Date() })
}
