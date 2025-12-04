export default defineEventHandler(async (event) => {
  const auth = getAuth()
  const query = getQuery(event) || {}
  const provider = query?.provider as string
  const config = useRuntimeConfig()

  if (!provider) {
    return sendRedirect(event, '/login?error=auth_failed')
  }

  // If social provider is not configured, redirect to login with a helpful message
  if (provider === 'google' && (!config.oauthGoogleClientId || !config.oauthGoogleClientSecret)) {
    return sendRedirect(event, '/login?error=auth_not_configured')
  }

  try {
    const request = toWebRequest(event)
    const response = await auth.handler(request)
    
    // If response is a redirect, follow it
    if (response.status === 302 || response.status === 301) {
      const location = response.headers.get('location')
      if (location) {
        return sendRedirect(event, location)
      }
    }

    // Otherwise return the response
    return response
  } catch (err: unknown) {
    const message = (err as { message?: string })?.message || String(err)
    console.warn('[auth] signInSocial GET failed:', message)
    return sendRedirect(event, '/login?error=auth_failed')
  }
})
