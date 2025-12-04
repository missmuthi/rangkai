import { getServerSession } from '../utils/auth'

// Routes that don't require authentication
const publicRoutes = [
  '/api/auth',      // Auth endpoints
  '/api/health',    // Health check
  '/api/book',      // Public book lookup (cached)
  '/_nuxt',         // Nuxt assets
  '/__nuxt',        // Nuxt internals
]

// Pages that don't require authentication
const publicPages = [
  '/',
  '/login',
  '/register',
]

export default defineEventHandler(async (event) => {
  const path = event.path || getRequestURL(event).pathname

  // Skip during prerendering
  if (import.meta.prerender) return

  // Skip public routes
  if (publicRoutes.some(route => path.startsWith(route))) return

  // Skip public pages
  if (publicPages.includes(path)) return

  // Skip non-API routes (let client-side middleware handle page protection)
  if (!path.startsWith('/api/')) return

  // Get session for protected API routes
  const session = await getServerSession(event)

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Authentication required',
    })
  }

  // Attach session to event context for use in API handlers
  event.context.session = session
  event.context.user = session.user
})
