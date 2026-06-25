import { eq } from 'drizzle-orm'

import { books } from '../db/schema'
import { fetchBookByIsbn } from './metadata'
import type { BookMetadata } from './metadata/types'
import { useDb } from './db'

type BookRecord = typeof books.$inferSelect

export interface ResolvedBook {
  bookRecord: BookRecord
  metadata: BookMetadata
  cached: boolean
  meta: unknown
  timings: {
    bookReadMs: number
    metadataFetchMs: number
    bookWriteMs: number
  }
}

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string')
  if (typeof value !== 'string') return []

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : []
  } catch {
    return []
  }
}

export function bookRecordToMetadata(book: BookRecord): BookMetadata {
  return {
    isbn: book.isbn,
    title: book.title,
    subtitle: null,
    authors: parseStringArray(book.authors),
    publisher: book.publisher,
    publishedDate: book.publishedDate,
    description: book.description,
    pageCount: book.pageCount,
    categories: parseStringArray(book.categories),
    language: book.language,
    thumbnail: book.thumbnail,
    source: book.source || 'database',
    ddc: book.ddc,
    lcc: book.lcc,
    callNumber: book.callNumber,
    subjects: book.subjects,
    series: book.series,
    edition: book.edition,
    collation: book.collation,
    gmd: book.gmd || 'text',
    publishPlace: book.publishPlace,
    classificationTrust: book.classificationTrust as BookMetadata['classificationTrust'],
    isAiEnhanced: book.isAiEnhanced ?? false,
    enhancedAt: book.enhancedAt?.getTime() ?? null,
    aiLog: book.aiLog ?? [],
  }
}

export async function resolveBook(isbn: string): Promise<ResolvedBook> {
  const db = useDb()
  const timings = {
    bookReadMs: 0,
    metadataFetchMs: 0,
    bookWriteMs: 0,
  }

  const readStartedAt = Date.now()
  let bookRecord = await db.query.books.findFirst({
    where: eq(books.isbn, isbn),
  })
  timings.bookReadMs = Date.now() - readStartedAt

  if (bookRecord) {
    return {
      bookRecord,
      metadata: bookRecordToMetadata(bookRecord),
      cached: true,
      meta: { sourcesAttempted: [], sourcesFound: ['database'] },
      timings,
    }
  }

  const metadataStartedAt = Date.now()
  const fetchResult = await fetchBookByIsbn(isbn)
  timings.metadataFetchMs = Date.now() - metadataStartedAt

  if (!fetchResult.data) {
    throw createError({
      statusCode: 404,
      message: 'Book was not found in any metadata source',
    })
  }

  const metadata = fetchResult.data
  const now = new Date()
  const bookId = crypto.randomUUID()
  const writeStartedAt = Date.now()

  try {
    await db
      .insert(books)
      .values({
        id: bookId,
        isbn,
        title: metadata.title ?? 'Unknown Title',
        authors: metadata.authors,
        publisher: metadata.publisher,
        publishedDate: metadata.publishedDate,
        description: metadata.description,
        pageCount: metadata.pageCount,
        categories: metadata.categories,
        language: metadata.language,
        thumbnail: metadata.thumbnail,
        source: metadata.source,
        rawMetadata: JSON.stringify(fetchResult.meta),
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: books.isbn,
        set: {
          title: metadata.title ?? 'Unknown Title',
          authors: metadata.authors,
          publisher: metadata.publisher,
          publishedDate: metadata.publishedDate,
          description: metadata.description,
          pageCount: metadata.pageCount,
          categories: metadata.categories,
          language: metadata.language,
          thumbnail: metadata.thumbnail,
          source: metadata.source,
          rawMetadata: JSON.stringify(fetchResult.meta),
          updatedAt: now,
        },
      })

    bookRecord = await db.query.books.findFirst({
      where: eq(books.isbn, isbn),
    })
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Book metadata was resolved, but the book cache could not be saved.',
      cause: error,
    })
  } finally {
    timings.bookWriteMs = Date.now() - writeStartedAt
  }

  if (!bookRecord) {
    throw createError({
      statusCode: 500,
      message: 'Book metadata was saved without a readable database record.',
    })
  }

  return {
    bookRecord,
    metadata,
    cached: false,
    meta: fetchResult.meta,
    timings,
  }
}
