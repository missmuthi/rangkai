import { eq, desc, and } from 'drizzle-orm'
import { scans, scansHistory } from '../../../../db/schema'
import { requireAuth } from '../../../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const scanId = getRouterParam(event, 'id')
  const { version } = await readBody<{ version: number }>(event)
  
  if (!scanId || version === undefined) {
    throw createError({
      statusCode: 400,
      message: 'Scan ID and version are required'
    })
  }

  const db = useDb()
  
  // Verify ownership
  const existingScan = await db.query.scans.findFirst({
    where: and(eq(scans.id, scanId), eq(scans.userId, user.id))
  })
  
  if (!existingScan) {
    throw createError({ statusCode: 404, message: 'Scan not found' })
  }
  
  // Fetch the target history version
  const targetVersion = await db.query.scansHistory.findFirst({
    where: and(
      eq(scansHistory.scanId, scanId),
      eq(scansHistory.version, version)
    )
  })
  
  if (!targetVersion) {
    throw createError({ statusCode: 404, message: 'Version not found' })
  }
  
  // Create a new history entry for the CURRENT state (before overwrite)
  // to allow undoing the restore
  // Get max version
  const lastHistory = await db.select()
    .from(scansHistory)
    .where(eq(scansHistory.scanId, scanId))
    .orderBy(desc(scansHistory.version))
    .limit(1)
    
  const newVersion = (lastHistory[0]?.version || 0) + 1
  
  await db.transaction(async (tx) => {
    // 1. Save current state to history
    await tx.insert(scansHistory).values({
      scanId: scanId,
      version: newVersion,
      snapshotAt: new Date(),
      userId: user.id,
      isbn: existingScan.isbn,
      title: existingScan.title ?? undefined,
      
      // Full metadata
      authors: existingScan.authors ?? undefined,
      publisher: existingScan.publisher ?? undefined,
      description: existingScan.description ?? undefined,
      ddc: existingScan.ddc ?? undefined,
      lcc: existingScan.lcc ?? undefined,
      callNumber: existingScan.callNumber ?? undefined,
      subjects: existingScan.subjects ?? undefined,
      series: existingScan.series ?? undefined,
      edition: existingScan.edition ?? undefined,
      collation: existingScan.collation ?? undefined,
      gmd: existingScan.gmd ?? undefined,
      publishPlace: existingScan.publishPlace ?? undefined,
      classificationTrust: existingScan.classificationTrust ?? undefined,
      isAiEnhanced: existingScan.isAiEnhanced ?? undefined,
      enhancedAt: existingScan.enhancedAt ?? undefined,
      aiLog: existingScan.aiLog ?? undefined,
      jsonData: existingScan.jsonData ?? undefined,
      status: existingScan.status ?? undefined,
      notes: existingScan.notes ?? undefined,
      
      createdAt: existingScan.createdAt, // Preserve original timestamps? No, this is history record
      updatedAt: new Date()
    })
    
    // 2. Restore scan to target version state
    await tx.update(scans)
      .set({
        title: targetVersion.title,
        authors: targetVersion.authors,
        publisher: targetVersion.publisher,
        description: targetVersion.description,
        ddc: targetVersion.ddc,
        lcc: targetVersion.lcc,
        callNumber: targetVersion.callNumber,
        subjects: targetVersion.subjects,
        series: targetVersion.series,
        edition: targetVersion.edition,
        collation: targetVersion.collation,
        gmd: targetVersion.gmd,
        publishPlace: targetVersion.publishPlace,
        classificationTrust: targetVersion.classificationTrust,
        isAiEnhanced: targetVersion.isAiEnhanced,
        enhancedAt: targetVersion.enhancedAt,
        aiLog: targetVersion.aiLog,
        jsonData: targetVersion.jsonData,
        status: targetVersion.status ?? 'pending',
        notes: targetVersion.notes,
        updatedAt: new Date()
      })
      .where(eq(scans.id, scanId))
  })
  
  return { success: true, restoredVersion: version, newBackupVersion: newVersion }
})
