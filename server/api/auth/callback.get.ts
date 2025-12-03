export default defineEventHandler(async (event) => {
  // Let Better Auth catch-all handler process the callback and then redirect to the app
  // The catch-all handler is already mounted at /api/auth
  return sendRedirect(event, '/api/auth/callback/google')
})
