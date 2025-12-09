
import { eq, and } from 'drizzle-orm'
import { groups, groupMembers, scans, user } from '../../../db/schema'
import { useDb } from '../../../utils/db'
import { requireUserSession } from '../../../utils/session'

// GET /api/groups/[id]/export - Export group books as CSV
export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const groupId = getRouterParam(event, 'id')
  
  if (!groupId) {
    throw createError({ statusCode: 400, message: 'Group ID is required' })
  }

  const db = useDb()

  // 1. Check if user is a member of this group
  const membership = await db.query.groupMembers.findFirst({
    where: and(
      eq(groupMembers.groupId, groupId),
      eq(groupMembers.userId, session.user.id)
    )
  })

  if (!membership) {
    throw createError({ statusCode: 403, message: 'You are not a member of this group' })
  }

  // 2. Get group info
  const group = await db.query.groups.findFirst({
    where: eq(groups.id, groupId)
  })

  if (!group) {
    throw createError({ statusCode: 404, message: 'Group not found' })
  }

  // 3. Get all members for name lookup
  const members = await db
    .select({
      userId: groupMembers.userId,
      userName: user.name
    })
    .from(groupMembers)
    .leftJoin(user, eq(groupMembers.userId, user.id))
    .where(eq(groupMembers.groupId, groupId))

  const memberMap = new Map(members.map(m => [m.userId, m.userName]))

  // 4. Get all scans for this group
  const groupScans = await db.query.scans.findMany({
    where: eq(scans.groupId, groupId),
    orderBy: (s, { desc }) => [desc(s.createdAt)]
  })

  // 5. Build CSV
  const headers = ['ISBN', 'Title', 'Authors', 'Publisher', 'DDC', 'LCC', 'Call Number', 'Added By', 'Added At', 'Status']
  const rows = groupScans.map(s => {
    const authors = Array.isArray(s.authors) ? s.authors.join('; ') : (s.authors || '')
    const addedBy = memberMap.get(s.userId) || 'Unknown'
    const addedAt = s.createdAt ? new Date(s.createdAt).toISOString().split('T')[0] : ''
    
    return [
      s.isbn || '',
      (s.title || '').replace(/"/g, '""'),
      authors.replace(/"/g, '""'),
      (s.publisher || '').replace(/"/g, '""'),
      s.ddc || '',
      s.lcc || '',
      s.callNumber || '',
      addedBy,
      addedAt,
      s.status || ''
    ].map(val => `"${val}"`).join(',')
  })

  const csv = [headers.join(','), ...rows].join('\n')

  // 6. Return as CSV file
  const filename = `${group.name.replace(/[^a-zA-Z0-9]/g, '_')}_export_${new Date().toISOString().split('T')[0]}.csv`
  
  setResponseHeaders(event, {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="${filename}"`
  })

  return csv
})
