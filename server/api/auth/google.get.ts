export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Ensure provider is configured
  if (!config.oauthGoogleClientId || !config.oauthGoogleClientSecret) {
    return sendRedirect(event, '/login?error=auth_not_configured')
  }

  // Simply redirect to Better Auth's built-in OAuth handler
  // Better Auth handles the /api/auth/* routes via the [...all].ts catch-all
  const callbackUrl = `${config.public.siteUrl}/api/auth/callback/google`
  
  // Construct Google OAuth URL manually
  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  googleAuthUrl.searchParams.set('client_id', config.oauthGoogleClientId)
  googleAuthUrl.searchParams.set('redirect_uri', callbackUrl)
  googleAuthUrl.searchParams.set('response_type', 'code')
  googleAuthUrl.searchParams.set('scope', 'openid email profile')
  googleAuthUrl.searchParams.set('access_type', 'offline')
  googleAuthUrl.searchParams.set('prompt', 'consent')
  
  return sendRedirect(event, googleAuthUrl.toString())
})
