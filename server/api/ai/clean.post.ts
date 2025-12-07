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

  const db = hubDatabase()
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
1. OUTPUT FORMAT: Return ONLY a valid JSON object. No markdown, no extra text.
2. DDC/LCC: Assign Dewey Decimal (DDC) and Library of Congress (LCC) classifications.
   - If you cannot determine with 80%+ confidence, set to null.
   - Use the REFERENCE EXAMPLES to match the style of similar books if provided.
3. CALL NUMBER: Generate a call number following this pattern: DDC + first 3 letters of author's last name (e.g., "650.1 NEW").
4. SUBJECTS: Generate 3-5 relevant Library of Congress Subject Headings (semicolon separated).
5. CLASSIFICATION TRUST: Set to 'low' if estimated, 'medium' if from known patterns.
6. AI LOG: Create an array of strings describing what you added (e.g., ["Estimated DDC: 650.1", "Created call number"]).
7. IMPORTANT: Set 'isAiEnhanced' to true in the response.
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
    
    // Add AI metadata
    enhancedData.isAiEnhanced = true
    enhancedData.enhancedAt = new Date().toISOString()
    
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
    
    return enhancedData as BookMetadata
    
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
