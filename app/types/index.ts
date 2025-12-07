export interface BookMetadata {
  isbn: string
  title: string
  subtitle?: string
  authors: string[]
  publisher?: string
  publishedDate?: string
  description?: string
  pageCount?: number
  categories?: string[]
  thumbnail?: string
  language?: string
  previewLink?: string
  source?: string
}

export interface Scan {
  id: string
  isbn: string
  title: string
  authors: string
  publisher: string
  status: 'pending' | 'complete' | 'error'
  created_at: string
  updated_at: string
  notes?: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  totalScans: number
  joinDate: string
}
