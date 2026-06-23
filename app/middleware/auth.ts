export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, isLoading, fetchSession } = useAuth()

  // Wait for auth to load if still loading
  if (isLoading.value) {
    await fetchSession()
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated.value) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`, { 
      replace: true,
    })
  }
})
