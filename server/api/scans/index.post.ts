/**
 * POST /api/scans - Create a new scan for the authenticated user
 */

import { scans } from '../../db/schema'
import { requireAuth } from '../../utils/auth'

interface CreateScanBody {
  isbn?: string
  title?: string
  authors?: string
  description?: string
}

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody<CreateScanBody>(event)
  const db = useDb()

  console.info(`[api:scans] Creating scan for user ${user.id}`, { isbn: body.isbn })

  const result = await db
    .insert(scans)
    .values({
      user_id: user.id,
      isbn: body.isbn || null,
      title: body.title || null,
      authors: body.authors || null,
      description: body.description || null
    })
    .returning()

  const newScan = result[0]
  if (!newScan) {
    throw createError({
      statusCode: 500,
      message: 'Failed to create scan'
    })
  }

  console.info(`[api:scans] Created scan ${newScan.id} for user ${user.id}`)

  setResponseStatus(event, 201)
  return newScan
})
