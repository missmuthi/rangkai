/**
 * GET /api/scans/[id] - Get a specific scan by ID for the authenticated user
 */

import { eq, and } from 'drizzle-orm'
import { scans } from '../../db/schema'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  const db = useDb()

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Scan ID is required'
    })
  }

  console.info(`[api:scans] Getting scan ${id} for user ${user.id}`)

  const [scan] = await db
    .select()
    .from(scans)
    .where(and(eq(scans.id, id), eq(scans.user_id, user.id)))
    .limit(1)

  if (!scan) {
    throw createError({
      statusCode: 404,
      message: 'Scan not found'
    })
  }

  return scan
})
