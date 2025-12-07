import { eq, desc } from 'drizzle-orm'
import { scansHistory } from '../../../db/schema'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const scanId = getRouterParam(event, 'id')
  
  if (!scanId) {
    throw createError({
      statusCode: 400,
      message: 'Scan ID is required'
    })
  }
  
  const db = useDb()
  
  // Fetch history versions for this scan
  const history = await db.select()
    .from(scansHistory)
    .where(eq(scansHistory.scanId, scanId))
    .orderBy(desc(scansHistory.version))
    
  return { history }
})
