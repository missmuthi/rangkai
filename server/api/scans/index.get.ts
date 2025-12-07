/**
 * GET /api/scans - List all scans for the authenticated user
 */

import { eq, desc } from 'drizzle-orm'
import { scans } from '../../db/schema'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = useDb()

  console.info(`[api:scans] Listing scans for user ${user.id}`)

  const userScans = await db
    .select()
    .from(scans)
    .where(eq(scans.userId, user.id))
    .orderBy(desc(scans.createdAt))

  console.info(`[api:scans] Found ${userScans.length} scans for user ${user.id}`)

  return {
    scans: userScans,
    count: userScans.length
  }
})
