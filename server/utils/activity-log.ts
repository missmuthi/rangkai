/**
 * Activity Log Utility
 * Provides helper functions for audit trail functionality
 */

import { activityLogs } from '../db/schema'

type ActionType = 'create' | 'update' | 'delete' | 'ai_clean' | 'export' | 'migrate'
type EntityType = 'scan' | 'group' | 'member'

interface LogActivityParams {
  userId: string
  groupId?: string | null
  action: ActionType
  entityType: EntityType
  entityId: string
  details?: Record<string, unknown>
}

/**
 * Log a user action for audit trail
 * Non-blocking: errors are logged but don't throw
 */
export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    const db = useDb()
    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      userId: params.userId,
      groupId: params.groupId ?? null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      details: params.details ? JSON.stringify(params.details) : null,
      createdAt: new Date()
    })
  } catch (error) {
    // Log error but don't throw - audit logging should not block operations
    console.error('[ActivityLog] Failed to log activity:', error)
  }
}

/**
 * Get recent activity for a group
 */
export async function getGroupActivity(groupId: string, limit = 50) {
  const db = useDb()
  return db.query.activityLogs.findMany({
    where: (logs, { eq }) => eq(logs.groupId, groupId),
    orderBy: (logs, { desc }) => [desc(logs.createdAt)],
    limit,
    with: {
      user: {
        columns: { id: true, name: true, image: true }
      }
    }
  })
}
