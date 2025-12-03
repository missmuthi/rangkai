/**
 * DELETE /api/scans/[id] - Delete a specific scan for the authenticated user
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

  const scanId = parseInt(id, 10)
  if (isNaN(scanId)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid scan ID format'
    })
  }

  console.info(`[api:scans] Deleting scan ${scanId} for user ${user.id}`)

  const [deleted] = await db
    .delete(scans)
    .where(and(eq(scans.id, scanId), eq(scans.user_id, user.id)))
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      message: 'Scan not found'
    })
  }

  console.info(`[api:scans] Deleted scan ${scanId} for user ${user.id}`)

  setResponseStatus(event, 204)
  return null
})
