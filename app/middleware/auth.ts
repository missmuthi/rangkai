export default defineNuxtRouteMiddleware(async (to) => {
  // E2E Test Bypass: Skip auth check if e2e-test-bypass cookie is present
  // This allows Playwright tests to access protected pages
  if (import.meta.client) {
    const cookies = document.cookie
    if (cookies.includes('e2e-test-bypass=true')) {
      console.log('[auth middleware] E2E test bypass active')
      return
    }
  }

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
