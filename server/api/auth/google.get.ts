export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Ensure provider is configured
  if (!config.oauthGoogleClientId || !config.oauthGoogleClientSecret) {
    // Redirect to login with friendly error
    return sendRedirect(event, '/login?error=auth_not_configured')
  }

  // Redirect to Better Auth social sign-in endpoint
  return sendRedirect(event, '/api/auth/sign-in/social?provider=google')
})
