/**
 * POST /api/groups/[id]/migrate-scans
 * 
 * Migrates all personal scans (where groupId is null) of the authenticated user
 * to the specified group. Use this to move personal history to a group.
 */

import { eq, and } from 'drizzle-orm'
import { groupMembers } from '../../db/schema'
import { useDb } from '../../utils/db'
import { requireUserSession } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const db = useDb()
  const groupId = getRouterParam(event, 'id') || ''
  const userId = session.user.id

  if (!groupId) {
    throw createError({ statusCode: 400, message: 'Group ID is required' })
  }

  // 1. Verify membership
  const member = await db.query.groupMembers.findFirst({
    where: and(
      eq(groupMembers.groupId, groupId),
      eq(groupMembers.userId, userId)
    )
  })

  if (!member) {
    throw createError({ statusCode: 403, message: 'You are not a member of this group' })
  }

  console.info(`[api:groups:migrate] User ${userId} migrating books to group ${groupId}`)

  // 2. Update scans: Set groupId where it is currently NULL and userId matches
  const d1 = hubDatabase()
  
  // Using raw query for update efficiency/simplicity
  const result = await d1.prepare(`
    UPDATE scans
    SET group_id = ?, updated_at = ?
    WHERE user_id = ? AND group_id IS NULL
  `).bind(groupId, new Date().toISOString(), userId).run()

  const movedCount = result.meta?.changes || 0

  console.info(`[api:groups:migrate] Migrated ${movedCount} scans for user ${userId}`)

  return {
    success: true,
    moved: movedCount,
    message: `Successfully moved ${movedCount} books to the group`
  }
})
