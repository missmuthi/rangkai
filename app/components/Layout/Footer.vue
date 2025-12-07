<script setup lang="ts">
/**
 * Layout/Footer.vue
 * Site footer with links and copyright
 */

const currentYear = new Date().getFullYear()

const links = [
  { label: 'About', href: '/about' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'GitHub', href: 'https://github.com/rangkai', external: true }
]
</script>

<template>
  <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
    <div class="container mx-auto px-4 py-6">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <!-- Copyright -->
        <p class="text-sm text-gray-500 dark:text-gray-400">
          &copy; {{ currentYear }} Rangkai. Built with Nuxt &amp; Cloudflare.
        </p>

        <!-- Links -->
        <nav class="flex items-center gap-4">
          <template v-for="link in links" :key="link.href">
            <a
              v-if="link.external"
              :href="link.href"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {{ link.label }}
              <svg class="w-3 h-3 inline ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <NuxtLink
              v-else
              :to="link.href"
              class="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {{ link.label }}
            </NuxtLink>
          </template>
        </nav>
      </div>
    </div>
  </footer>
</template>
