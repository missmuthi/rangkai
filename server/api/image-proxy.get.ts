export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const url = query.url as string

  if (!url) {
    throw createError({ statusCode: 400, message: 'Missing url parameter' })
  }

  // Whitelist allowed domains
  const allowedDomains = [
    'books.google.com',
    'covers.openlibrary.org',
    'www.loc.gov'
  ]

  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    throw createError({ statusCode: 400, message: 'Invalid URL' })
  }

  if (!allowedDomains.some(d => parsedUrl.hostname.endsWith(d))) {
    throw createError({ statusCode: 403, message: 'Domain not allowed' })
  }

  // Fetch and proxy the image
  const response = await fetch(url)
  if (!response.ok) {
    throw createError({ statusCode: response.status, message: 'Failed to fetch image' })
  }

  const contentType = response.headers.get('content-type') || 'image/jpeg'
  const buffer = await response.arrayBuffer()

  setHeader(event, 'Content-Type', contentType)
  setHeader(event, 'Cache-Control', 'public, max-age=86400')

  return new Uint8Array(buffer)
})
