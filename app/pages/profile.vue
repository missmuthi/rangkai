<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

interface ProfileData {
  id: string
  email: string
  name: string | null
}

const profile = ref<ProfileData | null>(null)
const isLoading = ref(true)
const errorMessage = ref('')

async function loadProfile() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const data = await $fetch<ProfileData>('/api/profile', {
      credentials: 'include',
    })
    profile.value = data
  } catch (error: unknown) {
    const err = error as { data?: { message?: string } }
    errorMessage.value = err?.data?.message || 'Failed to load profile'
  } finally {
    isLoading.value = false
  }
}

function handleProfileSave(updatedProfile: ProfileData) {
  profile.value = updatedProfile
  // Re-fetch session to update the global auth state
  const { fetchSession } = useAuth()
  fetchSession()
}

onMounted(() => {
  loadProfile()
})

useHead({
  title: 'Profile - Rangkai',
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Manage your account information
      </p>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"/>
    </div>

    <div v-else-if="errorMessage" class="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
      <p class="text-red-600 dark:text-red-400">{{ errorMessage }}</p>
      <button
        class="mt-2 text-sm text-red-600 dark:text-red-400 underline"
        @click="loadProfile"
      >
        Try again
      </button>
    </div>

    <div v-else-if="profile" class="space-y-6">
      <ProfileCard :profile="profile" />
      <ProfileEditForm :profile="profile" @save="handleProfileSave" />
    </div>
  </div>
</template>
