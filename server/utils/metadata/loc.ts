/**
 * Library of Congress API client for book metadata
 * https://www.loc.gov/apis/
 */

import type { BookMetadata } from './types'

const LOC_API = 'https://www.loc.gov/books'
const TIMEOUT_MS = 5000

interface LocItem {
  title?: string
  contributor?: string[]
  date?: string
  description?: string[]
  subject?: string[]
  language?: string[]
  image_url?: string[]
}

interface LocResponse {
  results?: LocItem[]
}

export async function fetchLoc(isbn: string): Promise<BookMetadata | null> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    // LoC search API with ISBN
    const url = `${LOC_API}/?q=${isbn}&fo=json&c=1`
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RangkaiBot/1.0 (https://rangkai.app)'
      }
    })

    if (!response.ok) {
      console.warn(`[metadata:loc] HTTP ${response.status} for ISBN ${isbn}`)
      return null
    }

    const data: LocResponse = await response.json()

    if (!data.results || data.results.length === 0) {
      console.info(`[metadata:loc] No results for ISBN ${isbn}`)
      return null
    }

    const item = data.results[0]
    if (!item) {
      console.info(`[metadata:loc] No results for ISBN ${isbn}`)
      return null
    }

    // Parse title - may contain subtitle after ":"
    let title: string | null = null
    let subtitle: string | null = null
    if (item.title) {
      const parts = item.title.split(':')
      const firstPart = parts[0]
      title = firstPart ? firstPart.trim() : null
      if (parts.length > 1) {
        subtitle = parts.slice(1).join(':').trim()
      }
    }

    // Parse authors from contributor array
    const authors: string[] = item.contributor?.filter(c => !c.includes('publisher')) || []

    // Parse description - join array if present
    const description = item.description?.join(' ') || null

    // Parse language - take first if array
    const language = item.language?.[0] || null

    // Get thumbnail from image_url array
    const thumbnail = item.image_url?.[0] || null

    return {
      isbn,
      title,
      subtitle,
      authors,
      publisher: null, // LoC doesn't provide publisher in simple search
      publishedDate: item.date || null,
      description,
      pageCount: null, // LoC doesn't provide page count in simple search
      categories: item.subject?.slice(0, 10) || [],
      language,
      thumbnail,
      source: 'loc'
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn(`[metadata:loc] Timeout after ${TIMEOUT_MS}ms for ISBN ${isbn}`)
    } else {
      console.error(`[metadata:loc] Error fetching ISBN ${isbn}:`, error)
    }
    return null
  } finally {
    clearTimeout(timeoutId)
  }
}
