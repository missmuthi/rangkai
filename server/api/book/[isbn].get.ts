import { isValidISBN, normalizeISBN } from '../../../shared/utils/isbn'
import { requireUserSession } from '../../utils/session'
import { resolveBook } from '../../utils/book-resolver'

export default defineEventHandler(async (event) => {
  const requestId = crypto.randomUUID()
  const startedAt = Date.now()
  const authStartedAt = Date.now()

  await requireUserSession(event)
  const authMs = Date.now() - authStartedAt

  const rawIsbn = getRouterParam(event, 'isbn')
  const isbn = normalizeISBN(rawIsbn || '')

  if (!rawIsbn || !isValidISBN(isbn)) {
    throw createError({ statusCode: 400, message: 'Invalid ISBN format' })
  }

  setResponseHeader(event, 'Cache-Control', 'private, no-store')

  try {
    const resolved = await resolveBook(isbn)

    console.info({
      event: 'book_lookup',
      requestId,
      isbn,
      cacheStatus: resolved.cached ? 'hit' : 'miss',
      metadataSources: (resolved.meta as { sourcesFound?: string[] })?.sourcesFound ?? [],
      authMs,
      ...resolved.timings,
      totalMs: Date.now() - startedAt,
    })

    return {
      metadata: resolved.metadata,
      scan_id: null,
      source: resolved.metadata.source,
      cached: resolved.cached,
      meta: resolved.meta,
      requestId,
    }
  } catch (error) {
    const cause = error instanceof Error ? error : new Error(String(error))
    console.error({
      event: 'book_lookup_failed',
      requestId,
      stage: 'book_resolve',
      isbn,
      errorName: cause.name,
      errorMessage: cause.message,
      totalMs: Date.now() - startedAt,
    })
    throw error
  }
})
