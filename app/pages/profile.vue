<script setup lang="ts">
import Button from '@/components/ui/Button.vue'
import { AlertCircle, RefreshCw } from 'lucide-vue-next'

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
  <main class="flex-1 space-y-8 p-8 pt-6">
    <!-- Header -->
    <header class="space-y-0.5">
      <h2 class="text-3xl font-bold tracking-tight">Profile</h2>
      <p class="text-muted-foreground">
        Manage your account settings and view your activity.
      </p>
    </header>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
      <div class="flex flex-col items-center gap-2">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <p class="text-sm text-muted-foreground">Loading profile...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" class="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed border-destructive/50 bg-destructive/5">
      <div class="flex flex-col items-center text-center gap-2 max-w-[420px]">
        <AlertCircle class="h-10 w-10 text-destructive" />
        <h3 class="text-lg font-semibold text-destructive">Failed to load profile</h3>
        <p class="text-sm text-muted-foreground">{{ errorMessage }}</p>
        <Button variant="outline" class="mt-4" @click="loadProfile">
          <RefreshCw class="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    </div>

    <!-- Profile Content -->
    <div v-else-if="profile" class="space-y-8">
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
    <div v-else class="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
      <div class="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <div class="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <AlertCircle class="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 class="mt-4 text-lg font-semibold">Profile not found</h3>
        <p class="mb-4 mt-2 text-sm text-muted-foreground">
          Please sign in to view your profile settings.
        </p>
      </div>
    </div>
  </main>
</template>
