/**
 * GET /api/scans/export/marc
 * Export user's scans as MARC21 file (.mrc)
 */
import { buildMarc21File } from '../../../utils/marc21'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const query = getQuery(event)
  
  const db = useDb()
  
  // Get scans to export (optionally filter by IDs)
  const scanIds = query.ids ? String(query.ids).split(',') : undefined
  
  let userScans
  if (scanIds) {
    // Export specific scans
    userScans = await db.query.scans.findMany({
      where: (s, { and, eq, inArray }) => and(
        eq(s.userId, session.user.id),
        inArray(s.id, scanIds)
      )
    })
  } else {
    // Export all user scans
    userScans = await db.query.scans.findMany({
      where: (s, { eq }) => eq(s.userId, session.user.id),
      orderBy: (s, { desc }) => [desc(s.createdAt)]
    })
  }
  
  if (userScans.length === 0) {
    throw createError({ statusCode: 404, message: 'No scans to export' })
  }
  
  // Transform scans to book data format
  const books = userScans.map(scan => ({
    isbn: scan.isbn,
    title: scan.title || undefined,
    authors: scan.authors || undefined,
    publisher: scan.publisher || undefined,
    publishedDate: undefined, // Not in scans table
    description: scan.description || undefined,
    pageCount: undefined,
    language: undefined,
    ddc: scan.ddc || undefined,
    lcc: scan.lcc || undefined,
    subjects: scan.subjects || undefined,
    series: scan.series || undefined,
    edition: scan.edition || undefined,
    collation: scan.collation || undefined
  }))
  
  // Build MARC21 file
  const marcContent = buildMarc21File(books)
  
  // Set headers for file download
  const filename = `rangkai-export-${Date.now()}.mrc`
  setHeader(event, 'Content-Type', 'application/marc')
  setHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`)
  
  return marcContent
})
