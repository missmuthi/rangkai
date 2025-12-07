/**
 * PATCH /api/scans/[id] - Update a specific scan for the authenticated user
 */

import { eq, and } from 'drizzle-orm'
import { scans } from '../../db/schema'
import { requireAuth } from '../../utils/auth'

interface UpdateScanBody {
  // Core
  isbn?: string
  title?: string
  authors?: string
  description?: string
  publisher?: string
  pageCount?: number
  categories?: string
  language?: string
  thumbnail?: string
  
  // SLiMS
  ddc?: string
  lcc?: string
  callNumber?: string
  subjects?: string
  series?: string
  edition?: string
  collation?: string
  gmd?: string
  publishPlace?: string
  classificationTrust?: string
  
  // AI
  isAiEnhanced?: boolean
  enhancedAt?: string
  aiLog?: string
  jsonData?: string
  
  // Meta
  status?: string
  notes?: string
}

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody<UpdateScanBody>(event)
  const db = useDb()

  if (!id) throw createError({ statusCode: 400, message: 'Scan ID required' })

  console.info(`[api:scans] Updating scan ${id} for user ${user.id}`)

  // Allow all fields from body that match schema
  // (In a real app we might want stricter validation/sanitization here)
  const updateData = { ...body } as Record<string, unknown>
  delete updateData.id // Protect immutable fields
  delete updateData.userId
  delete updateData.createdAt

  const [updated] = await db
    .update(scans)
    .set({
      ...updateData,
      updatedAt: new Date()
    })
    .where(and(eq(scans.id, id), eq(scans.userId, user.id)))
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
