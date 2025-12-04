import { sql } from 'drizzle-orm'
import { users } from '../db/schema'

export default eventHandler(async (event) => {
  try {
    const db = useDb() // from server/utils/db.ts
    // Try a simple COUNT(*) query to verify connectivity
    const rows = await db.select({ total: sql<number>`count(*)` }).from(users)
    const count = (rows && rows[0] && (rows[0] as any).total) || 0

    return {
      status: 'ok',
      region: (event.context as any)?.cf?.colo || null,
      users: Number(count)
    }
  } catch (err) {
    console.error('health check failed', err)
    return {
      status: 'error',
      db: 'disconnected',
      message: err instanceof Error ? err.message : String(err),
      region: (event.context as any)?.cf?.colo || null
    }
  }
})
