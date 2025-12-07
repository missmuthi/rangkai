export interface User {
  id: string
  email: string
  name: string | null
}

interface Session {
  token: string
  expiresAt: Date
  userId: string
}

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
}

export const useAuth = () => {
  const state = useState<AuthState>('auth', () => ({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  }))

  const config = useRuntimeConfig()
  const baseURL = config.public.siteUrl

  // Fetch current session
  async function fetchSession() {
    state.value.isLoading = true
    try {
      const response = await $fetch<{ session: Session; user: User } | null>(
        '/api/auth/get-session',
        {
          credentials: 'include',
        }
      )

      if (response?.session && response?.user) {
        state.value.session = response.session
        state.value.user = response.user
        state.value.isAuthenticated = true
      } else {
        state.value.session = null
        state.value.user = null
        state.value.isAuthenticated = false
      }
    } catch (error) {
      console.error('Failed to fetch session:', error)
      state.value.session = null
      state.value.user = null
      state.value.isAuthenticated = false
    } finally {
      state.value.isLoading = false
    }
  }

  // Legacy compatibility method
  const fetchUser = fetchSession

  // Email/Password Sign Up
  async function signUp(email: string, password: string, name: string) {
    const response = await $fetch('/api/auth/sign-up/email', {
      method: 'POST',
      body: { email, password, name },
      credentials: 'include',
    })
    await fetchSession()
    return response
  }

  // Email/Password Sign In
  async function signIn(email: string, password: string) {
    const response = await $fetch('/api/auth/sign-in/email', {
      method: 'POST',
      body: { email, password },
      credentials: 'include',
    })
    await fetchSession()
    return response
  }

  // OAuth Sign In (Google, GitHub, etc.)
  function signInWithOAuth(provider: 'google' | 'github') {
    // Better Auth uses /api/auth/sign-in/social for OAuth
    // We strictly use window.location.href for the redirect to the provider
    const params = new URLSearchParams({
      provider,
      callbackURL: baseURL + '/scan/mobile',
    })

    window.location.href = `/api/auth/sign-in/social?${params.toString()}`
  }

  // Legacy Google login method
  const loginWithGoogle = async () => {
    signInWithOAuth('google')
  }

  // Sign Out
  async function signOut() {
    state.value.isLoading = true
    try {
      await $fetch('/api/auth/sign-out', {
        method: 'POST',
        credentials: 'include',
      })
      state.value.session = null
      state.value.user = null
      state.value.isAuthenticated = false
      await navigateTo('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      state.value.isLoading = false
    }
  }

  // Legacy logout method
  const logout = signOut

  return {
    user: computed(() => state.value.user),
    session: computed(() => state.value.session),
    loading: computed(() => state.value.isLoading),
    isLoading: computed(() => state.value.isLoading),
    isAuthenticated: computed(() => state.value.isAuthenticated),
    fetchSession,
    fetchUser, // Legacy compatibility
    signUp,
    signIn,
    signInWithOAuth,
    loginWithGoogle, // Legacy compatibility
    signOut,
    logout, // Legacy compatibility
  }
}
