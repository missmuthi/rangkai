
import { eq, sql, and, or, isNull, desc } from 'drizzle-orm'
import { groups, groupMembers, scans, user } from '../../db/schema'
import { useDb } from '../../utils/db'
import { requireUserSession } from '../../utils/session'

// GET /api/groups/[id] - Get group details with members and recent activity
export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const groupId = getRouterParam(event, 'id')
  
  if (!groupId) {
    throw createError({ statusCode: 400, message: 'Group ID is required' })
  }

  const db = useDb()

  // 1. Check if user is a member of this group
  const membership = await db.query.groupMembers.findFirst({
    where: (gm, { and, eq: equals }) => and(
      equals(gm.groupId, groupId),
      equals(gm.userId, session.user.id)
    )
  })

  if (!membership) {
    throw createError({ statusCode: 403, message: 'You are not a member of this group' })
  }

  // 2. Get group details
  const group = await db.query.groups.findFirst({
    where: eq(groups.id, groupId)
  })

  if (!group) {
    throw createError({ statusCode: 404, message: 'Group not found' })
  }

  // 3. Get all members with user details
  const members = await db
    .select({
      id: groupMembers.id,
      userId: groupMembers.userId,
      role: groupMembers.role,
      joinedAt: groupMembers.joinedAt,
      userName: user.name,
      userEmail: user.email
    })
    .from(groupMembers)
    .leftJoin(user, eq(groupMembers.userId, user.id))
    .where(eq(groupMembers.groupId, groupId))

  // 4. Get recent scans (books) for this group
  const recentScans = await db.query.scans.findMany({
    where: eq(scans.groupId, groupId),
    orderBy: (s, { desc }) => [desc(s.createdAt)],
    limit: 50
  })

  // 5. Build activity timeline
  const activities: Array<{
    type: 'join' | 'scan'
    userId: string
    userName: string | null
    timestamp: Date
    data?: { isbn?: string; title?: string | null }
  }> = []

  // Add member joins
  for (const m of members) {
    activities.push({
      type: 'join',
      userId: m.userId,
      userName: m.userName,
      timestamp: m.joinedAt
    })
  }

  // Add scans
  for (const s of recentScans) {
    const memberInfo = members.find(m => m.userId === s.userId)
    activities.push({
      type: 'scan',
      userId: s.userId,
      userName: memberInfo?.userName || 'Unknown',
      timestamp: s.createdAt,
      data: { isbn: s.isbn, title: s.title }
    })
  }

  // Sort by timestamp descending
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  // 6. Get personal scan count for the current user (eligible for migration)
  // We use Drizzle's sql operator for efficient counting
  const result = await db.select({
    count: sql<number>`count(*)`
  })
  .from(scans)
  .where(
    and(
      eq(scans.userId, session.user.id),
      or(isNull(scans.groupId), eq(scans.groupId, ''), eq(scans.groupId, 'null'))
    )
  )
  
  const personalScanCount = Number(result[0]?.count || 0)

  // 7. Get total scans for context
  const totalResult = await db.select({
    count: sql<number>`count(*)`
  })
  .from(scans)
  .where(eq(scans.userId, session.user.id))

  const totalScanCount = Number(totalResult[0]?.count || 0)

  // 8. Get Leaderboard (Top 5 Contributors)
  // Only fetching if enabled or if owner (privacy logic can be handled in UI too, but safer here)
  let leaderboard: Array<{ userId: string; count: number; userName: string | null }> = []
  
  if (group.settings?.showLeaderboard !== false) { // Default to true if undefined
     const lbResult = await db.select({
        userId: scans.userId,
        count: sql<number>`count(*)`,
        userName: user.name
      })
      .from(scans)
      .leftJoin(user, eq(scans.userId, user.id))
      .where(eq(scans.groupId, groupId))
      .groupBy(scans.userId)
      .orderBy(desc(sql`count(*)`))
      .limit(5)
      
      leaderboard = lbResult.map(r => ({
        userId: r.userId,
        count: Number(r.count),
        userName: r.userName
      }))
  }

  return {
    group: {
      id: group.id,
      name: group.name,
      description: group.description,
      inviteCode: group.inviteCode,
      ownerId: group.ownerId,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      settings: group.settings
    },
    members: members.map(m => ({
      id: m.id,
      userId: m.userId,
      name: m.userName,
      email: m.userEmail,
      role: m.role,
      joinedAt: m.joinedAt
    })),
    scans: recentScans.map(s => {
      const memberInfo = members.find(m => m.userId === s.userId)
      return {
        id: s.id,
        isbn: s.isbn,
        title: s.title,
        authors: s.authors,
        ddc: s.ddc,
        status: s.status,
        createdAt: s.createdAt,
        addedBy: memberInfo?.userName || 'Unknown'
      }
    }),
    activities: activities.slice(0, 20), // Last 20 activities
    currentUserRole: membership.role,
    isOwner: membership.role === 'owner',
    personalScanCount,
    totalScanCount,
    leaderboard
  }
})
