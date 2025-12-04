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

  const loginWithGoogle = () => {
    // Navigate to our own redirect endpoint which handles provider validation
    navigateTo('/api/auth/google', {
      external: true
    })
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
