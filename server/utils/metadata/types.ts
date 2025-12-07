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
  source: 'google' | 'openlibrary' | 'loc' | 'database'
  // SLiMS Bibliographic Fields
  ddc?: string | null              // Dewey Decimal Classification
  lcc?: string | null              // Library of Congress Classification
  callNumber?: string | null       // Full shelf filing code
  subjects?: string | null         // Semicolon-separated subject headings
  series?: string | null           // Series title if applicable
  edition?: string | null          // Edition info
  collation?: string | null        // Physical description
  gmd?: string                     // General Material Designation (default: "text")
  publishPlace?: string | null     // Place of publication
  classificationTrust?: 'high' | 'medium' | 'low' | null
  // AI Enhancement
  isAiEnhanced?: boolean
  enhancedAt?: number | null       // Unix timestamp
  aiLog?: Array<{
    timestamp: number
    model: string
    changes: string[]
  }>
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
    source,
    // SLiMS fields
    ddc: null,
    lcc: null,
    callNumber: null,
    subjects: null,
    series: null,
    edition: null,
    collation: null,
    gmd: 'text',
    publishPlace: null,
    classificationTrust: null,
    isAiEnhanced: false,
    enhancedAt: null,
    aiLog: []
  }
}
