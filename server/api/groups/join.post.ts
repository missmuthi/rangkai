
import { eq, and } from 'drizzle-orm'
import { groups, groupMembers } from '../../db/schema'
import { v4 as uuidv4 } from 'uuid'
import { useDb } from '../../utils/db'
import { requireUserSession } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const body = await readBody(event)
  const inviteCode = body.code?.trim().toUpperCase()

  if (!inviteCode) throw createError({ statusCode: 400, message: 'Invite code is required' })

  const db = useDb()

  // Find group
  const group = await db.query.groups.findFirst({
    where: eq(groups.inviteCode, inviteCode)
  })

  if (!group) throw createError({ statusCode: 404, message: 'Invalid invite code' })

  // Check if already a member
  const existingMember = await db.query.groupMembers.findFirst({
    where: and(
      eq(groupMembers.groupId, group.id),
      eq(groupMembers.userId, session.user.id)
    )
  })

  if (existingMember) {
    return { success: true, groupId: group.id, message: 'Already a member' }
  }

  // Join group
  await db.insert(groupMembers).values({
    id: uuidv4(),
    groupId: group.id,
    userId: session.user.id,
    role: 'member',
    joinedAt: new Date()
  })

  return { success: true, groupId: group.id }
})
