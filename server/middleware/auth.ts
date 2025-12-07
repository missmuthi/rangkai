import type { InferSelectModel } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { hubDatabase } from '#imports'
import * as schema from '../db/schema'
import { getSession } from '../utils/session'
import { isRateLimited } from '../utils/rate-limit'

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const path = url.pathname

  // 1. Asset Bypass - Critical for performance and preventing bugs
  if (
    path.startsWith('/_nuxt/') ||
    path.startsWith('/public/') || // served by cf pages usually, but just in case
    path.startsWith('/api/_content/') ||
    path === '/favicon.ico' ||
    path.includes('.') // naive static file check (images, etc)
  ) {
    return
  }

  // 2. Initialize DB
  const db = drizzle(hubDatabase(), { schema })

  // 3. Check Session Cookie
  const token = getCookie(event, 'session')

  if (token) {
    const sessionResult = await getSession(db, token)

    if (sessionResult) {
      // Valid session
      event.context.session = sessionResult.session
      event.context.user = sessionResult.user
    } else {
      // Invalid or expired token - clear it to avoid confusion
      deleteCookie(event, 'session', {
        path: '/',
        secure: process.env.NODE_ENV === 'production' || event.context.isProduction,
        // Note: isProduction depends on wrangler env var we added
      })
    }
  }

  // 4. Rate Limit (Optional) - Apply only to auth endpoints for now
  if (path.startsWith('/api/auth/')) {
    const ip = getRequestHeader(event, 'x-forwarded-for') || '127.0.0.1'
    if (!event.context.session && isRateLimited(ip)) {
      throw createError({
        statusCode: 429,
        message: 'Too many requests'
      })
    }
  }
})

// Type augmentation for event.context
declare module 'h3' {
  interface H3EventContext {
    user?: InferSelectModel<typeof schema.user>
    session?: InferSelectModel<typeof schema.session>
    isProduction?: boolean // populated by platform logic usually, or we can assume via env
  }
}
