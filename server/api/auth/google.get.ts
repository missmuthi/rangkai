export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Ensure provider is configured
  if (!config.oauthGoogleClientId || !config.oauthGoogleClientSecret) {
    // Redirect to login with friendly error
    return sendRedirect(event, '/login?error=auth_not_configured')
  }
  // For GET requests we won't directly redirect to the POST-based sign-in endpoint.
  // Instead provide a helpful response so clients POST to the sign-in endpoint to get the redirect URL.
  return {
    ok: true,
    provider: 'google',
    message: 'Google OAuth available. POST to /api/auth/sign-in/social with { provider: "google" }'
  }
})
