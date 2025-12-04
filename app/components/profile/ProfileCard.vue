<script setup lang="ts">
interface ProfileData {
  id: string
  email: string
  name: string | null
}

defineProps<{
  profile: ProfileData
}>()
</script>

<template>
  <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
    <div class="flex items-center space-x-4">
      <div class="flex-shrink-0">
        <div class="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
          <span class="text-2xl font-semibold text-indigo-600 dark:text-indigo-300">
            {{ profile.name?.charAt(0).toUpperCase() || profile.email.charAt(0).toUpperCase() }}
          </span>
        </div>
      </div>
      <div class="flex-1">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ profile.name || 'Anonymous User' }}
        </h2>
        <p class="text-gray-500 dark:text-gray-400">
          {{ profile.email }}
        </p>
      </div>
    </div>
  </div>
</template>
