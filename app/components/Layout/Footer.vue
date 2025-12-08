<script setup lang="ts">
/**
 * Layout/Footer.vue
 * Modern footer with multi-column layout and Nuxt UI components
 */
const currentYear = new Date().getFullYear()

const productLinks = [
  { label: 'Features', to: '/features' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Scan History', to: '/history' }
]

const resourceLinks = [
  { label: 'Documentation', to: '/docs', external: false },
  { label: 'NuxtHub', href: 'https://hub.nuxt.com', external: true },
  { label: 'Nuxt UI', href: 'https://ui.nuxt.com', external: true }
]
</script>

<template>
  <footer class="relative border-t border-border bg-card/50 backdrop-blur-sm">
    <div class="container mx-auto px-4 py-16">
      <!-- Main Footer Content -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        <!-- Column 1: Branding -->
        <div class="space-y-4 lg:col-span-2">
          <NuxtLink to="/" class="inline-flex items-center gap-2 group">
            <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <UIcon name="i-lucide-book-open" class="w-5 h-5 text-primary" />
            </div>
            <span class="text-2xl font-bold text-foreground">Rangkai</span>
          </NuxtLink>
          <p class="text-muted-foreground max-w-md leading-relaxed">
            Book metadata harvester for Indonesian librarians. Scan, fetch, and clean bibliographic data with AI for seamless SLiMS cataloging.
          </p>
          
          <!-- Social Links / CTAs -->
          <div class="flex items-center gap-3 pt-2">
            <UButton
              to="https://github.com"
              target="_blank"
              color="gray"
              variant="ghost"
              icon="i-lucide-github"
              size="sm"
              aria-label="GitHub"
            />
            <UButton
              to="/dashboard"
              color="gray"
              variant="ghost"
              icon="i-lucide-layout-dashboard"
              size="sm"
            >
              Get Started
            </UButton>
          </div>
        </div>

        <!-- Column 2: Product -->
        <div class="space-y-4">
          <h3 class="font-semibold text-sm uppercase tracking-wider text-foreground">Product</h3>
          <ul class="space-y-3">
            <li v-for="link in productLinks" :key="link.to">
              <NuxtLink 
                :to="link.to" 
                class="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
              >
                <span>{{ link.label }}</span>
                <UIcon 
                  name="i-lucide-arrow-right" 
                  class="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" 
                />
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Column 3: Resources -->
        <div class="space-y-4">
          <h3 class="font-semibold text-sm uppercase tracking-wider text-foreground">Resources</h3>
          <ul class="space-y-3">
            <li v-for="link in resourceLinks" :key="link.to || link.href">
              <NuxtLink 
                v-if="!link.external"
                :to="link.to!" 
                class="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
              >
                <span>{{ link.label }}</span>
              </NuxtLink>
              <a 
                v-else
                :href="link.href" 
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
              >
                <span>{{ link.label }}</span>
                <UIcon name="i-lucide-external-link" class="w-3 h-3" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="pt-8 border-t border-border">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div class="flex items-center gap-4 text-sm text-muted-foreground">
            <p>© {{ currentYear }} Rangkai</p>
            <span class="hidden sm:inline">•</span>
            <p class="hidden sm:block">Built with Nuxt UI</p>
          </div>
          
          <div class="flex items-center gap-3">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span class="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span>Version 2.0</span>
            </div>
            <div class="text-xs text-muted-foreground hidden md:flex items-center gap-1">
              <UIcon name="i-lucide-zap" class="w-3 h-3" />
              <span>Cloudflare Edge</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
