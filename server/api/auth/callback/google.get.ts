import { drizzle } from 'drizzle-orm/d1'
import * as schema from '../../../db/schema'
import { eq } from 'drizzle-orm'

import { createSession, generateState } from '../../../utils/session'
import { getSecureCookieOptions } from '../../../utils/secure-cookie'

// Type for Google User Info
type GoogleUser = {
    sub: string
    name: string
    given_name: string
    family_name: string
    picture: string
    email: string
    email_verified: boolean
    locale: string
}

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const url = getRequestURL(event)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const error = url.searchParams.get('error')

    // 1. Error Handling (from Google)
    if (error) {
        return sendRedirect(event, `/login?error=oauth_provider_error&details=${encodeURIComponent(error)}`)
    }

    if (!code || !state) {
        return sendRedirect(event, '/login?error=oauth_missing_params')
    }

    // 2. Validate State & Verifier
    const storedState = getCookie(event, 'google_oauth_state')
    const codeVerifier = getCookie(event, 'google_code_verifier')

    if (!storedState || !codeVerifier || state !== storedState) {
        return sendRedirect(event, '/login?error=oauth_state_mismatch')
    }

    // 3. Exchange Code for Tokens
    const callbackUrl = `${config.public.siteUrl}/api/auth/callback/google`

    try {
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: config.oauthGoogleClientId,
                client_secret: config.oauthGoogleClientSecret,
                code,
                grant_type: 'authorization_code',
                redirect_uri: callbackUrl,
                code_verifier: codeVerifier
            })
        })

        if (!tokenResponse.ok) {
            const errText = await tokenResponse.text() // log this server-side
            console.error('Google Token Exchange Failed:', errText)
            return sendRedirect(event, '/login?error=oauth_token_exchange_failed')
        }

        const { access_token } = await tokenResponse.json() as { access_token: string }

        // 4. Fetch User Info
        const userResult = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` }
        })

        if (!userResult.ok) {
            console.error('Google User Info Failed')
            return sendRedirect(event, '/login?error=oauth_user_info_failed')
        }

        const googleUser = await userResult.json() as GoogleUser

        // 5. DB Operations
        const db = drizzle(hubDatabase(), { schema })

        // Check if user exists
        let user = await db.select().from(schema.user).where(eq(schema.user.email, googleUser.email)).get()

        if (!user) {
            // Create new user (Manual UUID generation if DB doesn't handle it, better-auth schema usually uses text id)
            // We'll trust our uuidv4 helper
            // Wait, schema says `id: text('id').primaryKey()`
            const newUserId = generateState() // UUID
            const now = new Date()

            const newUser = {
                id: newUserId,
                name: googleUser.name,
                email: googleUser.email,
                emailVerified: googleUser.email_verified,
                image: googleUser.picture,
                createdAt: now,
                updatedAt: now
            }

            await db.insert(schema.user).values(newUser)
            user = newUser
        } else {
            // Update user avatar/name? Optional.
        }

        // 6. Create Session
        const userAgent = getRequestHeader(event, 'user-agent')
        const ip = getRequestHeader(event, 'x-forwarded-for')
        const session = await createSession(db, user.id, userAgent, ip)

        // 7. Set Session Cookie with secure defaults
        setCookie(event, 'session', session.token, getSecureCookieOptions())

        // 8. Cleanup Temp Cookies
        deleteCookie(event, 'google_oauth_state')
        deleteCookie(event, 'google_code_verifier')

        return sendRedirect(event, '/?loginSuccess=1')

    } catch (e: unknown) {
        console.error('OAuth Callback Critical Error:', e)
        return sendRedirect(event, '/login?error=oauth_callback_error')
    }
})
