export default defineEventHandler(async (event) => {
  const publicPaths = [
    '/api/health',
    '/api/auth/',
    '/api/auth-session',
    '/login',
    '/_nuxt',
    '/__nuxt',
    '/favicon.ico'
  ]

  const path = event.path || getRequestURL(event).pathname

  // Skip auth check for public paths
  const isPublic = publicPaths.some(publicPath => path.startsWith(publicPath))

  if (isPublic) {
    return
  }

  // Get user from session
  const user = await getUserFromEvent(event)

  // Store user in event context for API routes
  event.context.user = user

  // Protect API routes (except public ones)
  if (path.startsWith('/api/') && !user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }
})
