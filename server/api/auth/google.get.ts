export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Ensure provider is configured
  if (!config.oauthGoogleClientId || !config.oauthGoogleClientSecret) {
    // Redirect to login with friendly error
    return sendRedirect(event, '/login?error=auth_not_configured')
  }
    const auth = getAuth()
    try {
      // Try to generate a redirect URL using the auth API
      const result = await auth.api.signInSocial({ provider: 'google' })
      if (result?.url) return sendRedirect(event, result.url)
      // Fallback to letting the client POST and handle the returned info
      return {
        ok: true,
        provider: 'google',
        message: 'Google OAuth available. POST to /api/auth/sign-in/social with { provider: "google" }'
      }
    } catch (err) {
      console.warn('google.get signInSocial call failed', (err as any)?.message || err)
      return sendRedirect(event, '/login?error=auth_failed')
    }
  })
