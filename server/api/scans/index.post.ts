/**
 * POST /api/scans - Create a new scan for the authenticated user
 */

import { scans } from '../../db/schema'
import { requireAuth } from '../../utils/auth'

interface CreateScanBody {
  isbn: string
  title?: string
  authors?: string[]
  publisher?: string
  description?: string
  status?: string
}

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody<CreateScanBody>(event)
  const db = useDb()

  console.info(`[api:scans] Creating scan for user ${user.id}`, { isbn: body.isbn })

  // Generate a unique ID for the scan
  const scanId = `scan_${Date.now()}_${Math.random().toString(36).substring(7)}`

  const result = await db
    .insert(scans)
    .values({
      id: scanId,
      userId: user.id,
      isbn: body.isbn,
      title: body.title || '',
      authors: body.authors || [],
      publisher: body.publisher || '',
      description: body.description || '',
      status: body.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
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
