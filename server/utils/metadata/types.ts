/**
 * Book metadata types for unified data handling across sources
 */

export interface BookMetadata {
  isbn: string
  title: string | null
  subtitle: string | null
  authors: string[]
  publisher: string | null
  publishedDate: string | null
  description: string | null
  pageCount: number | null
  categories: string[]
  language: string | null
  thumbnail: string | null
  source: 'google' | 'openlibrary' | 'loc'
}

export interface MetadataSource {
  name: string
  fetch(isbn: string): Promise<BookMetadata | null>
}

export interface MetadataFetchResult {
  data: BookMetadata | null
  source: string
  error?: string
  durationMs: number
}

export function createEmptyMetadata(isbn: string, source: BookMetadata['source']): BookMetadata {
  return {
    isbn,
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
    source
  }
}
