<script setup lang="ts">
/**
 * Settings Page
 * User preferences, PWA installation, and account management
 */
definePageMeta({
  layout: 'app',
  title: 'Settings'
})

const { canInstall, isInstalled, install } = usePwaInstall()
const colorMode = useColorMode()
const { signOut, user } = useAuth()
const toast = useToast()

// Track installation state
const isInstalling = ref(false)

const handleInstall = async () => {
  try {
    isInstalling.value = true
    await install()
    toast.add({
      title: 'Success',
      description: 'App installed successfully',
      color: 'green'
    })
  } catch {
    toast.add({
      title: 'Error',
      description: 'Failed to install app',
      color: 'red'
    })
  } finally {
    isInstalling.value = false
  }
}

const handleSignOut = async () => {
  await signOut()
  navigateTo('/login')
}

const themeOptions = [
  { label: 'System', value: 'system', icon: 'i-lucide-monitor' },
  { label: 'Light', value: 'light', icon: 'i-lucide-sun' },
  { label: 'Dark', value: 'dark', icon: 'i-lucide-moon' }
]
</script>

<template>
  <div class="max-w-4xl space-y-8">
    <!-- PWA Install Section -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-primary/10">
            <UIcon name="i-lucide-smartphone" class="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white">App Installation</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Install Rangkai for the best experience
            </p>
          </div>
        </div>
      </template>

      <!-- Installable State -->
      <div v-if="canInstall && !isInstalled" class="flex items-start gap-4">
        <div class="flex-1 space-y-4">
          <p class="text-sm text-gray-600 dark:text-gray-300">
            Add to your home screen for fullscreen camera access, offline support, and faster loading.
          </p>
          <UButton
            :loading="isInstalling"
            icon="i-lucide-download"
            size="md"
            @click="handleInstall"
          >
            Install App
          </UButton>
        </div>
      </div>

      <!-- Installed State -->
      <div v-else-if="isInstalled" class="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4 flex gap-3">
        <UIcon name="i-lucide-check-circle-2" class="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
        <div>
          <h4 class="font-medium text-green-900 dark:text-green-100 text-sm">App Installed</h4>
          <p class="text-sm text-green-700 dark:text-green-400 mt-1">
            Rangkai is installed on your device. Enjoy the native experience!
          </p>
        </div>
      </div>

      <!-- Manual Install Instructions (iOS/Safari) -->
      <div v-else class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h4 class="font-medium text-gray-900 dark:text-white text-sm mb-2">Installation Status</h4>
        <p class="text-sm text-gray-600 dark:text-gray-300">
          To install on iOS Safari: Tap <span class="font-medium">Share</span> <UIcon name="i-heroicons-share" class="w-4 h-4 inline align-text-bottom" /> then <span class="font-medium">Add to Home Screen</span> <UIcon name="i-heroicons-plus-square" class="w-4 h-4 inline align-text-bottom" />
        </p>
      </div>
    </UCard>

    <!-- Appearance Section -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-primary/10">
            <UIcon name="i-lucide-palette" class="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white">Appearance</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Customize how Rangkai looks on your device
            </p>
          </div>
        </div>
      </template>

      <div class="grid grid-cols-3 gap-4">
        <div
          v-for="theme in themeOptions"
          :key="theme.value"
          :class="[
            'cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center gap-3 transition-all',
            colorMode.preference === theme.value
              ? 'border-primary bg-primary/5 ring-1 ring-primary'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          ]"
          @click="colorMode.preference = theme.value"
        >
          <UIcon 
            :name="theme.icon" 
            class="w-6 h-6"
            :class="colorMode.preference === theme.value ? 'text-primary' : 'text-gray-500 dark:text-gray-400'"
          />
          <span 
            class="text-sm font-medium"
            :class="colorMode.preference === theme.value ? 'text-primary' : 'text-gray-700 dark:text-gray-300'"
          >
            {{ theme.label }}
          </span>
        </div>
      </div>
    </UCard>

    <!-- Account Section -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-primary/10">
            <UIcon name="i-lucide-user" class="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white">Account</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Manage your session
            </p>
          </div>
        </div>
      </template>

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <UAvatar
            :alt="user?.name || 'User'"
            size="lg"
            class="bg-primary text-white"
          />
          <div>
            <div class="font-medium text-gray-900 dark:text-white">{{ user?.name || 'User' }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">{{ user?.email }}</div>
          </div>
        </div>
        
        <UButton
          color="red"
          variant="soft"
          icon="i-lucide-log-out"
          @click="handleSignOut"
        >
          Sign Out
        </UButton>
      </div>
    </UCard>
  </div>
</template>
