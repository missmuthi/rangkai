import { sql } from 'drizzle-orm'

export default eventHandler(async (event) => {
  try {
    const db = useDb() // from server/utils/db.ts
    // quick readonly query to validate DB
    const result = await db.run(sql`SELECT 1 as ok`)
    return { status: 'ok', db: !!result }
  } catch (err) {
    console.error('health check failed', err)
    throw createError({ statusCode: 500, statusMessage: 'DB connection failed' })
  }
})
