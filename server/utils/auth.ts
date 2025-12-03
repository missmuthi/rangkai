import type { H3Event } from 'h3'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { users, sessions } from '../db/schema'

let _auth: ReturnType<typeof betterAuth> | null = null

export function getAuth() {
  if (_auth) return _auth

  const config = useRuntimeConfig()

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
    socialProviders: {
      google: {
        clientId: config.oauthGoogleClientId || '',
        clientSecret: config.oauthGoogleClientSecret || '',
        redirectURI: config.public.siteUrl
          ? `${config.public.siteUrl}/api/auth/callback/google`
          : 'http://localhost:3000/api/auth/callback/google'
      }
    },
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
