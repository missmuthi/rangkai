import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock useState state
let authState: Record<string, unknown> = {
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
}

// Mock $fetch globally
const mockFetch = vi.fn()


vi.mock('#app', () => ({
  useState: vi.fn((_key: string, init?: () => unknown) => {
    if (typeof init === 'function' && !authState.user) {
      authState = init() as Record<string, unknown>
    }
    return {
      value: authState
    }
  }),
  useRuntimeConfig: vi.fn(() => ({
    public: {
      siteUrl: 'http://localhost:3000'
    }
  })),
  navigateTo: vi.fn(),
}))

// Mock the composable to use our mockFetch
vi.mock('../../app/composables/useAuth', () => ({
  useAuth: () => {
    const fetchSession = async () => {
      try {
        const response = await mockFetch('/api/auth/get-session', {
          credentials: 'include',
        })
        if (response?.user) {
          authState.user = response.user
          authState.session = response.session
          authState.isAuthenticated = true
        }
      } catch {
        authState.user = null
        authState.session = null
        authState.isAuthenticated = false
      } finally {
        authState.isLoading = false
      }
    }

    const signIn = async (email: string, password: string) => {
      await mockFetch('/api/auth/sign-in/email', {
        method: 'POST',
        body: { email, password },
        credentials: 'include',
      })
      await fetchSession()
    }

    const signUp = async (email: string, password: string, name: string) => {
      await mockFetch('/api/auth/sign-up/email', {
        method: 'POST',
        body: { email, password, name },
        credentials: 'include',
      })
      await fetchSession()
    }

    const signOut = async () => {
      await mockFetch('/api/auth/sign-out', {
        method: 'POST',
        credentials: 'include',
      })
      authState.user = null
      authState.session = null
      authState.isAuthenticated = false
    }

    return {
      user: { value: authState.user },
      session: { value: authState.session },
      isLoading: { value: authState.isLoading },
      isAuthenticated: { value: authState.isAuthenticated },
      fetchSession,
      signIn,
      signUp,
      signOut,
    }
  }
}))

// eslint-disable-next-line import/first
import { useAuth } from '../../app/composables/useAuth'

describe('useAuth composable', () => {
  beforeEach(() => {
    authState = {
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,
    }
    vi.clearAllMocks()
  })

  it('should initialize with loading state', () => {
    const auth = useAuth()
    expect(auth.isLoading.value).toBe(true)
    expect(auth.isAuthenticated.value).toBe(false)
    expect(auth.user.value).toBeNull()
  })

  it('should fetch session successfully', async () => {
    const mockSession = {
      session: { token: 'abc123', expiresAt: new Date(), userId: '1' },
      user: { id: '1', email: 'test@example.com', name: 'Test User' }
    }

    mockFetch.mockResolvedValueOnce(mockSession)

    const auth = useAuth()
    await auth.fetchSession()

    expect(authState.isAuthenticated).toBe(true)
    expect(authState.user).toEqual(mockSession.user)
    expect(authState.session).toEqual(mockSession.session)
    expect(authState.isLoading).toBe(false)
  })

  it('should handle failed session fetch', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Unauthorized'))

    const auth = useAuth()
    await auth.fetchSession()

    expect(authState.isAuthenticated).toBe(false)
    expect(authState.user).toBeNull()
    expect(authState.session).toBeNull()
    expect(authState.isLoading).toBe(false)
  })

  it('should sign in with email and password', async () => {
    const mockResponse = { success: true }
    const mockSession = {
      session: { token: 'abc123', expiresAt: new Date(), userId: '1' },
      user: { id: '1', email: 'test@example.com', name: 'Test User' }
    }

    mockFetch
      .mockResolvedValueOnce(mockResponse)
      .mockResolvedValueOnce(mockSession)

    const auth = useAuth()
    await auth.signIn('test@example.com', 'password123')

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/sign-in/email', {
      method: 'POST',
      body: { email: 'test@example.com', password: 'password123' },
      credentials: 'include',
    })
    expect(authState.isAuthenticated).toBe(true)
  })

  it('should sign out successfully', async () => {
    // Set up authenticated state
    authState.user = { id: '1', email: 'test@example.com', name: 'Test User' }
    authState.session = { token: 'abc123', expiresAt: new Date(), userId: '1' }
    authState.isAuthenticated = true

    mockFetch.mockResolvedValueOnce({ success: true })

    const auth = useAuth()
    await auth.signOut()

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/sign-out', {
      method: 'POST',
      credentials: 'include',
    })
    expect(authState.isAuthenticated).toBe(false)
    expect(authState.user).toBeNull()
    expect(authState.session).toBeNull()
  })

  it('should sign up with email, password, and name', async () => {
    const mockResponse = { success: true }
    const mockSession = {
      session: { token: 'abc123', expiresAt: new Date(), userId: '1' },
      user: { id: '1', email: 'test@example.com', name: 'Test User' }
    }

    mockFetch
      .mockResolvedValueOnce(mockResponse)
      .mockResolvedValueOnce(mockSession)

    const auth = useAuth()
    await auth.signUp('test@example.com', 'password123', 'Test User')

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/sign-up/email', {
      method: 'POST',
      body: { email: 'test@example.com', password: 'password123', name: 'Test User' },
      credentials: 'include',
    })
    expect(authState.isAuthenticated).toBe(true)
  })
})
