<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const router = useRouter()
const { profile, isLoading, error: errorMessage, loadProfile } = useProfile()
const { logout } = useAuth()

// Mock stats - would come from API in real implementation
const stats = computed(() => ({
  totalScans: 0, // Would be fetched from user stats
  thisMonth: 0,
  successRate: 100
}))

async function handleLogout() {
  await logout()
  router.push('/auth/login')
}

async function handleDeleteAccount() {
  // TODO: Implement account deletion
  console.log('Delete account requested')
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
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Manage your account and preferences
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-16">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto" />
        <p class="text-gray-500 mt-4">Loading profile...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" class="p-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
      <div class="flex items-start gap-4">
        <svg class="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 class="font-semibold text-red-800 dark:text-red-300">Failed to load profile</h3>
          <p class="text-red-600 dark:text-red-400 mt-1">{{ errorMessage }}</p>
          <button
            class="mt-3 text-sm text-red-700 dark:text-red-300 underline hover:no-underline"
            @click="loadProfile"
          >
            Try again
          </button>
        </div>
      </div>
    </div>

    <!-- Profile Content -->
    <div v-else-if="profile" class="space-y-6">
      <!-- Profile Header -->
      <ProfileHeader :profile="profile" />

      <!-- Stats -->
      <ProfileStats 
        :total-scans="stats.totalScans"
        :this-month="stats.thisMonth"
        :success-rate="stats.successRate"
      />

      <!-- Settings -->
      <ProfileSettings 
        @logout="handleLogout"
        @delete-account="handleDeleteAccount"
      />
    </div>

    <!-- Fallback if no profile -->
    <div v-else class="text-center py-16 bg-white dark:bg-gray-800 rounded-xl">
      <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Profile not found</h3>
      <p class="text-gray-500 dark:text-gray-400">Please sign in to view your profile</p>
    </div>
  </div>
</template>
