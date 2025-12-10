
import { eq, and } from 'drizzle-orm'
import { books, scans, groupMembers } from '../../db/schema'
import { v4 as uuidv4 } from 'uuid'
import { useDb } from '../../utils/db'
import { requireUserSession } from '../../utils/session'

// SLiMS CSV Header Mapping (approximate)
// ISBN, Title, Author, DDC, Classification, Publisher, Publish Year, etc.

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const body = await readMultipartFormData(event)
  
  if (!body || body.length === 0) {
    throw createError({ statusCode: 400, message: 'No file uploaded' })
  }

  // Find file part and groupId part
  const filePart = body.find(p => p.name === 'file' && p.filename)
  const groupIdPart = body.find(p => p.name === 'groupId')
  
  if (!filePart) {
    throw createError({ statusCode: 400, message: 'CSV file is required' })
  }

  // Parse groupId - treat empty string as null (personal library)
  const rawGroupId = groupIdPart ? groupIdPart.data.toString().trim() : ''
  const groupId = rawGroupId.length > 0 ? rawGroupId : null
  const csvContent = filePart.data.toString()
  const db = useDb()

  // If importing into a group, ensure the user is a member of that group
  if (groupId) {
    const membership = await db.query.groupMembers.findFirst({
      where: and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, session.user.id)
      )
    })

    if (!membership) {
      throw createError({ statusCode: 403, message: 'You are not allowed to import into this group' })
    }
  }
  
  // Basic CSV Parser (assuming simple SLiMS export)
  // In production, might need a robust library like 'csv-parse'
  const lines = csvContent.split('\n').filter(l => l.trim().length > 0)
  
  if (lines.length === 0) {
    throw createError({ statusCode: 400, message: 'CSV file is empty' })
  }

  const headers = lines[0]!.split(',').map(h => h.replace(/^"|"$/g, '').trim().toLowerCase())
  
  // Find column indices
  const isbnIdx = headers.findIndex(h => h.includes('isbn'))
  const titleIdx = headers.findIndex(h => h.includes('title') || h.includes('judul'))
  const authorIdx = headers.findIndex(h => h.includes('author') || h.includes('pengarang'))
  const ddcIdx = headers.findIndex(h => h.includes('classification') || h.includes('ddc') || h.includes('klasifikasi'))
  
  if (isbnIdx === -1 || titleIdx === -1) {
    throw createError({ statusCode: 400, message: 'Invalid CSV format: Missing ISBN or Title column' })
  }

  const results = {
    total: 0,
    success: 0,
    errors: 0,
    logs: [] as Array<{ row: number, isbn?: string, title?: string, message: string }>
  }

  const now = new Date()

  // Process rows
  for (let i = 1; i < lines.length; i++) {
    const rawRow = lines[i]!
    if (!rawRow.trim()) continue

    try {
      // Split by comma, handling quotes roughly
      const row = rawRow!.split(',').map(c => c.replace(/^"|"$/g, '').trim())
      
      if (row.length < headers.length) {
        results.errors++
        results.logs.push({ 
          row: i + 1, 
          message: `Insufficient columns (Expected ${headers.length}, got ${row.length})` 
        })
        continue
      }

      const isbn = row[isbnIdx]!.replace(/[-\s]/g, '')
      const title = row[titleIdx]
      const author = authorIdx !== -1 ? row[authorIdx] : null
      const ddc = ddcIdx !== -1 ? row[ddcIdx] : null

      if (!isbn) {
        results.errors++
        results.logs.push({ row: i + 1, title: title || 'Unknown', message: 'Missing ISBN' })
        continue
      }

      if (!title) {
        results.errors++
        results.logs.push({ row: i + 1, isbn, message: 'Missing Title' })
        continue
      }

      results.total++

      // 1. Upsert Book
      const bookId = uuidv4()
      await db.insert(books).values({
        id: bookId,
        isbn,
        title,
        authors: author ? [author] : [],
        ddc,
        source: 'manual_import',
        createdAt: now,
        updatedAt: now
      }).onConflictDoUpdate({
        target: books.isbn,
        set: { updatedAt: now }
      })

      // Get actual book ID if it existed
      const book = await db.query.books.findFirst({
        where: eq(books.isbn, isbn),
        columns: { id: true }
      })

      // Check if user already has a scan with this ISBN
      const existingScan = await db.query.scans.findFirst({
        where: and(
          eq(scans.userId, session.user.id),
          eq(scans.isbn, isbn)
        ),
        columns: { id: true }
      })

      if (existingScan) {
        // Skip duplicate
        results.errors++
        results.logs.push({ row: i + 1, isbn, title, message: 'Duplicate: Already in your library' })
        continue
      }

      // 2. Create Scan Record (only if not duplicate)
      await db.insert(scans).values({
        id: uuidv4(),
        userId: session.user.id,
        groupId,
        bookId: book?.id || bookId,
        isbn,
        title,
        authors: author ? [author] : [],
        ddc,
        source: 'slims_import',
        status: 'complete',
        createdAt: now,
        updatedAt: now
      })

      results.success++
    } catch (e: any) {
      console.error('Import error row ' + i, e)
      results.errors++
      results.logs.push({ 
        row: i + 1, 
        message: e.message || 'Unknown database error' 
      })
    }
  }

  return results
})
