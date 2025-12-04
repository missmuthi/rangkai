export default defineEventHandler(async (event) => {
  const provider = getQuery(event).provider
  const config = useRuntimeConfig()

  if (!provider) {
    return sendRedirect(event, '/login?error=auth_failed')
  }

  // If social provider is not configured, redirect to login with a helpful message
  if (provider === 'google' && (!config.oauthGoogleClientId || !config.oauthGoogleClientSecret)) {
    return sendRedirect(event, '/login?error=auth_not_configured')
  }

  // The sign-in endpoint is POST-only; for GET requests redirect to the login page
  return sendRedirect(event, '/login?error=auth_method_not_allowed')
})
