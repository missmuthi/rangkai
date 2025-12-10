/**
 * Experimental Perpusnas API Endpoint
 * 
 * GET /api/experimental/perpusnas/{isbn}
 * 
 * Tests Perpusnas OAI-PMH integration without affecting production.
 * Returns raw timing data and source information for analysis.
 * 
 * NOTE: This endpoint does NOT save to database.
 */
import { fetchPerpusnas, testPerpusnasConnection } from '../../../utils/metadata/perpusnas'

export default defineEventHandler(async (event) => {
  const isbn = getRouterParam(event, 'isbn')

  // Handle special "test" action to check connectivity
  if (isbn === 'test') {
    const result = await testPerpusnasConnection()
    return {
      action: 'connectivity_test',
      ...result,
      errors: result.errors,
      endpointsTested: result.endpointsTested,
      timestamp: new Date().toISOString()
    }
  }

  // Validate ISBN format
  const cleanIsbn = isbn?.replace(/[^0-9X]/gi, '')
  if (!cleanIsbn || cleanIsbn.length < 10) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid ISBN format',
      data: {
        provided: isbn,
        cleaned: cleanIsbn,
        hint: 'ISBN must be 10 or 13 digits (e.g., 978-602-XXXXXXX)'
      }
    })
  }

  // Fetch from Perpusnas
  const startTime = Date.now()
  const result = await fetchPerpusnas(cleanIsbn)
  const totalTime = Date.now() - startTime

  // Build response with full debugging info
  return {
    // Request info
    request: {
      isbn: cleanIsbn,
      originalInput: isbn,
      timestamp: new Date().toISOString()
    },

    // Result status
    found: result.data !== null,
    
    // Parsed book metadata (if found)
    book: result.data,

    // Raw Perpusnas record (for debugging)
    raw: result.raw,

    // Performance metrics
    timing: {
      total: totalTime,
      endpoint: result.timing.endpoint,
      fetchDuration: result.timing.durationMs
    },

    // Error info (if any)
    error: result.error || null,

    // Metadata for comparison
    meta: {
      source: 'perpusnas',
      protocol: 'OAI-PMH',
      format: 'MARCXML',
      experimental: true,
      note: 'This endpoint is for testing only - data is not saved to database'
    }
  }
})
