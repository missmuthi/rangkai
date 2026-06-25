/**
 * POST /api/scans/dedupe - Remove duplicate scans for the current user
 *
 * Keeps the oldest scan for each ISBN and removes duplicates
 */

import { asc, eq, inArray } from 'drizzle-orm'
import { scans } from '../../db/schema'
import { useDb } from '../../utils/db'
import { requireUserSession } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = session.user.id

  console.info(`[api:scans:dedupe] Starting deduplication for user ${userId}`)

  const db = useDb()
  const userScans = await db
    .select({
      id: scans.id,
      isbn: scans.isbn,
    })
    .from(scans)
    .where(eq(scans.userId, userId))
    .orderBy(asc(scans.createdAt), asc(scans.id))

  const keptIsbns = new Set<string>()
  const duplicateIds: string[] = []
  const duplicateIsbns = new Set<string>()

  for (const scan of userScans) {
    if (keptIsbns.has(scan.isbn)) {
      duplicateIds.push(scan.id)
      duplicateIsbns.add(scan.isbn)
    } else {
      keptIsbns.add(scan.isbn)
    }
  }

  if (duplicateIds.length === 0) {
    return {
      message: 'No duplicates found',
      removed: 0,
      checked: 0
    }
  }

  const deleted = await db
    .delete(scans)
    .where(inArray(scans.id, duplicateIds))
    .returning({ id: scans.id })

  const totalRemoved = deleted.length

  console.info(`[api:scans:dedupe] Deduplication complete. Removed ${totalRemoved} duplicates.`)

  return {
    message: `Removed ${totalRemoved} duplicate scans`,
    removed: totalRemoved,
    checked: duplicateIsbns.size
  }
})
