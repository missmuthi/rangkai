
import { eq, and } from 'drizzle-orm'
import { groupMembers } from '../../../../db/schema'
import { useDb } from '../../../../utils/db'
import { requireUserSession } from '../../../../utils/session'

// DELETE /api/groups/[id]/members/[userId] - Remove a member from group (owner only)
export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const groupId = getRouterParam(event, 'id')
  const targetUserId = getRouterParam(event, 'userId')
  
  if (!groupId || !targetUserId) {
    throw createError({ statusCode: 400, message: 'Group ID and User ID are required' })
  }

  const db = useDb()

  // 1. Check if current user is owner of this group
  const currentMembership = await db.query.groupMembers.findFirst({
    where: and(
      eq(groupMembers.groupId, groupId),
      eq(groupMembers.userId, session.user.id)
    )
  })

  if (!currentMembership || currentMembership.role !== 'owner') {
    throw createError({ statusCode: 403, message: 'Only the group owner can remove members' })
  }

  // 2. Cannot remove yourself (owner)
  if (targetUserId === session.user.id) {
    throw createError({ statusCode: 400, message: 'Owner cannot remove themselves. Transfer ownership or delete the group.' })
  }

  // 3. Check if target is a member
  const targetMembership = await db.query.groupMembers.findFirst({
    where: and(
      eq(groupMembers.groupId, groupId),
      eq(groupMembers.userId, targetUserId)
    )
  })

  if (!targetMembership) {
    throw createError({ statusCode: 404, message: 'User is not a member of this group' })
  }

  // 4. Remove the member (their scans remain with groupId intact)
  await db.delete(groupMembers).where(
    and(
      eq(groupMembers.groupId, groupId),
      eq(groupMembers.userId, targetUserId)
    )
  )

  return { success: true, message: 'Member removed' }
})
