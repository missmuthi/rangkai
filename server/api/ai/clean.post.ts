/**
 * POST /api/ai/clean - AI-powered metadata cleanup
 *
 * Cleans and normalizes book metadata using AI or rule-based processing.
 * Currently uses rule-based cleaning; can be extended with AI providers.
 */

import { requireAuth } from '../../utils/auth'

interface CleanRequest {
  title?: string
  authors?: string | string[]
  description?: string
  publisher?: string
}

interface CleanResponse {
  cleaned: {
    title: string | null
    authors: string[]
    description: string | null
    publisher: string | null
  }
  changes: string[]
}

/**
 * Clean and normalize a title string
 */
function cleanTitle(title: string | undefined): { value: string | null; changes: string[] } {
  if (!title) return { value: null, changes: [] }

  const changes: string[] = []
  let cleaned = title.trim()

  // Remove leading/trailing punctuation
  const beforePunctuation = cleaned
  cleaned = cleaned.replace(/^[:\-–—.,;]+\s*/, '').replace(/\s*[:\-–—.,;]+$/, '')
  if (cleaned !== beforePunctuation) {
    changes.push('Removed leading/trailing punctuation from title')
  }

  // Normalize multiple spaces
  if (/\s{2,}/.test(cleaned)) {
    cleaned = cleaned.replace(/\s+/g, ' ')
    changes.push('Normalized whitespace in title')
  }

  // Title case if all uppercase or all lowercase
  if (cleaned === cleaned.toUpperCase() || cleaned === cleaned.toLowerCase()) {
    cleaned = cleaned
      .split(' ')
      .map(word => {
        // Keep short words lowercase unless first word
        const lowerWords = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by', 'of', 'in']
        const lower = word.toLowerCase()
        if (lowerWords.includes(lower) && cleaned.indexOf(word) !== 0) {
          return lower
        }
        return lower.charAt(0).toUpperCase() + lower.slice(1)
      })
      .join(' ')
    changes.push('Applied title case')
  }

  return { value: cleaned || null, changes }
}

/**
 * Clean and normalize authors
 */
function cleanAuthors(authors: string | string[] | undefined): { value: string[]; changes: string[] } {
  if (!authors) return { value: [], changes: [] }

  const changes: string[] = []
  let authorList: string[]

  if (typeof authors === 'string') {
    // Split by common delimiters
    authorList = authors.split(/[,;&]|\band\b/i).map(a => a.trim()).filter(Boolean)
    if (authorList.length > 1) {
      changes.push('Split authors string into list')
    }
  } else {
    authorList = [...authors]
  }

  // Clean each author name
  const cleanedAuthors = authorList.map(author => {
    let cleaned = author.trim()

    // Remove titles/suffixes
    const beforeTitles = cleaned
    cleaned = cleaned.replace(/\b(Dr\.?|Prof\.?|Mr\.?|Mrs\.?|Ms\.?|Jr\.?|Sr\.?|PhD|Ph\.D\.?|MD|M\.D\.?)\b/gi, '').trim()
    if (cleaned !== beforeTitles && !changes.includes('Removed author titles/suffixes')) {
      changes.push('Removed author titles/suffixes')
    }

    // Normalize spacing
    cleaned = cleaned.replace(/\s+/g, ' ')

    return cleaned
  }).filter(Boolean)

  // Remove duplicates (case-insensitive)
  const seen = new Set<string>()
  const dedupedAuthors = cleanedAuthors.filter(author => {
    const lower = author.toLowerCase()
    if (seen.has(lower)) {
      if (!changes.includes('Removed duplicate authors')) {
        changes.push('Removed duplicate authors')
      }
      return false
    }
    seen.add(lower)
    return true
  })

  return { value: dedupedAuthors, changes }
}

/**
 * Clean and normalize description
 */
function cleanDescription(description: string | undefined): { value: string | null; changes: string[] } {
  if (!description) return { value: null, changes: [] }

  const changes: string[] = []
  let cleaned = description.trim()

  // Remove HTML tags
  if (/<[^>]+>/.test(cleaned)) {
    cleaned = cleaned.replace(/<[^>]+>/g, '')
    changes.push('Removed HTML tags from description')
  }

  // Normalize whitespace
  if (/\s{2,}/.test(cleaned)) {
    cleaned = cleaned.replace(/\s+/g, ' ')
    changes.push('Normalized whitespace in description')
  }

  // Truncate if too long (max 2000 chars)
  if (cleaned.length > 2000) {
    cleaned = cleaned.substring(0, 1997) + '...'
    changes.push('Truncated long description')
  }

  return { value: cleaned || null, changes }
}

/**
 * Clean and normalize publisher
 */
function cleanPublisher(publisher: string | undefined): { value: string | null; changes: string[] } {
  if (!publisher) return { value: null, changes: [] }

  const changes: string[] = []
  let cleaned = publisher.trim()

  // Remove common suffixes
  const beforeSuffix = cleaned
  cleaned = cleaned.replace(/\s*(Inc\.?|LLC|Ltd\.?|Co\.?|Corporation|Publishing|Publishers?|Books?|Press)\s*$/gi, '').trim()
  if (cleaned !== beforeSuffix) {
    changes.push('Removed publisher suffix')
  }

  // Normalize spacing
  cleaned = cleaned.replace(/\s+/g, ' ')

  return { value: cleaned || null, changes }
}

export default defineEventHandler(async (event): Promise<CleanResponse> => {
  await requireAuth(event)
  const body = await readBody<CleanRequest>(event)

  console.info('[api:ai/clean] Cleaning metadata')

  const allChanges: string[] = []

  const titleResult = cleanTitle(body.title)
  allChanges.push(...titleResult.changes)

  const authorsResult = cleanAuthors(body.authors)
  allChanges.push(...authorsResult.changes)

  const descriptionResult = cleanDescription(body.description)
  allChanges.push(...descriptionResult.changes)

  const publisherResult = cleanPublisher(body.publisher)
  allChanges.push(...publisherResult.changes)

  console.info(`[api:ai/clean] Made ${allChanges.length} changes`)

  return {
    cleaned: {
      title: titleResult.value,
      authors: authorsResult.value,
      description: descriptionResult.value,
      publisher: publisherResult.value
    },
    changes: allChanges
  }
})
