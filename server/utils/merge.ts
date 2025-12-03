/**
 * Data merging utility with waterfall priority
 * Priority: Google Books > Open Library > Library of Congress
 */

import type { BookMetadata } from './metadata/types'

/**
 * Merge multiple metadata sources with waterfall priority.
 * Fields are filled from the first source that has a non-empty value.
 *
 * @param sources - Array of metadata objects in priority order (highest first)
 * @returns Merged metadata object
 */
export function mergeMetadata(sources: (BookMetadata | null)[]): BookMetadata | null {
  const validSources = sources.filter((s): s is BookMetadata => s !== null)

  if (validSources.length === 0) {
    return null
  }

  const firstSource = validSources[0]
  if (!firstSource) {
    return null
  }

  // Start with empty metadata using the ISBN from first source
  const merged: BookMetadata = {
    isbn: firstSource.isbn,
    title: null,
    subtitle: null,
    authors: [],
    publisher: null,
    publishedDate: null,
    description: null,
    pageCount: null,
    categories: [],
    language: null,
    thumbnail: null,
    source: firstSource.source
  }  // Merge each field using waterfall priority
  for (const source of validSources) {
    // String fields - take first non-null value
    if (merged.title === null && source.title) {
      merged.title = source.title
    }
    if (merged.subtitle === null && source.subtitle) {
      merged.subtitle = source.subtitle
    }
    if (merged.publisher === null && source.publisher) {
      merged.publisher = source.publisher
    }
    if (merged.publishedDate === null && source.publishedDate) {
      merged.publishedDate = source.publishedDate
    }
    if (merged.description === null && source.description) {
      merged.description = source.description
    }
    if (merged.language === null && source.language) {
      merged.language = source.language
    }
    if (merged.thumbnail === null && source.thumbnail) {
      merged.thumbnail = source.thumbnail
    }

    // Number fields - take first non-null value
    if (merged.pageCount === null && source.pageCount) {
      merged.pageCount = source.pageCount
    }

    // Array fields - take first non-empty array
    if (merged.authors.length === 0 && source.authors.length > 0) {
      merged.authors = [...source.authors]
    }
    if (merged.categories.length === 0 && source.categories.length > 0) {
      merged.categories = [...source.categories]
    }
  }

  return merged
}

/**
 * Merge categories from all sources (union of unique values)
 */
export function mergeCategories(sources: (BookMetadata | null)[]): string[] {
  const validSources = sources.filter((s): s is BookMetadata => s !== null)
  const allCategories = validSources.flatMap(s => s.categories)
  return [...new Set(allCategories)]
}

/**
 * Merge authors from all sources (union of unique values, preserving order)
 */
export function mergeAuthors(sources: (BookMetadata | null)[]): string[] {
  const validSources = sources.filter((s): s is BookMetadata => s !== null)
  const seen = new Set<string>()
  const result: string[] = []

  for (const source of validSources) {
    for (const author of source.authors) {
      const normalized = author.toLowerCase().trim()
      if (!seen.has(normalized)) {
        seen.add(normalized)
        result.push(author)
      }
    }
  }

  return result
}

/**
 * Calculate completeness score for metadata (0-100)
 */
export function calculateCompleteness(metadata: BookMetadata | null): number {
  if (!metadata) return 0

  const fields = [
    { name: 'title', weight: 20, value: metadata.title },
    { name: 'authors', weight: 20, value: metadata.authors.length > 0 },
    { name: 'description', weight: 15, value: metadata.description },
    { name: 'publisher', weight: 10, value: metadata.publisher },
    { name: 'publishedDate', weight: 10, value: metadata.publishedDate },
    { name: 'pageCount', weight: 5, value: metadata.pageCount },
    { name: 'categories', weight: 10, value: metadata.categories.length > 0 },
    { name: 'thumbnail', weight: 5, value: metadata.thumbnail },
    { name: 'language', weight: 5, value: metadata.language }
  ]

  let score = 0
  for (const field of fields) {
    if (field.value) {
      score += field.weight
    }
  }

  return score
}
