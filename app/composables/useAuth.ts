export interface User {
  id: string
  email: string
  name: string | null
}

export const useAuth = () => {
  const user = useState<User | null>('auth:user', () => null)
  const loading = useState<boolean>('auth:loading', () => false)

  const fetchUser = async () => {
    loading.value = true
    try {
      const data = await $fetch<{ user: User | null }>('/api/auth-session')
      user.value = data.user
    } catch {
      user.value = null
    } finally {
      loading.value = false
    }
  }

  const loginWithGoogle = async () => {
    loading.value = true
    try {
      // POST to the social sign-in endpoint which will return a redirect URL
      const data = await $fetch<{ url?: string; redirect?: boolean }>(
        '/api/auth/sign-in/social',
        { method: 'POST', body: { provider: 'google' } }
      )

      // If endpoint returns a `url`, navigate there
      const url = data?.url ? data.url : null
      if (url) {
        // Use full navigation to external provider page
        window.location.href = url
      } else if (data?.redirect) {
        // fallback in case sign-in handler indicates redirect flow
        window.location.href = '/login'
      } else {
        // No redirect returned, fallback to our server's helper endpoint
        navigateTo('/api/auth/google', { external: true })
      }
    } catch (err) {
      console.error('Login failed:', err)
      // fallback redirect to login with error
      await navigateTo('/login?error=auth_failed')
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true
    try {
      await $fetch('/api/auth/sign-out', { method: 'POST' })
      user.value = null
      await navigateTo('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      loading.value = false
    }
  }

  return {
    user: computed(() => user.value),
    loading: computed(() => loading.value),
    isAuthenticated: computed(() => !!user.value),
    fetchUser,
    loginWithGoogle,
    logout
  }
}
