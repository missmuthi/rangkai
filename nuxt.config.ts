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
    '@nuxtjs/tailwindcss',
    '@vite-pwa/nuxt'
  ],
  hub: {
    database: true,
    kv: true,
    blob: false, // Disabled - R2 not enabled on account
    cache: false, // Temporarily disable cache to fix build issue
  },
  // PWA Configuration
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Rangkai Book Scanner',
      short_name: 'Rangkai',
      description: 'Scan and catalog books with ISBN barcodes',
      theme_color: '#003049', // deep-space-blue
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      icons: [
        {
          src: '/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}']
    },
    client: {
      installPrompt: true
    },
    devOptions: {
      enabled: true,
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
  }
})
