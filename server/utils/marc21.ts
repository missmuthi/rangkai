/**
 * MARC21 Record Builder
 * Generates MARC21 records for library system integration (Koha, etc.)
 * 
 * MARC21 Format Reference:
 * - Leader: 24 characters
 * - Directory: 12 bytes per field (tag + length + start position)
 * - Fields: Variable length with field terminator (0x1E)
 * - Record terminator: 0x1D
 */

interface MarcField {
  tag: string
  indicators?: string
  subfields?: { code: string; value: string }[]
  value?: string // For control fields (00X)
}

interface BookData {
  isbn?: string
  isbn10?: string
  isbn13?: string
  title?: string
  authors?: string | string[]
  publisher?: string
  publishedDate?: string
  description?: string
  pageCount?: number
  language?: string
  ddc?: string
  lcc?: string
  subjects?: string
  series?: string
  edition?: string
  collation?: string
}

const FIELD_TERMINATOR = '\x1E' // ASCII 30
const RECORD_TERMINATOR = '\x1D' // ASCII 29
const SUBFIELD_DELIMITER = '\x1F' // ASCII 31

/**
 * Build a MARC21 record from book data
 */
export function buildMarc21Record(book: BookData): string {
  const fields: MarcField[] = []
  
  // Control fields
  fields.push({ tag: '001', value: book.isbn || 'unknown' })
  fields.push({ tag: '003', value: 'Rangkai' })
  fields.push({ tag: '005', value: formatMarcDate(new Date()) })
  fields.push({ tag: '008', value: build008Field(book) })
  
  // ISBN (020)
  if (book.isbn13 || book.isbn) {
    fields.push({
      tag: '020',
      indicators: '  ',
      subfields: [{ code: 'a', value: book.isbn13 || book.isbn || '' }]
    })
  }
  if (book.isbn10) {
    fields.push({
      tag: '020',
      indicators: '  ',
      subfields: [{ code: 'a', value: book.isbn10 }]
    })
  }
  
  // Language (041)
  if (book.language) {
    fields.push({
      tag: '041',
      indicators: '0 ',
      subfields: [{ code: 'a', value: book.language.slice(0, 3) }]
    })
  }
  
  // DDC Classification (082)
  if (book.ddc) {
    fields.push({
      tag: '082',
      indicators: '04',
      subfields: [{ code: 'a', value: book.ddc }]
    })
  }
  
  // LCC Classification (050)
  if (book.lcc) {
    fields.push({
      tag: '050',
      indicators: ' 4',
      subfields: [{ code: 'a', value: book.lcc }]
    })
  }
  
  // Main Entry - Personal Name (100)
  const authors = normalizeAuthors(book.authors)
  if (authors.length > 0) {
    fields.push({
      tag: '100',
      indicators: '1 ',
      subfields: [{ code: 'a', value: authors[0]! }]
    })
  }
  
  // Title Statement (245)
  if (book.title) {
    const subfields = [{ code: 'a', value: book.title }]
    if (authors.length > 0) {
      subfields.push({ code: 'c', value: authors.join(', ') })
    }
    fields.push({
      tag: '245',
      indicators: '10',
      subfields
    })
  }
  
  // Edition (250)
  if (book.edition) {
    fields.push({
      tag: '250',
      indicators: '  ',
      subfields: [{ code: 'a', value: book.edition }]
    })
  }
  
  // Publication (264)
  if (book.publisher || book.publishedDate) {
    const subfields = []
    if (book.publisher) subfields.push({ code: 'b', value: book.publisher })
    if (book.publishedDate) subfields.push({ code: 'c', value: book.publishedDate })
    fields.push({
      tag: '264',
      indicators: ' 1',
      subfields
    })
  }
  
  // Physical Description (300)
  if (book.pageCount || book.collation) {
    fields.push({
      tag: '300',
      indicators: '  ',
      subfields: [{ code: 'a', value: book.collation || `${book.pageCount} p.` }]
    })
  }
  
  // Series (490)
  if (book.series) {
    fields.push({
      tag: '490',
      indicators: '0 ',
      subfields: [{ code: 'a', value: book.series }]
    })
  }
  
  // Summary (520)
  if (book.description) {
    fields.push({
      tag: '520',
      indicators: '  ',
      subfields: [{ code: 'a', value: book.description.slice(0, 500) }]
    })
  }
  
  // Subject headings (650)
  if (book.subjects) {
    const subjectList = book.subjects.split(';').map(s => s.trim()).filter(Boolean)
    for (const subject of subjectList.slice(0, 5)) {
      fields.push({
        tag: '650',
        indicators: ' 0',
        subfields: [{ code: 'a', value: subject }]
      })
    }
  }
  
  // Added Entry - Personal Name (700) for co-authors
  for (const coauthor of authors.slice(1)) {
    fields.push({
      tag: '700',
      indicators: '1 ',
      subfields: [{ code: 'a', value: coauthor }]
    })
  }
  
  return assembleMarc21Record(fields)
}

/**
 * Assemble fields into a complete MARC21 record
 */
function assembleMarc21Record(fields: MarcField[]): string {
  // Build data portion
  let dataContent = ''
  const directoryEntries: string[] = []
  
  for (const field of fields) {
    const fieldData = buildFieldData(field)
    const startPos = dataContent.length
    const length = fieldData.length + 1 // +1 for field terminator
    
    // Directory entry: tag (3) + length (4) + start (5)
    directoryEntries.push(
      field.tag +
      String(length).padStart(4, '0') +
      String(startPos).padStart(5, '0')
    )
    
    dataContent += fieldData + FIELD_TERMINATOR
  }
  
  const directory = directoryEntries.join('')
  const baseAddress = 24 + directory.length + 1 // Leader + Directory + Field Terminator
  
  // Build leader
  const recordLength = baseAddress + dataContent.length + 1 // +1 for record terminator
  const leader = buildLeader(recordLength, baseAddress)
  
  return leader + directory + FIELD_TERMINATOR + dataContent + RECORD_TERMINATOR
}

function buildFieldData(field: MarcField): string {
  if (field.value !== undefined) {
    // Control field
    return field.value
  }
  
  // Variable field with indicators and subfields
  let data = field.indicators || '  '
  for (const sf of field.subfields || []) {
    data += SUBFIELD_DELIMITER + sf.code + sf.value
  }
  return data
}

function buildLeader(recordLength: number, baseAddress: number): string {
  // 24 character MARC leader
  return (
    String(recordLength).padStart(5, '0') + // 00-04: Record length
    'n' +                                    // 05: Record status (new)
    'a' +                                    // 06: Type of record (language material)
    'm' +                                    // 07: Bibliographic level (monograph)
    ' ' +                                    // 08: Type of control
    ' ' +                                    // 09: Character coding scheme (MARC-8)
    '2' +                                    // 10: Indicator count
    '2' +                                    // 11: Subfield code count
    String(baseAddress).padStart(5, '0') +  // 12-16: Base address of data
    ' ' +                                    // 17: Encoding level
    ' ' +                                    // 18: Descriptive cataloging form
    ' ' +                                    // 19: Multipart resource record level
    '4' +                                    // 20: Length of "length of field" portion
    '5' +                                    // 21: Length of "starting position" portion
    '0' +                                    // 22: Length of implementation-defined portion
    '0'                                      // 23: Undefined
  )
}

function build008Field(book: BookData): string {
  const now = new Date()
  const dateEntered = formatCompactDate(now)
  const pubYear = book.publishedDate?.slice(0, 4) || '    '
  const lang = book.language?.slice(0, 3) || 'eng'
  
  // Fixed-length data elements (40 characters)
  return (
    dateEntered +  // 00-05: Date entered
    's' +          // 06: Type of date
    pubYear +      // 07-10: Date 1
    '    ' +       // 11-14: Date 2
    '   ' +        // 15-17: Place of publication
    '    ' +       // 18-21: Illustrations
    ' ' +          // 22: Target audience
    ' ' +          // 23: Form of item
    '    ' +       // 24-27: Nature of contents
    ' ' +          // 28: Government publication
    ' ' +          // 29: Conference publication
    ' ' +          // 30: Festschrift
    ' ' +          // 31: Index
    ' ' +          // 32: Undefined
    ' ' +          // 33: Literary form
    ' ' +          // 34: Biography
    lang +         // 35-37: Language
    ' ' +          // 38: Modified record
    ' '            // 39: Cataloging source
  )
}

function formatMarcDate(date: Date): string {
  return date.toISOString().replace(/[-:T]/g, '').slice(0, 14) + '.0'
}

function formatCompactDate(date: Date): string {
  const y = String(date.getFullYear()).slice(2)
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return y + m + d
}

function normalizeAuthors(authors: string | string[] | undefined): string[] {
  if (!authors) return []
  if (Array.isArray(authors)) return authors
  return authors.split(',').map(a => a.trim()).filter(Boolean)
}

/**
 * Build multiple MARC21 records and combine them
 */
export function buildMarc21File(books: BookData[]): string {
  return books.map(buildMarc21Record).join('')
}
