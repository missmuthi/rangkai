import type { H3Event } from 'h3'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { users, sessions } from '../db/schema'

let _auth: ReturnType<typeof betterAuth> | null = null

export function getAuth() {
  if (_auth) return _auth

  const config = useRuntimeConfig()
  // Build social providers only if credentials are present
  const socialProviders: any = {}
  if (config.oauthGoogleClientId && config.oauthGoogleClientSecret) {
    socialProviders.google = {
      clientId: config.oauthGoogleClientId || '',
      clientSecret: config.oauthGoogleClientSecret || '',
      redirectURI: config.public.siteUrl
        ? `${config.public.siteUrl}/api/auth/callback/google`
        : 'http://localhost:3000/api/auth/callback/google'
    }
  } else {
    // Helpful dev-time logging for missing provider creds
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[auth] Google OAuth credentials not provided. Google sign-in will be disabled.')
    }
  }
  // If OAuth creds are provided, ensure a base site URL is set so redirects use a proper URL
  if ((config.oauthGoogleClientId || config.oauthGoogleClientSecret) && !config.public.siteUrl && process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn('[auth] oauth credentials found but `public.siteUrl` is not set; callbacks may redirect to http://localhost:3000')
  }

  _auth = betterAuth({
    database: drizzleAdapter(hubDatabase(), {
      provider: 'sqlite',
      schema: {
        user: users,
        session: sessions
      }
    }),
    emailAndPassword: {
      enabled: false
    },
    socialProviders,
    secret: config.authSecret || 'dev-secret-change-in-production',
    baseURL: config.public.siteUrl || 'http://localhost:3000'
  })

  return _auth
}

export type AuthUser = {
  id: string
  email: string
  name: string | null
}

export async function getUserFromEvent(event: H3Event): Promise<AuthUser | null> {
  try {
    const auth = getAuth()
    const session = await auth.api.getSession({ headers: event.headers })

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
