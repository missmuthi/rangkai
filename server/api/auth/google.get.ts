export default defineEventHandler(async (event) => {
  // Redirect to Better Auth social sign-in endpoint
  return sendRedirect(event, '/api/auth/sign-in/social?provider=google')
})
