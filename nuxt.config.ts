// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-04-25',
  // Nuxt 4 directory structure and features
  // https://nuxt.com/docs/getting-started/upgrade#testing-nuxt-4
  future: { compatibilityVersion: 4 },
  // Global CSS
  css: ['~/assets/css/main.css'],
  // Nuxt Modules
  // https://nuxt.com/modules
  modules: [
    '@nuxthub/core',
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vite-pwa/nuxt'
  ],
  colorMode: {
    classSuffix: ''
  },
  hub: {
    database: true,
    kv: true,
    blob: false, // Disabled - R2 not enabled on account
    cache: false, // Re-disabled: Breaks build due to 'ms' dependency issue in @nuxthub/core
  },
  // PWA Configuration (Progressive Web App)
  pwa: {
    registerType: 'prompt', // Manual update control (better UX for scanner)
    manifest: {
      name: 'Rangkai',
      short_name: 'Rangkai',
      description: 'Book metadata scanner for Indonesian librarians',
      theme_color: '#0f172a', // Dark mode background (slate-900)
      background_color: '#0f172a',
      display: 'standalone', // Fullscreen for camera (no browser UI)
      orientation: 'portrait', // Lock orientation for scanner stability
      start_url: '/',
      scope: '/',
      icons: [
        {
          src: '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/pwa-maskable-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable' // For Android adaptive icons
        },
        {
          src: '/pwa-maskable-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ]
    },
    workbox: {
      // Use GenerateSW for automatic service worker
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      // Cache strategy for app shell (instant load)
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'gstatic-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          // CRITICAL: Exclude API routes from cache (always fetch fresh data)
          urlPattern: /^https?:\/\/.*\/api\/.*/i,
          handler: 'NetworkOnly'
        }
      ],
      navigateFallback: undefined, // Don't cache navigation (avoid stale pages)
      cleanupOutdatedCaches: true
    },
    client: {
      installPrompt: true, // Show install prompt
      periodicSyncForUpdates: 3600 // Check for updates every hour
    },
    devOptions: {
      enabled: true, // Enable PWA in dev mode for testing
      suppressWarnings: true,
      type: 'module'
    }
  },
  nitro: {
    experimental: {
      // Enable Server API documentation within NuxtHub
      openAPI: true
    }
  },
  // Development
  devtools: { enabled: true },
  runtimeConfig: {
    authSecret: process.env.AUTH_SECRET || '',
    oauthGoogleClientId: process.env.OAUTH_GOOGLE_CLIENT_ID || '',
    oauthGoogleClientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET || '',
    public: {
      // Ensure there is a safe fallback so OAuth redirect URI uses a valid domain
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://rangkai-d3k.pages.dev'
    }
  },
  app: {
    head: {
      htmlAttrs: {
        lang: 'en'
      }
    }
  }
})
