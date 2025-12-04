/**
 * PATCH /api/profile - Update current user profile
 */

import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { user } from '../db/schema'
import { requireAuth } from '../utils/auth'

const bodySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  image: z.string().url().optional().nullable(),
})

export default defineEventHandler(async (event) => {
  const authUser = await requireAuth(event)
  const db = useDb()

  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      message: 'Invalid request body',
      data: parsed.error.issues,
    })
  }

  const updateData: Record<string, string | Date> = {
    updatedAt: new Date(),
  }

  if (parsed.data.name !== undefined) {
    updateData.name = parsed.data.name
  }

  if (parsed.data.image !== undefined) {
    updateData.image = parsed.data.image
  }

  await db
    .update(user)
    .set(updateData)
    .where(eq(user.id, authUser.id))

  console.info(`[api:profile] Updated profile for user ${authUser.id}`)

  return { success: true }
})
