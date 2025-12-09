import { eq } from 'drizzle-orm'
import { groups } from '../../../db/schema'
import { useDb } from '../../../utils/db'
import { requireUserSession } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const groupId = getRouterParam(event, 'id') || ''
  const body = await readBody(event)

  if (!groupId) throw createError({ statusCode: 400, message: 'Group ID required' })

  const db = useDb()
  
  // Verify owner
  const group = await db.query.groups.findFirst({
    where: eq(groups.id, groupId)
  })

  if (!group) throw createError({ statusCode: 404, message: 'Group not found' })
  
  if (group.ownerId !== session.user.id) {
    throw createError({ statusCode: 403, message: 'Only owner can update settings' })
  }

  // Update settings. Merge with existing.
  const refinedSettings = {
    ...group.settings,
    ...body
  }

  try {
    await db.update(groups)
      .set({ 
        settings: refinedSettings, 
        updatedAt: new Date() 
      })
      .where(eq(groups.id, groupId))
    
    return { success: true, settings: refinedSettings }
  } catch (e) {
    console.error('Failed to update group settings', e)
    throw createError({ statusCode: 500, message: 'Failed to update settings' })
  }
})
