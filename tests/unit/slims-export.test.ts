import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useSlimsExport } from '../../app/composables/useSlimsExport'
import type { Scan } from '../../app/types'

describe('useSlimsExport', () => {
  // Mock browser APIs
  const originalCreateObjectURL = global.URL.createObjectURL
  const originalRevokeObjectURL = global.URL.revokeObjectURL
  
  // Track created blobs and download links
  let createdBlobs: Blob[] = []
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let downloadedUrl: string | null = null
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let downloadedFilename: string | null = null

  beforeEach(() => {
    createdBlobs = []
    downloadedUrl = null
    downloadedFilename = null

    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn((blob: Blob) => {
      createdBlobs.push(blob)
      return 'blob:mock-url'
    })
    
    global.URL.revokeObjectURL = vi.fn()

    // Mock document.createElement
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        const anchor = {
          click: vi.fn(),
          href: '',
          download: ''
        }
        // Use proxy to capture setters
        return new Proxy(anchor, {
          set(target, prop, value) {
            if (prop === 'href') downloadedUrl = value
            if (prop === 'download') downloadedFilename = value
            // dynamic assignment
            ;(target as any)[prop] = value
            return true
          },
          get(target, prop) {
             // dynamic access
            return (target as any)[prop]
          }
        }) as unknown as HTMLElement
      }
      return document.createElement(tagName)
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any)
  })

  afterEach(() => {
    global.URL.createObjectURL = originalCreateObjectURL
    global.URL.revokeObjectURL = originalRevokeObjectURL
    vi.restoreAllMocks()
  })

  it('exports valid SLiMS 9 CSV format', async () => {
    const { exportToCSV } = useSlimsExport()
    
    const mockDate = new Date('2025-01-01T12:00:00Z')
    const mockScan: Partial<Scan> = {
      title: 'The Great Gatsby',
      isbn: '9780743273565',
      authors: JSON.stringify(['F. Scott Fitzgerald']),
      publisher: 'Scribner',
      created_at: mockDate.toISOString(),
      description: 'A classic novel.',
      status: 'complete',
      // SLiMS fields
      // Scan type uses ddc, lcc etc.
      updated_at: mockDate.toISOString(),
      id: 'scan-1'
    }

    // Cast to Scan array since we're mocking partial
    exportToCSV([mockScan as Scan])

    expect(createdBlobs.length).toBe(1)
    const blob = createdBlobs[0]
    if (!blob) throw new Error('Blob not created')
    
    const text = await blob.text()
    
    // Check BOM
    expect(text.charCodeAt(0)).toBe(0xFEFF) // UTF-8 BOM

    const lines = text.slice(1).split('\r\n')
    // Ensure we have header and at least one data row
    expect(lines.length).toBeGreaterThanOrEqual(2)
    
    const headerLine = lines[0]
    if (!headerLine) throw new Error('Missing header line')
    
    const header = headerLine.split(',')
    
    const rowLine = lines[1]
    if (!rowLine) throw new Error('Missing data line')

    const row = rowLine
      // Simple CSV parser for testing
      .match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
      ?.map(s => s.replace(/^"|"$/g, '').replace(/""/g, '"'))

    // 1. Verify Headers (18 columns required by SLiMS)
    const expectedHeaders = [
      'title', 'gmd_name', 'edition', 'isbn_issn', 'publisher_name', 'publish_year',
      'collation', 'series_title', 'call_number', 'language_name', 'place_name',
      'classification', 'notes', 'image', 'sor', 'authors', 'topics', 'item_code'
    ]
    expect(header).toEqual(expectedHeaders)

    // 2. Verify Data
    expect(row?.[0]).toBe('The Great Gatsby')
    expect(row?.[3]).toBe('9780743273565')
    expect(row?.[4]).toBe('Scribner')
    expect(row?.[5]).toBe('2025') // From created_at
    expect(row?.[15]).toBe('F. Scott Fitzgerald')
    expect(row?.[17]).toMatch(/^RNG-\d{4}-\d+-\d{8}$/)
  })

  it('handles missing data gracefully', async () => {
    const { exportToCSV } = useSlimsExport()
    
    const emptyScan: Partial<Scan> = {
      created_at: new Date().toISOString(),
      id: 'empty',
      isbn: '000',
      status: 'pending',
      updated_at: new Date().toISOString()
    }

    exportToCSV([emptyScan as Scan])
    
    const blob = createdBlobs[0]
    if (!blob) throw new Error('Blob not created')
      
    const text = (await blob.text()).slice(1) // Skip BOM
    const lines = text.split('\r\n')
    const row = lines[1]
    
    // Should produce empty strings
    expect(row).toContain(',"","","","",""') 
  })
})
