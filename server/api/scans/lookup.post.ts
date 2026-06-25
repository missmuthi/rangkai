import { and, eq, sql } from 'drizzle-orm'
import { z } from 'zod'

import { scans } from '../../db/schema'
import { isValidISBN, normalizeISBN } from '../../../shared/utils/isbn'
import { requireAuth } from '../../utils/auth'
import { resolveBook } from '../../utils/book-resolver'
import { useDb } from '../../utils/db'

const requestSchema = z.object({
  isbn: z.string().min(1),
})

function errorDetails(error: unknown) {
  const wrappedError = error instanceof Error
    ? error as Error & { cause?: unknown }
    : null
  const sourceError = wrappedError?.cause instanceof Error
    ? wrappedError.cause as Error & { code?: string }
    : wrappedError as (Error & { code?: string }) | null

  if (!sourceError) {
    return {
      errorName: 'UnknownError',
      errorCode: undefined,
      errorMessage: String(error),
    }
  }

  return {
    errorName: sourceError.name,
    errorCode: sourceError.code,
    errorMessage: sourceError.message,
  }
}

async function stableScanId(userId: string, isbn: string) {
  const input = new TextEncoder().encode(`${userId}:${isbn}`)
  const digest = await crypto.subtle.digest('SHA-256', input)
  const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
  return `scan_${hash.slice(0, 32)}`
}

export default defineEventHandler(async (event) => {
  const requestId = crypto.randomUUID()
  const startedAt = Date.now()
  const authStartedAt = Date.now()
  const user = await requireAuth(event)
  const authMs = Date.now() - authStartedAt
  const parsedBody = requestSchema.safeParse(await readBody(event))

  if (!parsedBody.success) {
    throw createError({
      statusCode: 400,
      message: 'A valid ISBN is required',
      data: { requestId },
    })
  }

  const isbn = normalizeISBN(parsedBody.data.isbn)
  if (!isValidISBN(isbn)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid ISBN format',
      data: { requestId },
    })
  }

  setResponseHeader(event, 'Cache-Control', 'private, no-store')

  const resolved = await resolveBook(isbn)
  const db = useDb()
  let stage = 'scan_read'
  let scanReadMs = 0
  let scanWriteStartedAt = 0

  try {
    const scanReadStartedAt = Date.now()
    const existingScan = await db
      .select({ id: scans.id })
      .from(scans)
      .where(and(eq(scans.userId, user.id), eq(scans.isbn, isbn)))
      .limit(1)
      .get()
    scanReadMs = Date.now() - scanReadStartedAt

    stage = 'scan_write'
    scanWriteStartedAt = Date.now()
    const now = new Date()
    const nowSeconds = Math.floor(now.getTime() / 1000)
    const scanId = existingScan?.id ?? await stableScanId(user.id, isbn)
    const authors = JSON.stringify(resolved.metadata.authors)

    if (existingScan) {
      await db.run(sql`
        UPDATE scans
        SET
          book_id = ${resolved.bookRecord.id},
          title = ${resolved.metadata.title},
          authors = ${authors},
          publisher = ${resolved.metadata.publisher},
          description = ${resolved.metadata.description},
          source = ${resolved.metadata.source},
          status = 'complete',
          updated_at = ${nowSeconds}
        WHERE id = ${existingScan.id} AND user_id = ${user.id}
      `)
    } else {
      await db.run(sql`
        INSERT INTO scans (
          id,
          user_id,
          book_id,
          isbn,
          title,
          authors,
          publisher,
          description,
          source,
          status,
          created_at,
          updated_at
        )
        VALUES (
          ${scanId},
          ${user.id},
          ${resolved.bookRecord.id},
          ${isbn},
          ${resolved.metadata.title},
          ${authors},
          ${resolved.metadata.publisher},
          ${resolved.metadata.description},
          ${resolved.metadata.source},
          'complete',
          ${nowSeconds},
          ${nowSeconds}
        )
        ON CONFLICT(id) DO UPDATE SET
          book_id = excluded.book_id,
          title = excluded.title,
          authors = excluded.authors,
          publisher = excluded.publisher,
          description = excluded.description,
          source = excluded.source,
          status = excluded.status,
          updated_at = excluded.updated_at
      `)
    }

    const persisted = await db
      .select({ id: scans.id })
      .from(scans)
      .where(and(eq(scans.id, scanId), eq(scans.userId, user.id)))
      .limit(1)
      .get()

    if (!persisted?.id) {
      throw new Error('D1 did not return a persisted scan row')
    }

    const scanWriteMs = Date.now() - scanWriteStartedAt
    console.info({
      event: 'book_scan_lookup',
      requestId,
      isbn,
      userId: user.id,
      cacheStatus: resolved.cached ? 'hit' : 'miss',
      metadataSources: (resolved.meta as { sourcesFound?: string[] })?.sourcesFound ?? [],
      authMs,
      ...resolved.timings,
      scanReadMs,
      scanWriteMs,
      totalMs: Date.now() - startedAt,
      scanId: persisted.id,
      saved: true,
    })

    return {
      saved: true,
      scan_id: persisted.id,
      isbn,
      book: resolved.metadata,
      cache: {
        status: resolved.cached ? 'hit' : 'miss',
      },
      meta: resolved.meta,
      requestId,
    }
  } catch (error) {
    const details = errorDetails(error)
    console.error({
      event: 'book_scan_failed',
      requestId,
      stage,
      isbn,
      userId: user.id,
      ...details,
      scanReadMs,
      scanWriteMs: scanWriteStartedAt ? Date.now() - scanWriteStartedAt : 0,
      totalMs: Date.now() - startedAt,
    })

    throw createError({
      statusCode: 500,
      message: 'Book metadata was resolved, but scan history could not be saved.',
      data: { requestId },
      cause: error,
    })
  }
})
