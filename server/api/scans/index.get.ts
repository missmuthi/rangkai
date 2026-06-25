/**
 * GET /api/scans - List scans for the authenticated user.
 */

import { desc, eq, sql } from 'drizzle-orm'

import { scans } from '../../db/schema'
import { requireAuth } from '../../utils/auth'
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const query = getQuery(event)
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(Number(query.limit) || 25, 100)
  const offset = (page - 1) * limit
  const db = useDb()

  const [countRow] = await db
    .select({ total: sql<number>`count(*)` })
    .from(scans)
    .where(eq(scans.userId, user.id))

  const total = Number(countRow?.total || 0)
  const rows = await db
    .select()
    .from(scans)
    .where(eq(scans.userId, user.id))
    .orderBy(desc(scans.createdAt))
    .limit(limit)
    .offset(offset)

  return {
    scans: rows.map(scan => ({
      ...scan,
      created_at: scan.createdAt,
      updated_at: scan.updatedAt,
      call_number: scan.callNumber,
      publish_place: scan.publishPlace,
      classification_trust: scan.classificationTrust,
      is_ai_enhanced: scan.isAiEnhanced,
      enhanced_at: scan.enhancedAt,
      ai_log: scan.aiLog,
      json_data: scan.jsonData,
      exported_at: scan.exportedAt,
      thumbnail: (() => {
        if (!scan.jsonData) return null
        try {
          return (JSON.parse(scan.jsonData) as { thumbnail?: string | null }).thumbnail || null
        } catch {
          return null
        }
      })(),
    })),
    count: rows.length,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
})
