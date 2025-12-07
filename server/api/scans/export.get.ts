import type { Scan } from '../../db/schema'
import { requireAuth } from '../../utils/auth'

/**
 * Server-Side SLiMS CSV Export
 * GET /api/scans/export
 * 
 * Returns CSV file for download - more reliable than client-side blob approach
 */
export default defineEventHandler(async (event) => {
  // Get authenticated user (throws 401 if not logged in)
  const user = await requireAuth(event)

  // Use D1 database directly (same pattern as scans/index.get.ts)
  const d1 = hubDatabase()
  
  // Fetch user's scans using raw SQL
  const { results } = await d1
    .prepare('SELECT * FROM scans WHERE user_id = ? ORDER BY created_at DESC')
    .bind(user.id)
    .all()

  const userScans = results as unknown as Scan[]

  // Generate SLiMS CSV
  const csv = generateSlimsCSV(userScans)

  // Set headers for file download
  setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
  setHeader(event, 'Content-Disposition', `attachment; filename="rangkai-slims-${new Date().toISOString().slice(0, 10)}.csv"`)
  setHeader(event, 'Cache-Control', 'no-cache')

  // Return CSV with UTF-8 BOM for Excel compatibility
  return '\ufeff' + csv
})

/**
 * Generate SLiMS-compatible CSV from scans
 */
function generateSlimsCSV(scansList: Scan[]): string {
  // SLiMS 18-column header
  const headers = [
    'title',
    'gmd_name',
    'edition',
    'isbn_issn',
    'publisher_name',
    'publish_year',
    'collation',
    'series_title',
    'call_number',
    'language_name',
    'place_name',
    'classification',
    'notes',
    'image',
    'sor',
    'authors',
    'topics',
    'item_code'
  ]

  const rows = scansList.map((s: Scan) => {
    const authors = parseAuthors(s.authors)
    const year = extractYear(s.createdAt)
    
    return [
      s.title || '',                                    // title
      'Text',                                           // gmd_name
      s.edition || '',                                  // edition
      s.isbn || '',                                     // isbn_issn
      s.publisher || '',                                // publisher_name
      year,                                             // publish_year
      s.collation || '',                                // collation
      s.series || '',                                   // series_title
      s.callNumber || '',                               // call_number
      '',                                               // language_name (would need to join books table)
      s.publishPlace || '',                             // place_name
      s.ddc || s.lcc || '',                            // classification
      s.description?.slice(0, 250) || '',              // notes
      '',                                               // image (would need to join books table)
      authors,                                          // sor
      authors,                                          // authors
      s.subjects || '',                                 // topics
      generateItemCode(s.isbn || '')                    // item_code
    ]
  })

  // Escape and quote CSV values
  const escapeCSV = (val: string) => `"${(val || '').replace(/"/g, '""')}"`

  return [
    headers.join(','),
    ...rows.map((r: string[]) => r.map(escapeCSV).join(','))
  ].join('\r\n')
}

/**
 * Parse authors from JSON or string
 */
function parseAuthors(authors: string | string[] | null | undefined): string {
  if (!authors) return ''
  try {
    if (typeof authors === 'string') {
      const parsed = JSON.parse(authors)
      if (Array.isArray(parsed)) {
        return parsed.join('; ')
      }
      return authors
    }
    if (Array.isArray(authors)) {
      return authors.join('; ')
    }
    return String(authors)
  } catch {
    return String(authors || '')
  }
}

/**
 * Extract year from date
 */
function extractYear(date: Date | string | number | null | undefined): string {
  if (!date) return ''
  try {
    const d = new Date(date)
    return d.getFullYear().toString()
  } catch {
    // Try regex fallback
    const match = String(date).match(/\d{4}/)
    return match ? match[0] : ''
  }
}

/**
 * Generate unique item code
 */
function generateItemCode(isbn: string): string {
  const year = new Date().getFullYear()
  const timestamp = Math.floor(Date.now() / 1000)
  const isbn8 = isbn.slice(-8)
  return `RNG-${year}-${timestamp}-${isbn8}`
}
