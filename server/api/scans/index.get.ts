/**
 * GET /api/scans - List all scans for the authenticated user
 */

// import { eq, desc } from 'drizzle-orm'
// import { scans } from '../../db/schema'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)


  console.info(`[api:scans] Listing scans for user ${user.id}`)

  try {
    // Use raw SQL to avoid automatic JSON parsing that fails on legacy data
    const d1 = hubDatabase()
    const { results } = await d1.prepare(
      `SELECT * FROM scans WHERE user_id = ? ORDER BY created_at DESC`
    ).bind(user.id).all()
    
    const rawScans = results

    const validScans: any[] = []
    
    for (const scan of rawScans) {
      try {
        // Manually parse JSON fields with error handling
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parsedScan: any = { ...scan }
        
        // Parse authors if it's a string
        if (typeof scan.authors === 'string' && scan.authors) {
          try {
            parsedScan.authors = JSON.parse(scan.authors)
          } catch {
            parsedScan.authors = []
          }
        }
        
        // Parse categories if it's a string
        if (typeof scan.categories === 'string' && scan.categories) {
          try {
            parsedScan.categories = JSON.parse(scan.categories)
          } catch {
            parsedScan.categories = []
          }
        }
        
        // Parse aiLog if it's a string
        if (typeof scan.ai_log === 'string' && scan.ai_log) {
          try {
            parsedScan.aiLog = JSON.parse(scan.ai_log)
          } catch {
            parsedScan.aiLog = []
          }
        }
        
        // Extract thumbnail from jsonData
        let thumbnail: string | null = null
        try {
          if (typeof scan.json_data === 'string' && scan.json_data) {
            const data = JSON.parse(scan.json_data)
            thumbnail = data.thumbnail || null
          }
        } catch {
          // Ignore JSON parse errors for jsonData
        }
        
        parsedScan.thumbnail = thumbnail
        
        validScans.push(parsedScan)
      } catch (error: unknown) {
        // Skip this scan if it's completely broken
        const msg = error instanceof Error ? error.message : String(error)
        console.warn(`[api:scans] Skipping corrupted scan ${scan.id}:`, msg)
        continue
      }
    }

    console.info(`[api:scans] Found ${validScans.length} valid scans (out of ${rawScans.length} total) for user ${user.id}`)

    return {
      scans: validScans,
      count: validScans.length
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error(`[api:scans] Fatal error fetching scans:`, msg)
    
    return {
      scans: [],
      count: 0
    }
  }
})
