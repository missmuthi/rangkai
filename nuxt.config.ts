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
    '@vite-pwa/nuxt',
    '@nuxt/image',
    'nuxt-security'
  ],
  image: {
    // Use Cloudflare's built-in image resizing (no IPX Worker CPU overhead)
    provider: 'cloudflare',
    cloudflare: {
      baseURL: '/' // Relative to site
    },
    // Limit quality to prevent CPU spikes on Free tier
    quality: 80,
    format: ['webp', 'avif'],
    // External domains that we'll proxy
    domains: [
      'books.google.com',
      'covers.openlibrary.org',
      'tile.loc.gov',
      'opac.perpusnas.go.id'
    ]
  },
  // Security Configuration
  security: {
    headers: {
      contentSecurityPolicy: {
        'img-src': ["'self'", 'data:', 'https:', 'https://books.google.com', 'https://covers.openlibrary.org', 'https://opac.perpusnas.go.id'],
        'script-src': ["'self'", "'unsafe-inline'", "'wasm-unsafe-eval'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'connect-src': ["'self'"],
        'font-src': ["'self'", 'data:'],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"]
      },
      crossOriginEmbedderPolicy: false,
      strictTransportSecurity: {
        maxAge: 31536000,
        includeSubdomains: true,
        preload: true
      },
      xContentTypeOptions: 'nosniff',
      xFrameOptions: 'SAMEORIGIN',
      xXSSProtection: '1; mode=block'
    },
    rateLimiter: false
  },
  routeRules: {
    // Landing page & static content
    // Prerender disabled due to build-time binding issues. Falling back to Edge SSR.
    // '/': { prerender: true },
    // '/about': { prerender: true },
    
    // User Dashboard & protected routes - Client-side Only (SPA)
    // Avoids "Hydration Mismatch" and speeds up navigation for logged-in users
    '/dashboard/**': { ssr: false },
    '/history/**': { ssr: false },
    '/settings/**': { ssr: false },
    '/scan/**': { ssr: false },
    '/profile/**': { ssr: false },

    // Public Book Details - Stale-While-Revalidate (SWR)
    // Cache for 1 hour (3600s), revalidate in background
    '/book/**': { swr: 3600 },
    
    // Experimental pages
    '/diagnostics/**': { ssr: false },
    
    // API Caching Rules
    // User-specific APIs: No Cache
    '/api/scan/**': { cache: false },
    '/api/me/**': { cache: false },
    
    // Public Data APIs: Cache for 1 day
    '/api/stats/**': { swr: 86400 },
  },
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
