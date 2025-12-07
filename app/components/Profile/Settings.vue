<script setup lang="ts">
/**
 * Profile/Settings.vue
 * User preferences and account settings
 */

const emit = defineEmits<{
  logout: []
  deleteAccount: []
}>()

// Settings state
const darkMode = ref(false)
const notifications = ref(true)
const autoClean = ref(true)

// Load preferences from localStorage
onMounted(() => {
  if (import.meta.client) {
    darkMode.value = document.documentElement.classList.contains('dark')
    notifications.value = localStorage.getItem('notifications') !== 'false'
    autoClean.value = localStorage.getItem('autoClean') !== 'false'
  }
})

// Watch for changes and save
watch(darkMode, (val) => {
  if (import.meta.client) {
    document.documentElement.classList.toggle('dark', val)
    localStorage.setItem('theme', val ? 'dark' : 'light')
  }
})

watch(notifications, (val) => {
  if (import.meta.client) {
    localStorage.setItem('notifications', String(val))
  }
})

watch(autoClean, (val) => {
  if (import.meta.client) {
    localStorage.setItem('autoClean', String(val))
  }
})

function handleLogout() {
  emit('logout')
}

function handleDeleteAccount() {
  if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
    emit('deleteAccount')
  }
}
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm divide-y divide-gray-200 dark:divide-gray-700">
    <!-- Preferences Section -->
    <div class="p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preferences</h3>
      
      <div class="space-y-4">
        <!-- Dark Mode -->
        <label class="flex items-center justify-between cursor-pointer">
          <div>
            <span class="text-gray-700 dark:text-gray-300">Dark Mode</span>
            <p class="text-sm text-gray-500 dark:text-gray-400">Use dark theme</p>
          </div>
          <input
            v-model="darkMode"
            type="checkbox"
            class="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
          >
        </label>

        <!-- Notifications -->
        <label class="flex items-center justify-between cursor-pointer">
          <div>
            <span class="text-gray-700 dark:text-gray-300">Notifications</span>
            <p class="text-sm text-gray-500 dark:text-gray-400">Receive scan notifications</p>
          </div>
          <input
            v-model="notifications"
            type="checkbox"
            class="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
          >
        </label>

        <!-- Auto-Clean -->
        <label class="flex items-center justify-between cursor-pointer">
          <div>
            <span class="text-gray-700 dark:text-gray-300">Auto-Clean Metadata</span>
            <p class="text-sm text-gray-500 dark:text-gray-400">Use AI to clean book metadata</p>
          </div>
          <input
            v-model="autoClean"
            type="checkbox"
            class="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
          >
        </label>
      </div>
    </div>

    <!-- Account Section -->
    <div class="p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account</h3>
      
      <div class="space-y-3">
        <button
          class="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          @click="handleLogout"
        >
          Sign Out
        </button>
        
        <button
          class="w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          @click="handleDeleteAccount"
        >
          Delete Account
        </button>
      </div>
    </div>
  </div>
</template>
