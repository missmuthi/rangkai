
import { eq, and } from 'drizzle-orm'
import { groups, groupMembers } from '../db/schema'
import { v4 as uuidv4 } from 'uuid'
import { useDb } from '../utils/db'
import { requireUserSession } from '../utils/session'

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const db = useDb()
  const method = event.method

  if (method === 'GET') {
    // List user's groups
    const memberships = await db.query.groupMembers.findMany({
      where: eq(groupMembers.userId, session.user.id),
      with: {
        group: true
      }
    })
    return memberships.map(m => ({ ...m.group, role: m.role }))
  }

  if (method === 'POST') {
    // Create new group
    const body = await readBody(event)
    const name = body.name?.trim()

    if (!name) throw createError({ statusCode: 400, message: 'Group name is required' })

    const now = new Date()
    const groupId = uuidv4()
    
    // Create group
    await db.insert(groups).values({
      id: groupId,
      name,
      description: body.description,
      inviteCode: generateInviteCode(),
      ownerId: session.user.id,
      createdAt: now,
      updatedAt: now
    })

    // Add owner as member
    await db.insert(groupMembers).values({
      id: uuidv4(),
      groupId: groupId,
      userId: session.user.id,
      role: 'owner',
      joinedAt: now
    })

    return { success: true, groupId }
  }
})
