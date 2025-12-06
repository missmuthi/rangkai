import type { H3Event } from 'h3'
import { hubDatabase } from '#imports'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { drizzle } from 'drizzle-orm/d1'
import * as schema from '../db/schema'

let _auth: ReturnType<typeof betterAuth> | null = null

export function getAuth() {
  if (_auth) return _auth

  const db = hubDatabase()
  const drizzleDb = drizzle(db, { schema })
  const config = useRuntimeConfig()

  // Build social providers only if credentials are present
  const socialProviders: Record<string, { clientId: string, clientSecret: string }> = {}
  if (config.oauthGoogleClientId && config.oauthGoogleClientSecret) {
    socialProviders.google = {
      clientId: config.oauthGoogleClientId || '',
      clientSecret: config.oauthGoogleClientSecret || '',
    }
  } else {
    // Helpful dev-time logging for missing provider creds
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[auth] Google OAuth credentials not provided. Google sign-in will be disabled.')
    }
  }
  // If OAuth creds are provided, ensure a base site URL is set so redirects use a proper URL
  if ((config.oauthGoogleClientId || config.oauthGoogleClientSecret) && !config.public.siteUrl && process.env.NODE_ENV !== 'production') {
    console.warn('[auth] oauth credentials found but `public.siteUrl` is not set; callbacks may redirect to http://localhost:3000')
  }

  // Log configured social providers concisely for debugging
  const configuredProviders = Object.keys(socialProviders)
  if (configuredProviders.length === 0) {
    if (process.env.NODE_ENV !== 'production') {
      console.info('[auth] No social providers configured (Google disabled).')
    }
  } else {
    console.info('[auth] Configured social providers:', configuredProviders.join(', '))
  }

  _auth = betterAuth({
    database: drizzleAdapter(drizzleDb, {
      provider: 'sqlite',
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      }
    }),
    secret: config.authSecret || 'dev-secret-change-in-production',
    baseURL: config.public.siteUrl || 'http://localhost:3000',
    trustedOrigins: [config.public.siteUrl || 'http://localhost:3000'],
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
    socialProviders,
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // Update session every 24 hours
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5, // 5 minutes
      },
    },
    advanced: {
      cookiePrefix: 'rangkai',
      useSecureCookies: process.env.NODE_ENV === 'production',
    },
  })

  return _auth
}

export type AuthUser = {
  id: string
  email: string
  name: string | null
}

// Helper to get session from event
export async function getServerSession(event: H3Event) {
  const auth = getAuth()
  const session = await auth.api.getSession({
    headers: event.headers,
  })
  return session
}

export async function getUserFromEvent(event: H3Event): Promise<AuthUser | null> {
  try {
    const session = await getServerSession(event)

    if (!session?.user) {
      return null
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name || null
    }
  } catch {
    return null
  }
}

export async function requireAuth(event: H3Event): Promise<AuthUser> {
  const user = await getUserFromEvent(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  return user
}

export async function signOutFromEvent(event: H3Event) {
  const auth = getAuth()
  return auth.api.signOut({ headers: event.headers })
}
