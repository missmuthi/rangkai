/**
 * POST /api/ai/clean
 * RAG-Enhanced Book Classification System
 * Layer 1: Local Cache → Layer 2: Open Library → Layer 3: Groq AI with Context
 */

import { requireAuth } from '../../utils/auth'
import type { BookMetadata } from '../../utils/metadata/types'
import { fetchOpenLibraryClassification } from '../../utils/metadata/openlibrary-classification'
import { eq, like } from 'drizzle-orm'

// Groq API Configuration
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL_ID = 'llama-3.1-8b-instant' // Fast, efficient, good at JSON

interface AiCleanRequest {
  metadata: BookMetadata
}

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const body = await readBody<AiCleanRequest>(event)
  const metadata = body.metadata
  
  if (!metadata || !metadata.isbn) {
    throw createError({
      statusCode: 400,
      message: 'Metadata with ISBN is required'
    })
  }

  const db = useDb()
  const { classificationCache } = await import('../../db/schema')
  const isbn = metadata.isbn

  console.info(`[AI Clean] Processing ISBN: ${isbn}`)
  console.info(`[AI Clean] Title: "${metadata.title}"`)

  // =================================================================
  // LAYER 1: CHECK LOCAL CLASSIFICATION CACHE
  // =================================================================
  const cached = await db
    .select()
    .from(classificationCache)
    .where(eq(classificationCache.isbn, isbn))
    .get()

  if (cached && cached.verified) {
    console.info(`[AI Clean] ✓ Cache HIT (verified) - Instant return`)
    return {
      ...metadata,
      ddc: cached.ddc,
      lcc: cached.lcc,
      callNumber: cached.callNumber,
      subjects: cached.subjects,
      classificationTrust: 'high',
      source: 'local_cache',
      isAiEnhanced: false, // It's from cache, not AI
    } as BookMetadata
  }

  // =================================================================
  // LAYER 2: TRY OPEN LIBRARY (FREE)
  // =================================================================
  const olData = await fetchOpenLibraryClassification(isbn)
  
  if (olData && olData.ddc) {
    console.info(`[AI Clean] ✓ Open Library HIT - DDC: ${olData.ddc}, LCC: ${olData.lcc}`)
    
    // Save to cache for future
    await db.insert(classificationCache).values({
      isbn,
      title: metadata.title || olData.title || '',
      authors: Array.isArray(metadata.authors) ? metadata.authors.join('; ') : metadata.authors || null,
      ddc: olData.ddc,
      lcc: olData.lcc,
      callNumber: olData.ddc ? `${olData.ddc} ${(metadata.authors?.[0] || '').substring(0, 3).toUpperCase()}` : null,
      subjects: olData.subjects?.join('; ') || null,
      source: 'openlibrary',
      verified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }).onConflictDoNothing()

    return {
      ...metadata,
      ddc: olData.ddc,
      lcc: olData.lcc,
      subjects: olData.subjects?.join('; ') || metadata.subjects,
      classificationTrust: 'medium',
      source: 'openlibrary',
      isAiEnhanced: false,
    } as BookMetadata
  }

  console.info(`[AI Clean] Open Library MISS - proceeding to AI with RAG context`)

  // =================================================================
  // LAYER 3: GROQ AI WITH RAG CONTEXT
  // =================================================================
  const config = useRuntimeConfig()
  const apiKey = config.groqApiKey || process.env.GROQ_API_KEY
  
  if (!apiKey) {
    console.error('[AI Clean] GROQ_API_KEY not configured')
    throw createError({
      statusCode: 500,
      message: 'GROQ_API_KEY is not configured on server'
    })
  }

  // RAG: Find similar books from cache to teach the AI our style
  const titleFirstWord = metadata.title?.split(' ')[0] || ''
  const similarBooks = await db
    .select({
      title: classificationCache.title,
      callNumber: classificationCache.callNumber,
      ddc: classificationCache.ddc,
    })
    .from(classificationCache)
    .where(like(classificationCache.title, `%${titleFirstWord}%`))
    .limit(3)
    .all()

  let ragContext = ''
  if (similarBooks.length > 0) {
    ragContext = `\n\nREFERENCE EXAMPLES FROM OUR LIBRARY (Follow this Style):\n${similarBooks.map(b => `- "${b.title}" → DDC: ${b.ddc}, Call Number: "${b.callNumber}"`).join('\n')}\n`
  }

  // System Prompt with RAG enhancement
  const systemPrompt = `You are an expert Library Cataloger and SLiMS specialist.
Your task is to enhance book metadata with accurate classifications.

Strictly follow these rules:
1. OUTPUT FORMAT: Return the COMPLETE book metadata as a valid JSON object, INCLUDING all original fields (isbn, title, authors, publisher, etc.) PLUS your classifications. No markdown, no extra text.
2. PRESERVE ORIGINAL: Keep ALL original fields (authors, title, publisher, publishedDate, description, pageCount, categories, language, thumbnail, source, etc.) in your response.
3. ADD CLASSIFICATIONS: Add these fields:
   - DDC: Dewey Decimal Classification (string or null if uncertain)
   - LCC: Library of Congress Classification (string or null if uncertain)
   - callNumber: Format as "DDC + first 3 letters of author's last name" (e.g., "650.1 NEW")
   - subjects: 3-5 relevant Library of Congress Subject Headings (semicolon separated string)
   - classificationTrust: 'low' if estimated, 'medium' if from known patterns, 'high' if certain
   - AI_LOG: Array of strings describing what you added (e.g., ["Estimated DDC: 650.1", "Created call number"])
   - isAiEnhanced: Set to true
4. CONFIDENCE: If you cannot determine DDC/LCC with 80%+ confidence, set to null.
5. RAG GUIDANCE: Use the REFERENCE EXAMPLES to match the style of similar books if provided.
${ragContext}`
  
  const userPrompt = JSON.stringify(metadata)
  
  try {
    console.info(`[AI Clean] Calling Groq with ${similarBooks.length} RAG examples`)
    
    const response = await $fetch<any>(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: {
        model: MODEL_ID,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      }
    })
    
    const content = response.choices[0]?.message?.content
    if (!content) {
      console.error('[AI Clean] Empty Groq response')
      throw new Error('Empty response from Groq')
    }
    
    const enhancedData = JSON.parse(content)
    
    // Debug: Log what AI actually returned
    console.info('[AI Clean] Raw AI response:', JSON.stringify(enhancedData, null, 2))
    
    // Normalize keys (AI sometimes returns uppercase) and handle "null" strings
    const normalizeValue = (val: any) => {
      if (val === 'null' || val === 'undefined') return null
      return val
    }

    const ddc = normalizeValue(enhancedData.ddc || enhancedData.DDC)
    const lcc = normalizeValue(enhancedData.lcc || enhancedData.LCC)
    const callNumber = normalizeValue(enhancedData.callNumber || enhancedData.CALL_NUMBER)
    const subjects = normalizeValue(enhancedData.subjects || enhancedData.SUBJECTS)
    const classificationTrust = normalizeValue(enhancedData.classificationTrust || enhancedData.CLASSIFICATION_TRUST)

    // Normalize authors (ensure array)
    let authors = enhancedData.authors || enhancedData.AUTHORS || []
    if (typeof authors === 'string') {
       try {
         authors = JSON.parse(authors)
       } catch (e) {
         authors = [authors] // Treat as single author name
       }
    }
    if (!Array.isArray(authors)) {
      authors = [String(authors)]
    }

    // Add AI metadata
    enhancedData.isAiEnhanced = true
    enhancedData.enhancedAt = new Date().toISOString()
    
    // Update enhancedData with normalized values for subsequent usage
    enhancedData.ddc = ddc
    enhancedData.lcc = lcc
    enhancedData.callNumber = callNumber
    enhancedData.subjects = subjects
    enhancedData.classificationTrust = classificationTrust
    enhancedData.authors = authors

    if (!enhancedData.aiLog || !Array.isArray(enhancedData.aiLog)) {
      enhancedData.aiLog = ['AI classification applied']
    }

    console.info(`[AI Clean] ✓ AI Success - DDC: ${enhancedData.ddc}, LCC: ${enhancedData.lcc}`)

    // Save to cache for future
    if (enhancedData.ddc || enhancedData.lcc) {
      await db.insert(classificationCache).values({
        isbn,
        title: metadata.title || '',
        authors: Array.isArray(metadata.authors) ? metadata.authors.join('; ') : metadata.authors || null,
        ddc: enhancedData.ddc || null,
        lcc: enhancedData.lcc || null,
        callNumber: enhancedData.callNumber || null,
        subjects: enhancedData.subjects || null,
        source: 'ai',
        verified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }).onConflictDoNothing()
    }
    
    // Sanitize data: convert undefined to null for SQLite compatibility
    const sanitized = {
      ...metadata,
      ...enhancedData,
      // Ensure critical fields are never undefined
      ddc: enhancedData.ddc || metadata.ddc || null,
      lcc: enhancedData.lcc || metadata.lcc || null,
      callNumber: enhancedData.callNumber || metadata.callNumber || null,
      subjects: enhancedData.subjects || metadata.subjects || null,
      classificationTrust: enhancedData.classificationTrust || metadata.classificationTrust || null,
      aiLog: JSON.stringify(enhancedData.aiLog || ['AI classification applied']),
      isAiEnhanced: true,
      enhancedAt: enhancedData.enhancedAt
    }
    
    return sanitized as BookMetadata
    
  } catch (error: any) {
    console.error('[AI Clean] Groq failed:', {
      message: error.message,
      status: error.statusCode || error.status,
    })
    
    if (error.statusCode === 429 || error.status === 429) {
      throw createError({
        statusCode: 429,
        message: 'AI rate limit reached. Please wait a moment and try again.'
      })
    }
    
    throw createError({
      statusCode: 502,
      message: `AI Service error: ${error.message || 'Unknown error'}`
    })
  }
})
