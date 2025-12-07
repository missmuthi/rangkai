import type { Scan } from '~/types'

/**
 * SLiMS CSV Export
 * Produces 18-column CSV compatible with SLiMS 9 Bulian import
 */
export function useSlimsExport() {
  
  // Generate unique item code: RNG-{year}-{timestamp}-{isbn8}
  function generateItemCode(isbn: string): string {
    const year = new Date().getFullYear()
    const timestamp = Math.floor(Date.now() / 1000)
    const isbn8 = isbn.slice(-8)
    return `RNG-${year}-${timestamp}-${isbn8}`
  }

  // Extract year from date string
  function extractYear(dateStr: string | null | undefined): string {
    if (!dateStr) return ''
    const match = dateStr.match(/\d{4}/)
    return match ? match[0] : ''
  }

  // Parse authors from JSON string or return as-is
  function parseAuthors(authors: string | null | undefined): string {
    if (!authors) return ''
    try {
      const parsed = JSON.parse(authors)
      if (Array.isArray(parsed)) {
        return parsed.join('; ')
      }
      return authors
    } catch {
      return authors
    }
  }

  function exportToCSV(scans: Scan[]) {
    // SLiMS 18-column header
    const headers = [
      'title',
      'gmd_name',
      'edition',
      'isbn_issn',
      'publisher_name',
      'publish_year',
      'collation',
      'series_title',
      'call_number',
      'language_name',
      'place_name',
      'classification',
      'notes',
      'image',
      'sor',
      'authors',
      'topics',
      'item_code'
    ]

    const rows = scans.map(s => {
      const authors = parseAuthors(s.authors)
      const year = extractYear(s.created_at)
      
      return [
        s.title || '',                                    // title
        'Text',                                           // gmd_name (always "Text" for books)
        '',                                               // edition (s.edition when available)
        s.isbn || '',                                     // isbn_issn
        s.publisher || '',                                // publisher_name
        year,                                             // publish_year
        '',                                               // collation (s.collation when available)
        '',                                               // series_title (s.series when available)
        '',                                               // call_number (s.callNumber when available)
        '',                                               // language_name (s.language when available)
        '',                                               // place_name (s.publishPlace when available)
        '',                                               // classification (s.ddc when available)
        s.description?.slice(0, 250) || '',               // notes (truncated description)
        '',                                               // image (s.thumbnail when available)
        authors,                                          // sor (Statement of Responsibility)
        authors,                                          // authors
        '',                                               // topics (s.subjects when available)
        generateItemCode(s.isbn || '')                    // item_code
      ]
    })

    // Escape quotes and wrap in quotes
    const escapeCSV = (val: string) => `"${(val || '').replace(/"/g, '""')}"`

    const csv = [
      headers.join(','),
      ...rows.map(r => r.map(escapeCSV).join(','))
    ].join('\r\n')
    
    // UTF-8 BOM for Windows compatibility
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `rangkai-slims-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Placeholder for future API integration
  async function exportToSlimsApi(scans: Scan[]) {
    // TODO: Implement SLIMS API push
    console.log('Exporting to SLIMS API...', scans.length)
  }

  return {
    exportToCSV,
    exportToSlimsApi
  }
}
