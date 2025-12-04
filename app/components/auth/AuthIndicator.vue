<script setup lang="ts">
const { user, isAuthenticated, signOut, fetchSession } = useAuth()

onMounted(() => {
  fetchSession().catch(() => {})
})
</script>

<template>
  <div class="flex items-center gap-3">
    <template v-if="isAuthenticated">
      <NuxtLink
        to="/profile"
        class="text-sm text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400"
      >
        {{ user?.email }}
      </NuxtLink>
      <button
        class="px-3 py-1 rounded bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-800 transition-colors"
        @click="signOut"
      >
        Sign Out
      </button>
    </template>
    <template v-else>
      <NuxtLink
        to="/login"
        class="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
      >
        Sign In
      </NuxtLink>
      <NuxtLink
        to="/register"
        class="px-3 py-1 rounded border border-indigo-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
      >
        Sign Up
      </NuxtLink>
    </template>
  </div>
</template>
