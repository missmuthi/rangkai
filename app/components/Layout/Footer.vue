<script setup lang="ts">
/**
 * Layout/Footer.vue
 * Site footer with links and copyright
 */
import { BookOpen, Github, Zap } from 'lucide-vue-next'

const currentYear = new Date().getFullYear()

const navigationLinks = [
  { label: 'Features', href: '/features' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'History', href: '/history' }
]

const resourceLinks = [
  { label: 'GitHub', href: 'https://github.com', external: true, icon: Github },
  { label: 'NuxtHub', href: 'https://hub.nuxt.com', external: true, icon: Zap },
  { label: 'Documentation', href: 'https://nuxt.com/docs', external: true }
]
</script>

<template>
  <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
    <div class="container mx-auto px-4 py-12">
      <!-- Main Footer Content -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <!-- Column 1: Branding -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <BookOpen class="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <span class="text-xl font-bold text-gray-900 dark:text-white">Rangkai</span>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
            Book metadata harvester for Indonesian librarians. Scan, fetch, and clean bibliographic data with AI.
          </p>
        </div>

        <!-- Column 2: Navigation -->
        <div class="space-y-4">
          <h3 class="font-semibold text-gray-900 dark:text-white">Navigation</h3>
          <ul class="space-y-2">
            <li v-for="link in navigationLinks" :key="link.href">
              <NuxtLink 
                :to="link.href" 
                class="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Column 3: Resources -->
        <div class="space-y-4">
          <h3 class="font-semibold text-gray-900 dark:text-white">Resources</h3>
          <ul class="space-y-2">
            <li v-for="link in resourceLinks" :key="link.href">
              <a 
                :href="link.href" 
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1"
              >
                <component :is="link.icon" v-if="link.icon" class="h-4 w-4" />
                {{ link.label }}
                <svg v-if="link.external" class="w-3 h-3 inline ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="pt-8 border-t border-gray-200 dark:border-gray-700">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            &copy; {{ currentYear }} Rangkai. Built with Nuxt 3 + NuxtHub.
          </p>
          <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span class="inline-flex items-center gap-1">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              Version 2.0
            </span>
            <span>•</span>
            <span>Powered by Cloudflare Edge</span>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
