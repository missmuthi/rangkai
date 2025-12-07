/**
 * Open Library API client for book metadata
 * https://openlibrary.org/developers/api
 */

import type { BookMetadata } from './types'

const OPEN_LIBRARY_API = 'https://openlibrary.org'
const TIMEOUT_MS = 10000

interface OpenLibraryEdition {
  title?: string
  subtitle?: string
  authors?: Array<{ key: string }>
  publishers?: string[]
  publish_date?: string
  description?: string | { value: string }
  number_of_pages?: number
  subjects?: string[]
  languages?: Array<{ key: string }>
  covers?: number[]
}

interface OpenLibraryAuthor {
  name?: string
  personal_name?: string
}

export async function fetchOpenLibrary(isbn: string): Promise<BookMetadata | null> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    // First, fetch the edition by ISBN
    const editionUrl = `${OPEN_LIBRARY_API}/isbn/${isbn}.json`
    const editionResponse = await fetch(editionUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RangkaiBot/1.0 (https://rangkai.app)'
      }
    })

    if (!editionResponse.ok) {
      if (editionResponse.status === 404) {
        console.info(`[metadata:openlibrary] No results for ISBN ${isbn}`)
        return null
      }
      console.warn(`[metadata:openlibrary] HTTP ${editionResponse.status} for ISBN ${isbn}`)
      return null
    }

    const edition: OpenLibraryEdition = await editionResponse.json()

    // Fetch author names if available
    const authors: string[] = []
    if (edition.authors && edition.authors.length > 0) {
      const authorPromises = edition.authors.slice(0, 5).map(async (author) => {
        try {
          const authorResponse = await fetch(`${OPEN_LIBRARY_API}${author.key}.json`, {
            signal: controller.signal,
            headers: { 'Accept': 'application/json' }
          })
          if (authorResponse.ok) {
            const authorData: OpenLibraryAuthor = await authorResponse.json()
            return authorData.name || authorData.personal_name || null
          }
          return null
        } catch {
          return null
        }
      })
      const authorNames = await Promise.all(authorPromises)
      authors.push(...authorNames.filter((name): name is string => name !== null))
    }

    // Parse description (can be string or object)
    let description: string | null = null
    if (edition.description) {
      description = typeof edition.description === 'string'
        ? edition.description
        : edition.description.value
    }

    // Get cover image
    let thumbnail: string | null = null
    if (edition.covers && edition.covers.length > 0) {
      thumbnail = `https://covers.openlibrary.org/b/id/${edition.covers[0]}-M.jpg`
    }

    // Parse language
    let language: string | null = null
    if (edition.languages && edition.languages.length > 0) {
      // Extract language code from key like "/languages/eng"
      const firstLang = edition.languages[0]
      if (firstLang) {
        language = firstLang.key.split('/').pop() || null
      }
    }

    return {
      isbn,
      title: edition.title || null,
      subtitle: edition.subtitle || null,
      authors,
      publisher: edition.publishers?.[0] || null,
      publishedDate: edition.publish_date || null,
      description,
      pageCount: edition.number_of_pages || null,
      categories: edition.subjects?.slice(0, 10) || [],
      language,
      thumbnail,
      source: 'openlibrary'
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn(`[metadata:openlibrary] Timeout after ${TIMEOUT_MS}ms for ISBN ${isbn}`)
    } else {
      console.error(`[metadata:openlibrary] Error fetching ISBN ${isbn}:`, error)
    }
    return null
  } finally {
    clearTimeout(timeoutId)
  }
}
