/**
 * POST /api/scans/dedupe - Remove duplicate scans for the current user
 * 
 * Keeps the oldest scan for each ISBN and removes duplicates
 */

import { eq, and, lt, sql } from 'drizzle-orm'
import { scans } from '../../db/schema'
import { useDb } from '../../utils/db'
import { requireUserSession } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const db = useDb()
  const userId = session.user.id

  console.info(`[api:scans:dedupe] Starting deduplication for user ${userId}`)

  // Find all ISBNs that have duplicates for this user
  const d1 = hubDatabase()
  const { results: duplicateGroups } = await d1.prepare(`
    SELECT isbn, COUNT(*) as count, MIN(created_at) as oldest
    FROM scans
    WHERE user_id = ?
    GROUP BY isbn
    HAVING COUNT(*) > 1
  `).bind(userId).all()

  if (!duplicateGroups || duplicateGroups.length === 0) {
    return {
      message: 'No duplicates found',
      removed: 0,
      checked: 0
    }
  }

  let totalRemoved = 0

  for (const group of duplicateGroups) {
    const isbn = group.isbn as string
    const oldest = group.oldest as number

    // Delete all scans with this ISBN except the oldest one
    const deleteResult = await d1.prepare(`
      DELETE FROM scans
      WHERE user_id = ? AND isbn = ? AND created_at > ?
    `).bind(userId, isbn, oldest).run()

    totalRemoved += (deleteResult.meta?.changes || 0)
    console.info(`[api:scans:dedupe] Removed ${deleteResult.meta?.changes || 0} duplicates for ISBN ${isbn}`)
  }

  console.info(`[api:scans:dedupe] Deduplication complete. Removed ${totalRemoved} duplicates.`)

  return {
    message: `Removed ${totalRemoved} duplicate scans`,
    removed: totalRemoved,
    checked: duplicateGroups.length
  }
})
