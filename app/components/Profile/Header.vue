<script setup lang="ts">
/**
 * Profile/Header.vue
 * User profile header with avatar, name, and email
 */
import type { UserProfile } from '~/types'

const props = defineProps<{
  profile: UserProfile | null
}>()

const initials = computed(() => {
  if (!props.profile?.name) return '?'
  return props.profile.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const memberSince = computed(() => {
  if (!props.profile?.joinDate) return ''
  return new Date(props.profile.joinDate).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })
})
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
    <div class="flex items-center gap-4">
      <!-- Avatar -->
      <div class="relative">
        <img
          v-if="profile?.avatar"
          :src="profile.avatar"
          :alt="profile.name || 'User avatar'"
          class="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-50 dark:ring-gray-700"
        >
        <div
          v-else
          class="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center ring-4 ring-indigo-50 dark:ring-gray-700"
        >
          <span class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {{ initials }}
          </span>
        </div>
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white truncate">
          {{ profile?.name || 'User' }}
        </h2>
        <p class="text-gray-500 dark:text-gray-400 truncate">
          {{ profile?.email }}
        </p>
        <p v-if="memberSince" class="text-sm text-gray-400 dark:text-gray-500 mt-1">
          Member since {{ memberSince }}
        </p>
      </div>

      <!-- Edit Button -->
      <button
        class="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        Edit
      </button>
    </div>
  </div>
</template>
