/**
 * GET /api/groups/[id]/activity
 * Fetch recent activity log for a group
 */
import { activityLogs, user } from '../../../db/schema'
import { eq, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const groupId = getRouterParam(event, 'id')

  if (!groupId) {
    throw createError({ statusCode: 400, message: 'Group ID required' })
  }

  // Verify user is member of group
  const db = useDb()
  const membership = await db.query.groupMembers.findFirst({
    where: (gm, { and, eq }) => and(
      eq(gm.groupId, groupId),
      eq(gm.userId, session.user.id)
    )
  })

  if (!membership) {
    throw createError({ statusCode: 403, message: 'Not a member of this group' })
  }

  // Fetch recent activity with user info
  const activities = await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      entityType: activityLogs.entityType,
      entityId: activityLogs.entityId,
      details: activityLogs.details,
      createdAt: activityLogs.createdAt,
      userName: user.name,
      userImage: user.image
    })
    .from(activityLogs)
    .leftJoin(user, eq(activityLogs.userId, user.id))
    .where(eq(activityLogs.groupId, groupId))
    .orderBy(desc(activityLogs.createdAt))
    .limit(50)

  return {
    activities: activities.map(a => ({
      ...a,
      details: a.details ? JSON.parse(a.details) : null
    }))
  }
})
