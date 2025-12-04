export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, fetchUser } = useAuth()

  // Ensure we have a session loaded, so the auth check is accurate
  await fetchUser()

  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }

  // Allow access to login page even when authenticated? Keep current behavior default
})
