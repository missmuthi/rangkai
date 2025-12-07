export interface BookMetadata {
  isbn: string
  title: string
  subtitle?: string | null
  authors: string[]
  publisher?: string | null
  publishedDate?: string | null
  description?: string | null
  pageCount?: number | null
  categories?: string[] | null
  thumbnail?: string | null
  language?: string | null
  previewLink?: string | null
  source?: string | null
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
