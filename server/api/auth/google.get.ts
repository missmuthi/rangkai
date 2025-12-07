import { generateState, generateCodeVerifier, generateCodeChallenge } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  if (!config.oauthGoogleClientId || !config.oauthGoogleClientSecret) {
    console.error('Missing Google OAuth credentials')
    return sendRedirect(event, '/login?error=auth_not_configured')
  }

  // 1. Generate State & PKCE
  const state = generateState()
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = generateCodeChallenge(codeVerifier)

  // 2. Set Cookies (Short-lived)
  const isSecure = process.env.NODE_ENV === 'production' || process.env.ENVIRONMENT === 'production'
  const cookieOpts = {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax' as const,
    maxAge: 60 * 10, // 10 minutes
    path: '/'
  }

  setCookie(event, 'google_oauth_state', state, cookieOpts)
  setCookie(event, 'google_code_verifier', codeVerifier, cookieOpts)

  // 3. Build Auth URL
  const callbackUrl = `${config.public.siteUrl}/api/auth/callback/google`

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  googleAuthUrl.searchParams.set('client_id', config.oauthGoogleClientId)
  googleAuthUrl.searchParams.set('redirect_uri', callbackUrl)
  googleAuthUrl.searchParams.set('response_type', 'code')
  googleAuthUrl.searchParams.set('scope', 'openid email profile')
  googleAuthUrl.searchParams.set('access_type', 'offline')
  googleAuthUrl.searchParams.set('prompt', 'consent')
  googleAuthUrl.searchParams.set('state', state)
  googleAuthUrl.searchParams.set('code_challenge', codeChallenge)
  googleAuthUrl.searchParams.set('code_challenge_method', 'S256')

  return sendRedirect(event, googleAuthUrl.toString())
})
