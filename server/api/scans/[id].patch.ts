/**
 * PATCH /api/scans/[id] - Update a specific scan for the authenticated user
 */

import { eq, and } from 'drizzle-orm'
import { scans } from '../../db/schema'
import { requireAuth } from '../../utils/auth'

interface UpdateScanBody {
  isbn?: string
  title?: string
  authors?: string
  description?: string
}

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody<UpdateScanBody>(event)
  const db = useDb()

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Scan ID is required'
    })
  }

  console.info(`[api:scans] Updating scan ${id} for user ${user.id}`)

  // Build update object with only provided fields
  const updateData: Record<string, unknown> = {}

  if (body.isbn !== undefined) updateData.isbn = body.isbn
  if (body.title !== undefined) updateData.title = body.title
  if (body.authors !== undefined) updateData.authors = body.authors
  if (body.description !== undefined) updateData.description = body.description

  const [updated] = await db
    .update(scans)
    .set({
      ...updateData,
      updated_at: new Date()
    })
    .where(and(eq(scans.id, id), eq(scans.user_id, user.id)))
    .returning()

  if (!updated) {
    throw createError({
      statusCode: 404,
      message: 'Scan not found'
    })
  }

  console.info(`[api:scans] Updated scan ${id} for user ${user.id}`)

  return updated
})
