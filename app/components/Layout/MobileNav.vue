<script setup lang="ts">
import { cn } from '~/utils/cn'

const { isAuthenticated, signOut } = useAuth()
const route = useRoute()

const menuItems = computed(() => {
  if (isAuthenticated.value) {
    return [
      { label: 'Home', to: '/', icon: 'home' },
      { label: 'History', to: '/history', icon: 'history' },
      { label: 'Scan', to: '/scan', icon: 'scan', isPrimary: true },
      { label: 'Profile', to: '/profile', icon: 'user' }
    ]
  }
  return [
    { label: 'Home', to: '/', icon: 'home' },
    { label: 'Login', to: '/login', icon: 'login' }
  ]
})

const handleLogout = async () => {
  await signOut()
}

const getIcon = (name: string) => icons[name as keyof typeof icons]


const icons = {
  home: '<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />',
  history: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />',
  scan: '<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" /><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />',
  user: '<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />',
  login: '<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />'
}
</script>

<template>
  <nav class="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 pb-safe z-50">
    <div class="flex justify-around items-center h-16">
      <template v-for="item in menuItems" :key="item.to">
        <!-- Primary Action (Scan) -->
        <div v-if="item.isPrimary" class="relative -top-5">
          <NuxtLink
            :to="item.to"
            :class="cn(
              'flex flex-col items-center justify-center w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors'
            )"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke-width="1.5" 
              stroke="currentColor" 
              class="w-7 h-7"
              v-html="getIcon(item.icon)"
            />
          </NuxtLink>
        </div>

        <!-- Standard Item -->
        <NuxtLink
          v-else
          :to="item.to"
          class="flex flex-col items-center justify-center w-full h-full space-y-1"
          :class="cn(
            route.path === item.to 
              ? 'text-indigo-600 dark:text-indigo-400' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          )"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke-width="1.5" 
            stroke="currentColor" 
            class="w-6 h-6"
            v-html="getIcon(item.icon)"
          />
          <span class="text-[10px] font-medium">{{ item.label }}</span>
        </NuxtLink>
      </template>

      <!-- Mobile Logout (only if authenticated) -->
      <button
        v-if="isAuthenticated"
        class="flex flex-col items-center justify-center w-full h-full space-y-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
        @click="handleLogout"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
        </svg>
        <span class="text-[10px] font-medium">Logout</span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
