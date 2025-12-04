export default defineEventHandler(async (event) => {
  // If the provider returned an error param, short-circuit back to the login
  const url = new URL(event.node.req.url || '', getRequestURL(event))
  const error = url.searchParams.get('error')

  if (error) {
    // Return back to the login page with a helpful query param
    return sendRedirect(event, '/login?error=auth_failed')
  }

  // Let Better Auth catch-all handler process the callback and then redirect to the app
  // The catch-all handler is already mounted at /api/auth
  try {
    return sendRedirect(event, '/api/auth/callback/google')
  } catch (err) {
    // If redirect fails for any reason, fallback to login with an error
     
    console.warn('auth callback redirect failed', err)
    return sendRedirect(event, '/login?error=auth_failed')
  }
})
