/**
 * POST /api/groups/[id]/migrate-scans
 * 
 * Migrates all personal scans (where groupId is null) of the authenticated user
 * to the specified group. Use this to move personal history to a group.
 */

import { eq, and, isNull, or } from 'drizzle-orm'
import { groupMembers, scans } from '../../../db/schema'
import { useDb } from '../../../utils/db'
import { requireUserSession } from '../../../utils/session'

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

  // 2. Update only personal scans and return the affected IDs for an exact count.
  const moved = await db
    .update(scans)
    .set({
      groupId,
      updatedAt: new Date(),
    })
    .where(and(
      eq(scans.userId, userId),
      or(isNull(scans.groupId), eq(scans.groupId, ''), eq(scans.groupId, 'null'))
    ))
    .returning({ id: scans.id })

  const movedCount = moved.length

  console.info(`[api:groups:migrate] Migrated ${movedCount} scans for user ${userId}`)

  return {
    success: true,
    moved: movedCount,
    message: `Successfully moved ${movedCount} books to the group`
  }
})
