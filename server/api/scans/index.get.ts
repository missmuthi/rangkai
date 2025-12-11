/**
 * GET /api/scans - List all scans for the authenticated user
 * Supports pagination via ?limit=50&offset=0
 */

import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);

  // Pagination params with sensible defaults
  const query = getQuery(event);
  const limit = Math.min(Number(query.limit) || 50, 100); // Max 100 per request
  const offset = Number(query.offset) || 0;

  console.info(
    `[api:scans] Listing scans for user ${user.id} (limit=${limit}, offset=${offset})`
  );

  try {
    const d1 = hubDatabase();

    // Get total count for pagination metadata
    const countResult = await d1
      .prepare(`SELECT COUNT(*) as total FROM scans WHERE user_id = ?`)
      .bind(user.id)
      .first<{ total: number }>();
    const total = countResult?.total || 0;

    // Fetch paginated results with LIMIT and OFFSET
    const { results } = await d1
      .prepare(
        `SELECT * FROM scans WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`
      )
      .bind(user.id, limit, offset)
      .all();

    const rawScans = results;

    const validScans: unknown[] = [];

    for (const scan of rawScans) {
      try {
        const parsedScan: Record<string, unknown> = { ...scan };

        // Parse authors if it's a string
        if (typeof scan.authors === "string" && scan.authors) {
          try {
            parsedScan.authors = JSON.parse(scan.authors as string);
          } catch {
            parsedScan.authors = [];
          }
        }

        // Parse categories if it's a string
        if (typeof scan.categories === "string" && scan.categories) {
          try {
            parsedScan.categories = JSON.parse(scan.categories as string);
          } catch {
            parsedScan.categories = [];
          }
        }

        // Parse aiLog if it's a string
        if (typeof scan.ai_log === "string" && scan.ai_log) {
          try {
            parsedScan.aiLog = JSON.parse(scan.ai_log as string);
          } catch {
            parsedScan.aiLog = [];
          }
        }

        // Extract thumbnail from jsonData
        let thumbnail: string | null = null;
        try {
          if (typeof scan.json_data === "string" && scan.json_data) {
            const data = JSON.parse(scan.json_data as string);
            thumbnail = data.thumbnail || null;
          }
        } catch {
          // Ignore JSON parse errors for jsonData
        }

        parsedScan.thumbnail = thumbnail;

        validScans.push(parsedScan);
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.warn(`[api:scans] Skipping corrupted scan ${scan.id}:`, msg);
        continue;
      }
    }

    console.info(
      `[api:scans] Found ${validScans.length} valid scans for user ${user.id}`
    );

    return {
      scans: validScans,
      count: validScans.length,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[api:scans] Fatal error fetching scans:`, msg);

    return {
      scans: [],
      count: 0,
      total: 0,
      limit,
      offset,
      hasMore: false,
    };
  }
});
