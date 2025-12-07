<script setup lang="ts">
import { BookOpen, Menu, X } from 'lucide-vue-next'
import { cn } from '~/utils/cn'

interface Props {
  pageTitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  pageTitle: 'Dashboard'
})

// Use the navigation composable
const { navItems, isActive } = useNavigation()

// Mobile sidebar state
const isMobileMenuOpen = ref(false)

// Close mobile menu when route changes
const route = useRoute()
watch(() => route.path, () => {
  isMobileMenuOpen.value = false
})
</script>

<template>
  <div class="flex min-h-screen bg-background">
    <!-- Desktop Sidebar -->
    <aside class="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-border bg-card lg:flex">
      <!-- Logo / Brand -->
      <div class="flex h-16 items-center gap-3 border-b border-border px-6">
        <NuxtLink to="/dashboard" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen class="h-5 w-5" />
          </div>
          <span class="text-lg font-semibold text-foreground">Rangkai</span>
        </NuxtLink>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 space-y-1 px-3 py-4">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :aria-current="isActive(item.to) ? 'page' : undefined"
          :class="cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            isActive(item.to)
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )"
        >
          <component
            :is="item.icon"
            :class="cn(
              'h-5 w-5 shrink-0',
              isActive(item.to)
                ? 'text-primary'
                : 'text-muted-foreground'
            )"
          />
          {{ item.label }}
        </NuxtLink>
      </nav>

      <!-- Footer -->
      <div class="border-t border-border p-4">
        <p class="text-xs text-muted-foreground">© 2025 Rangkai</p>
      </div>
    </aside>

    <!-- Mobile Sidebar (Sheet) -->
    <UiSheet v-model:open="isMobileMenuOpen" side="left" class="w-64 p-0">
      <template #default="{ close }">
        <!-- Logo / Brand -->
        <div class="flex h-16 items-center justify-between border-b border-border px-6">
          <div class="flex items-center gap-3">
            <NuxtLink to="/dashboard" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BookOpen class="h-5 w-5" />
              </div>
              <span class="text-lg font-semibold text-foreground">Rangkai</span>
            </NuxtLink>
          </div>
          <button
            type="button"
            class="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            @click="close"
          >
            <X class="h-5 w-5" />
            <span class="sr-only">Close menu</span>
          </button>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 space-y-1 px-3 py-4">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            :aria-current="isActive(item.to) ? 'page' : undefined"
            :class="cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive(item.to)
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )"
            @click="close"
          >
            <component
              :is="item.icon"
              :class="cn(
                'h-5 w-5 shrink-0',
                isActive(item.to)
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )"
            />
            {{ item.label }}
          </NuxtLink>
        </nav>

        <!-- Footer -->
        <div class="border-t border-border p-4">
          <p class="text-xs text-muted-foreground">© 2025 Rangkai</p>
        </div>
      </template>
    </UiSheet>

    <!-- Main Content Area -->
    <div class="flex flex-1 flex-col lg:pl-64">
      <!-- Header -->
      <header class="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-card/80 px-4 backdrop-blur-sm sm:px-6">
        <!-- Mobile Menu Trigger -->
        <button
          type="button"
          class="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
          @click="isMobileMenuOpen = true"
        >
          <Menu class="h-5 w-5" />
          <span class="sr-only">Open menu</span>
        </button>

        <!-- Page Title -->
        <h1 class="text-xl font-semibold text-foreground">
          {{ props.pageTitle }}
        </h1>
      </header>

      <!-- Page Content -->
      <main class="flex flex-1 flex-col p-4 sm:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
