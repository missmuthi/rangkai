export interface BookMetadata {
  isbn: string
  title: string | null
  subtitle?: string | null | undefined
  authors: string[]
  publisher?: string | null
  publishedDate?: string | null
  description?: string | null
  pageCount?: number | null
  categories?: string[] | null
  thumbnail?: string | null
  language?: string | null
  previewLink?: string | null
  source?: 'google' | 'openlibrary' | 'loc' | 'database' | string | null
  // SLiMS Bibliographic Fields
  ddc?: string | null
  lcc?: string | null
  callNumber?: string | null
  subjects?: string | null
  series?: string | null
  edition?: string | null
  collation?: string | null
  gmd?: string
  publishPlace?: string | null
  classificationTrust?: 'high' | 'medium' | 'low' | null
  // AI Enhancement
  isAiEnhanced?: boolean
  enhancedAt?: number | null
  aiLog?: Array<{
    timestamp: number | string
    model: string
    changes: string[]
  }>
}

export interface Scan {
  id: string
  isbn: string
  title: string | null
  authors: string | null
  publisher: string | null
  thumbnail?: string | null
  description?: string | null
  status: 'pending' | 'complete' | 'error' | 'exported'
  created_at: string
  updated_at: string
  notes?: string | null
  // SLiMS fields
  ddc?: string | null
  lcc?: string | null
  callNumber?: string | null
  subjects?: string | null
  series?: string | null
  edition?: string | null
  collation?: string | null
  gmd?: string | null
  publishPlace?: string | null
  classificationTrust?: string | null
  isAiEnhanced?: boolean
  enhancedAt?: string | null
  aiLog?: string | null
  jsonData?: string | null
}

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  totalScans: number
  joinDate: string
}

export interface Group {
  id: string
  name: string
  description?: string | null
  inviteCode: string
  ownerId: string
  role?: 'owner' | 'member' // augmented for frontend
  createdAt: string
  updatedAt: string
}
