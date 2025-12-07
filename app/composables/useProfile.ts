import type { UserProfile } from '~/types'

export function useProfile() {
  const profile = ref<UserProfile | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function loadProfile() {
    isLoading.value = true
    error.value = null

    try {
      const data = await $fetch<UserProfile>('/api/profile', {
        // credentials: 'include' // usually implied or handled by auth middleware/headers
      })
      profile.value = data
    } catch (e: unknown) {
      const err = e as { data?: { message?: string } }
      error.value = err.data?.message || 'Failed to load profile'
    } finally {
      isLoading.value = false
    }
  }

  // Note: Actual update logic might need an API endpoint e.g. POST /api/profile
  async function updateProfile(data: Partial<UserProfile>) {
    // Placeholder: In a real app, you'd send a PATCH/PUT request here
    // await $fetch('/api/profile', { method: 'PATCH', body: data })
    if (profile.value) {
      profile.value = { ...profile.value, ...data }
    }
    
    // Refresh auth session if needed
    const { fetchSession } = useAuth()
    await fetchSession()
  }

  return {
    profile,
    isLoading,
    error,
    loadProfile,
    updateProfile
  }
}
