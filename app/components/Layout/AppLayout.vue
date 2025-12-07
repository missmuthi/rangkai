<script setup lang="ts">
import { History, Settings, LayoutDashboard, BookOpen } from 'lucide-vue-next'
import { cn } from '~/utils/cn'

interface NavItem {
  label: string
  to: string
  icon: typeof History
}

interface Props {
  pageTitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  pageTitle: 'Dashboard'
})

const route = useRoute()

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'History', to: '/history', icon: History },
  { label: 'Settings', to: '/settings', icon: Settings },
]

const isActive = (to: string): boolean => {
  return route.path === to || route.path.startsWith(to + '/')
}
</script>

<template>
  <div class="flex min-h-screen bg-slate-50 dark:bg-slate-950">
    <!-- Sidebar -->
    <aside class="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:flex">
      <!-- Logo / Brand -->
      <div class="flex h-16 items-center gap-3 border-b border-slate-200 px-6 dark:border-slate-800">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <BookOpen class="h-5 w-5" />
        </div>
        <span class="text-lg font-semibold text-slate-900 dark:text-slate-100">Rangkai</span>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 space-y-1 px-3 py-4">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            isActive(item.to)
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
          )"
        >
          <component
            :is="item.icon"
            :class="cn(
              'h-5 w-5 shrink-0',
              isActive(item.to)
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-400 dark:text-slate-500'
            )"
          />
          {{ item.label }}
        </NuxtLink>
      </nav>

      <!-- Footer -->
      <div class="border-t border-slate-200 p-4 dark:border-slate-800">
        <p class="text-xs text-slate-500 dark:text-slate-400">© 2025 Rangkai</p>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex flex-1 flex-col lg:pl-64">
      <!-- Header -->
      <header class="sticky top-0 z-40 flex h-16 items-center border-b border-slate-200 bg-white/80 px-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
        <h1 class="text-xl font-semibold text-slate-900 dark:text-slate-100">
          {{ props.pageTitle }}
        </h1>
      </header>

      <!-- Page Content -->
      <main class="flex flex-1 flex-col p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
