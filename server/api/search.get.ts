/**
 * GET /api/search - Search user's scan history
 * 
 * Query Params:
 *   - q: Search query (searches title, authors, isbn)
 *   - limit: Max results (default 50)
 */

import { requireAuth } from '../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = useDb()

  const query = getQuery(event)
  const searchTerm = (query.q as string || '').trim()
  const limit = Math.min(parseInt(query.limit as string) || 50, 100)

  if (!searchTerm) {
    return {
      results: [],
      count: 0,
      query: ''
    }
  }

  console.info(`[api:search] Searching for "${searchTerm}" (user: ${user.id})`)

  // Search in user's scans
  const searchPattern = `%${searchTerm}%`
  
  const results = await db.query.scans.findMany({
    where: (scans, { like, or }) => or(
      like(scans.title, searchPattern),
      like(scans.authors, searchPattern),
      like(scans.isbn, searchPattern)
    ),
    orderBy: (scans, { desc }) => [desc(scans.createdAt)],
    limit: limit
  })

  // Filter in JS since D1 doesn't support complex LIKE with OR well
  const filtered = results.filter(scan => {
    const titleMatch = scan.title?.toLowerCase().includes(searchTerm.toLowerCase())
    const authorsMatch = Array.isArray(scan.authors)
      ? scan.authors.join(' ').toLowerCase().includes(searchTerm.toLowerCase())
      : (typeof scan.authors === 'string' ? (scan.authors as string).toLowerCase().includes(searchTerm.toLowerCase()) : false)
    const isbnMatch = scan.isbn?.includes(searchTerm)
    return titleMatch || authorsMatch || isbnMatch
  })

  console.info(`[api:search] Found ${filtered.length} results for "${searchTerm}"`)

  return {
    results: filtered.map(scan => ({
      id: scan.id,
      isbn: scan.isbn,
      title: scan.title,
      authors: scan.authors,
      status: scan.status,
      createdAt: scan.createdAt
    })),
    count: filtered.length,
    query: searchTerm
  }
})
