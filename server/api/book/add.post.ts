/**
 * Example Best-Practice API Handler
 * Demonstrates:
 * - Zod validation
 * - SQL injection prevention via Drizzle
 * - XSS prevention via sanitization
 */

import { z } from 'zod'
import { books } from '../../db/schema'
import { requireAuth } from '../../utils/auth'
import { sanitizeHtml, sanitizeText } from '../../utils/sanitize'

// Input validation schema
const addBookSchema = z.object({
  isbn: z.string()
    .regex(/^\d{9}[\dXx]|\d{13}$/, 'Invalid ISBN format')
    .transform(val => val.replace(/[-\s]/g, '')),
  title: z.string()
    .min(1, 'Title is required')
    .max(500, 'Title too long'),
  description: z.string()
    .max(5000, 'Description too long')
    .optional(),
  authors: z.array(z.string().max(200)).optional(),
  publisher: z.string().max(200).optional(),
  pageCount: z.number().int().positive().optional(),
  language: z.string().length(2).optional() // ISO 639-1
})

export default defineEventHandler(async (event) => {
  // 1. Authentication
  const user = await requireAuth(event)

  // 2. Input Validation
  const body = await readBody(event)
  const parseResult = addBookSchema.safeParse(body)

  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      message: 'Validation failed',
      data: parseResult.error.format()
    })
  }

  const validated = parseResult.data

  // 3. XSS Prevention - Sanitize text fields
  const sanitizedData = {
    ...validated,
    title: sanitizeText(validated.title),
    description: validated.description ? sanitizeHtml(validated.description) : null,
    authors: validated.authors?.map(a => sanitizeText(a)) || []
  }

  const db = useDb()

  // 4. SQL Injection Prevention - Drizzle uses prepared statements automatically
  try {
    const [newBook] = await db.insert(books).values({
      id: crypto.randomUUID(),
      isbn: sanitizedData.isbn,
      title: sanitizedData.title,
      description: sanitizedData.description,
      authors: sanitizedData.authors,
      publisher: sanitizedData.publisher || null,
      pageCount: sanitizedData.pageCount || null,
      language: sanitizedData.language || 'en',
      source: 'manual',
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning()

    return {
      success: true,
      book: newBook
    }
  } catch (error: unknown) {
    // Handle duplicate ISBN
    if (error instanceof Error && error.message.includes('UNIQUE constraint')) {
      throw createError({
        statusCode: 409,
        message: 'Book with this ISBN already exists'
      })
    }

    console.error('[api:book:add] Database error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to add book'
    })
  }
})
