/**
 * Shared book metadata types for both server and client
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
