/**
 * Perpusnas OAI-PMH Adapter
 * 
 * Fetches Indonesian book metadata from Perpustakaan Nasional RI
 * using the OAI-PMH protocol with MARCXML format.
 * 
 * @see https://inlislite.perpusnas.go.id/?read=oaipmhservice
 */
import { XMLParser } from 'fast-xml-parser'
import type { BookMetadata } from './types'
import { createEmptyMetadata } from './types'

// ============================================================================
// CONFIGURATION
// ============================================================================

const PERPUSNAS_ENDPOINTS = {
  // Primary: HTTPS endpoint (Cloudflare may block plain HTTP on some deployments)
  primary: 'https://inlislitev3.perpusnas.go.id/opac/oai',
  // Fallbacks if primary is down
  fallbacks: [
    'http://demo.inlislitev3.perpusnas.go.id/opac/oai', // HTTP demo
    'http://203.176.180.116:8123/opac/oai', // Legacy endpoint
  ]
}

// Request timeout (Cloudflare Workers limit is 30s, but don't wait that long)
const TIMEOUT_MS = 8000

// XML Parser configuration
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseTagValue: false,
  parseAttributeValue: false,
})

// ============================================================================
// TYPES
// ============================================================================

export interface PerpusnasRawRecord {
  id: string
  title: string
  author: string
  publisher: string
  isbn: string
  year: string
  language: string
  publishPlace?: string
  collation?: string
  subjects?: string[]
}

export interface PerpusnasResult {
  data: BookMetadata | null
  raw: PerpusnasRawRecord | null
  timing: {
    endpoint: string
    durationMs: number
  }
  error?: string
}

// ============================================================================
// MARCXML PARSER
// ============================================================================

/**
 * Parse MARCXML record into our internal format
 * 
 * MARC21 Field Reference:
 * - 020: ISBN
 * - 100: Primary author
 * - 245: Title
 * - 260: Publication info (place, publisher, date)
 * - 300: Physical description (collation)
 * - 650: Subject headings
 * - 700: Additional authors
 */
function parseMarcXML(marcRecord: any): PerpusnasRawRecord | null {
  try {
    const record = marcRecord?.record || marcRecord
    if (!record) return null

    const datafields = record.datafield || []
    const controlfields = record.controlfield || []

    let title = ''
    let subtitle = ''
    let author = ''
    const additionalAuthors: string[] = []
    let publisher = ''
    let year = ''
    let isbn = ''
    let language = 'id'
    let publishPlace = ''
    let collation = ''
    const subjects: string[] = []

    // Helper to get subfield value
    const getSubfield = (field: any, code: string): string => {
      const subfields = field.subfield || []
      const arr = Array.isArray(subfields) ? subfields : [subfields]
      const sub = arr.find((s: any) => s['@_code'] === code)
      return sub?.['#text'] || ''
    }

    // Parse control fields (008 has language and year)
    for (const cf of Array.isArray(controlfields) ? controlfields : [controlfields]) {
      if (cf['@_tag'] === '008') {
        const text = cf['#text'] || ''
        if (text.length >= 38) {
          // Positions 7-10: Year of publication
          const extractedYear = text.substring(7, 11)
          if (/^\d{4}$/.test(extractedYear)) {
            year = extractedYear
          }
          // Positions 35-37: Language code
          const extractedLang = text.substring(35, 38).trim()
          if (extractedLang && extractedLang !== '   ') {
            language = extractedLang
          }
        }
      }
    }

    // Parse data fields
    for (const field of Array.isArray(datafields) ? datafields : [datafields]) {
      const tag = field['@_tag']

      switch (tag) {
        case '020': // ISBN
          const isbnRaw = getSubfield(field, 'a')
          // Clean ISBN: remove hyphens, spaces, and qualifiers like "(pbk.)"
          isbn = isbnRaw.replace(/[^0-9X]/gi, '').substring(0, 13)
          break

        case '100': // Primary author
          author = getSubfield(field, 'a').replace(/[,;.]$/, '').trim()
          break

        case '245': // Title
          title = getSubfield(field, 'a').replace(/[/:;]$/, '').trim()
          subtitle = getSubfield(field, 'b').replace(/[/:;]$/, '').trim()
          break

        case '260': // Publication info (older standard, still common)
        case '264': // Publication info (RDA standard)
          publishPlace = publishPlace || getSubfield(field, 'a').replace(/[,;:]$/, '').trim()
          publisher = publisher || getSubfield(field, 'b').replace(/[,;:]$/, '').trim()
          const yearField = getSubfield(field, 'c')
          const yearMatch = yearField.match(/\d{4}/)
          if (yearMatch && !year) {
            year = yearMatch[0]
          }
          break

        case '300': // Physical description (collation)
          const extent = getSubfield(field, 'a')
          const dimensions = getSubfield(field, 'c')
          collation = [extent, dimensions].filter(Boolean).join(' ; ').trim()
          break

        case '650': // Subject headings (Library of Congress)
        case '651': // Geographic subject
        case '653': // Uncontrolled keywords
          const subject = getSubfield(field, 'a').replace(/[.]$/, '').trim()
          if (subject && !subjects.includes(subject)) {
            subjects.push(subject)
          }
          break

        case '700': // Additional authors
          const addAuthor = getSubfield(field, 'a').replace(/[,;.]$/, '').trim()
          if (addAuthor && addAuthor !== author) {
            additionalAuthors.push(addAuthor)
          }
          break
      }
    }

    // Combine title and subtitle
    const fullTitle = subtitle ? `${title}: ${subtitle}` : title

    // Combine all authors
    const allAuthors = author ? [author, ...additionalAuthors] : additionalAuthors

    return {
      id: '',
      title: fullTitle,
      author: allAuthors.join('; '),
      publisher,
      isbn,
      year,
      language,
      publishPlace,
      collation,
      subjects
    }
  } catch (error) {
    console.error('[Perpusnas] MARCXML parsing error:', error)
    return null
  }
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Fetch book by ISBN from Perpusnas
 * 
 * Note: OAI-PMH doesn't support direct ISBN lookup, so we fetch records
 * and filter client-side. This is not ideal for performance but works
 * for the experimental phase.
 */
export async function fetchPerpusnas(isbn: string): Promise<PerpusnasResult> {
  const startTime = Date.now()
  const normalizedIsbn = isbn.replace(/[^0-9X]/gi, '')
  let lastError: string | null = null

  // Try each endpoint until one works
  for (const endpoint of [PERPUSNAS_ENDPOINTS.primary, ...PERPUSNAS_ENDPOINTS.fallbacks]) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

      // OAI-PMH ListRecords request
      // Note: We're fetching multiple records and filtering - not efficient but OAI-PMH limitation
      const params = new URLSearchParams({
        verb: 'ListRecords',
        metadataPrefix: 'marcxml',
      })

      const response = await fetch(`${endpoint}?${params.toString()}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/xml, text/xml',
          'User-Agent': 'Rangkai/2.0 (Indonesian Library Cataloging Tool)'
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const xmlText = await response.text()
      const parsed = xmlParser.parse(xmlText) as any
      const oaipmh = parsed['OAI-PMH'] || parsed['oai_dc:dc'] || {}

      // Check for OAI-PMH protocol errors
      if (oaipmh.error) {
        const errCode = oaipmh.error['@_code'] || 'unknown'
        const errMsg = oaipmh.error['#text'] || 'Unknown OAI-PMH error'
        throw new Error(`OAI-PMH Error [${errCode}]: ${errMsg}`)
      }

      // Extract records
      const listRecords = oaipmh.ListRecords || {}
      const records = listRecords.record || []
      const recordArray = Array.isArray(records) ? records : [records]

      // Parse and find matching ISBN
      for (const record of recordArray) {
        const metadata = record.metadata || {}
        // MARCXML might be nested under different keys
        const marcRecord = metadata['marc:record'] || metadata.record || metadata

        const parsedRecord = parseMarcXML(marcRecord)
        if (!parsedRecord) continue

        // Set the OAI identifier
        parsedRecord.id = record.header?.identifier || ''

        // Check if ISBN matches
        if (parsedRecord.isbn === normalizedIsbn || 
            parsedRecord.isbn === normalizedIsbn.substring(3)) { // Try without 978/979 prefix
          
          // Convert to BookMetadata format
          const bookMetadata = convertToBookMetadata(parsedRecord)

          return {
            data: bookMetadata,
            raw: parsedRecord,
            timing: {
              endpoint,
              durationMs: Date.now() - startTime
            }
          }
        }
      }

      // No matching ISBN found in this batch
      // Note: In production, we'd need to handle pagination (resumptionToken)
      return {
        data: null,
        raw: null,
        timing: {
          endpoint,
          durationMs: Date.now() - startTime
        },
        error: `ISBN ${normalizedIsbn} not found in Perpusnas records`
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      lastError = errorMessage
      
      // If it's an abort, it's a timeout
      if (errorMessage.includes('abort')) {
        console.warn(`[Perpusnas] Timeout on ${endpoint} after ${TIMEOUT_MS}ms`)
        continue // Try next endpoint
      }

      console.error(`[Perpusnas] Error on ${endpoint}:`, errorMessage)
      continue // Try next endpoint
    }
  }

  // All endpoints failed
  return {
    data: null,
    raw: null,
    timing: {
      endpoint: 'all_failed',
      durationMs: Date.now() - startTime
    },
    error: `All Perpusnas endpoints failed or timed out${lastError ? ` (last error: ${lastError})` : ''}`
  }
}

/**
 * Convert PerpusnasRawRecord to BookMetadata format
 */
function convertToBookMetadata(raw: PerpusnasRawRecord): BookMetadata {
  const metadata = createEmptyMetadata(raw.isbn, 'perpusnas')

  metadata.title = raw.title || null
  metadata.authors = raw.author ? raw.author.split(';').map(a => a.trim()).filter(Boolean) : []
  metadata.publisher = raw.publisher || null
  metadata.publishedDate = raw.year || null
  metadata.language = raw.language || 'id'
  metadata.publishPlace = raw.publishPlace || null
  metadata.collation = raw.collation || null
  metadata.subjects = raw.subjects?.join('; ') || null

  return metadata
}

/**
 * Test if Perpusnas endpoint is reachable
 */
export async function testPerpusnasConnection(): Promise<{
  available: boolean
  endpoint: string
  responseTime: number
  errors?: string[]
  error?: string
}> {
  const startTime = Date.now()
  const errors: string[] = []

  for (const endpoint of [PERPUSNAS_ENDPOINTS.primary, ...PERPUSNAS_ENDPOINTS.fallbacks]) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const params = new URLSearchParams({
        verb: 'Identify'
      })

      const response = await fetch(`${endpoint}?${params.toString()}`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/xml, text/xml' }
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        return {
          available: true,
          endpoint,
          responseTime: Date.now() - startTime
        }
      }
      errors.push(`HTTP ${response.status} from ${endpoint}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      errors.push(`${endpoint} -> ${message}`)
      continue
    }
  }

  return {
    available: false,
    endpoint: 'none',
    responseTime: Date.now() - startTime,
    errors,
    error: errors[errors.length - 1] || 'All endpoints unreachable'
  }
}
