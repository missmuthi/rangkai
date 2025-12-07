/**
 * GET /api/book/[isbn] - Fetch book metadata, merge sources, and save to history
 *
 * Flow:
 * 1. Auth Guard (Strict)
 * 2. Validate ISBN
 * 3. Check DB Cache (books table)
 * 4. Cache Miss -> Fetch & Merge (Google + OL + LoC)
 * 5. Upsert Master Record (books table)
 * 6. Upsert User History (scans table)
 * 7. Return Result
 */

import { eq, and } from 'drizzle-orm'
import { fetchBookByIsbn } from '../../utils/metadata'
import { books, scans } from '../../db/schema'
import { useDb } from '../../utils/db'
import { requireUserSession } from '../../utils/session'
import type { BookMetadata } from '../../utils/metadata/types'

interface BookResponse {
  metadata: BookMetadata | null
  scan_id: string | null
  source: string
  cached: boolean
  meta?: unknown
}

export default defineEventHandler(async (event): Promise<BookResponse> => {
  // 1. Strict Auth Guard
  const session = await requireUserSession(event)
  const userId = session.user.id

  const isbn = getRouterParam(event, 'isbn')
  if (!isbn) {
    throw createError({ statusCode: 400, message: 'ISBN is required' })
  }

  // 2. Validate ISBN
  const cleanIsbn = isbn.replace(/[-\s]/g, '')
  if (!/^(\d{10}|\d{13})$/.test(cleanIsbn)) {
    throw createError({ statusCode: 400, message: 'Invalid ISBN format' })
  }

  const db = useDb()
  
  // 3. Check DB Cache (Books Table)
  let bookRecord = await db.query.books.findFirst({
    where: eq(books.isbn, cleanIsbn)
  })

  let metadata: BookMetadata | null = null
  let isCached = false
  let meta: unknown = {}

  if (bookRecord) {
    // Cache Hit in DB
    isCached = true
    try {
      metadata = {
        isbn: bookRecord.isbn,
        title: bookRecord.title,
        subtitle: null, 
        authors: Array.isArray(bookRecord.authors) ? bookRecord.authors : 
                 (typeof bookRecord.authors === 'string' ? 
                  (()=> { try { const p = JSON.parse(bookRecord.authors as string); return Array.isArray(p) ? p : [] } catch { return [] } })() 
                  : []),
        publisher: bookRecord.publisher,
        publishedDate: bookRecord.publishedDate,
        description: bookRecord.description,
        pageCount: bookRecord.pageCount,
        categories: Array.isArray(bookRecord.categories) ? bookRecord.categories : 
                    (typeof bookRecord.categories === 'string' ? 
                     (()=> { try { const p = JSON.parse(bookRecord.categories as string); return Array.isArray(p) ? p : [] } catch { return [] } })() 
                     : []),
        language: bookRecord.language,
        thumbnail: bookRecord.thumbnail,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        source: (bookRecord.source as any) || 'database'
      }
    } catch (e) {
      console.warn('Error parsing cached book metadata:', e)
      bookRecord = undefined 
    }
  }

  // 4. Cache Miss -> Fetch & Merge
  if (!bookRecord) {
    const fetchResult = await fetchBookByIsbn(cleanIsbn)
    metadata = fetchResult.data
    meta = fetchResult.meta

    if (metadata) {
      // 5. Upsert Master Record (Books Table)
      const now = new Date()
      const newBook = {
        id: crypto.randomUUID(),
        isbn: cleanIsbn,
        title: metadata.title ?? 'Unknown Title',
        authors: metadata.authors || [],
        publisher: metadata.publisher,
        publishedDate: metadata.publishedDate,
        description: metadata.description,
        pageCount: metadata.pageCount,
        categories: metadata.categories || [],
        language: metadata.language,
        thumbnail: metadata.thumbnail,
        source: metadata.source,
        rawMetadata: JSON.stringify(fetchResult.meta),
        createdAt: now,
        updatedAt: now
      }

      try {
        await db.insert(books).values(newBook).onConflictDoUpdate({
           target: books.isbn,
           set: { updatedAt: now } 
        })
        
        const savedBook = await db.query.books.findFirst({
          where: eq(books.isbn, cleanIsbn)
        })
        if (savedBook) bookRecord = savedBook

      } catch (e) {
        console.error('Error saving book to DB:', e)
      }
    }
  }

  if (!metadata) {
    throw createError({ statusCode: 404, message: 'Book found in no sources' })
  }

  // 6. Upsert User History (Scans Table)
  let scanId: string | null = null
  
  try {
    const now = new Date()
    
    // Check if scan already exists for this user/isbn
    const existingScan = await db.query.scans.findFirst({
      where: and(eq(scans.userId, userId), eq(scans.isbn, cleanIsbn))
    })

    if (existingScan) {
      scanId = existingScan.id
      await db.update(scans)
        .set({ updatedAt: now })
        .where(eq(scans.id, scanId))
        
      // MERGE SCAN OVERRIDES INTO METADATA
      // If the user has "cleaned" or edited this book, prefer their data
      if (metadata) {
        if (existingScan.ddc) metadata.ddc = existingScan.ddc
        if (existingScan.lcc) metadata.lcc = existingScan.lcc
        if (existingScan.callNumber) metadata.callNumber = existingScan.callNumber
        if (existingScan.subjects) metadata.subjects = existingScan.subjects
        if (existingScan.classificationTrust) metadata.classificationTrust = existingScan.classificationTrust as "high" | "medium" | "low"
        if (existingScan.isAiEnhanced) metadata.isAiEnhanced = existingScan.isAiEnhanced
        
        // Handle aiLog safely (handle string vs object mismatch and legacy formats)
        if (existingScan.aiLog) {
            if (typeof existingScan.aiLog === 'string') {
                try {
                    metadata.aiLog = JSON.parse(existingScan.aiLog)
                } catch {
                    metadata.aiLog = []
                }
            } else {
                metadata.aiLog = existingScan.aiLog
            }
            
            // Normalize legacy format: array of strings → array of objects
            if (Array.isArray(metadata.aiLog) && metadata.aiLog.length > 0) {
                const firstItem = metadata.aiLog[0]
                // If it's an array of strings (legacy), convert to new format
                if (typeof firstItem === 'string') {
                    const legacyChanges = metadata.aiLog as unknown as string[]
                    metadata.aiLog = [{
                        timestamp: new Date().toISOString(),
                        model: 'legacy',
                        changes: legacyChanges
                    }]
                }
            }
        }
        // source is not in Scan type yet in strict mode unless we updated types, 
        // but we migrated DB. We can cast or access if convenient.
        
        if (existingScan.source) metadata.source = existingScan.source
        
        // Also title/authors if you want full overrides, but start with bibliographic
      }
      
    } else {
      // Create new scan
      scanId = crypto.randomUUID()
      await db.insert(scans).values({
        id: scanId,
        userId: userId,
        bookId: bookRecord?.id,
        isbn: cleanIsbn,
        title: metadata?.title,
        authors: metadata?.authors || null,
        publisher: metadata?.publisher,
        description: metadata?.description,
        status: 'complete',
        createdAt: now,
        updatedAt: now
      })
    }
  } catch (e) {
    console.error('Error saving scan to history:', e)
  }

  return {
    metadata,
    scan_id: scanId,
    source: metadata.source,
    cached: isCached,
    meta
  }
})
