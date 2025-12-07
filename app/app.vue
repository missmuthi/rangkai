<script setup lang="ts">
useSeoMeta({
  title: 'Rangkai - Book Scanner',
  description: 'Indonesian book metadata harvester for librarians.'
})

// PWA: iOS and Android meta tags for proper installation
useHead({
  meta: [
    // iOS: Enable web app capable (fullscreen mode)
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    // iOS: Status bar style (black-translucent for immersive experience)
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    // iOS: App title when installed on home screen
    { name: 'apple-mobile-web-app-title', content: 'Rangkai' },
    // Theme color for both iOS and Android
    { name: 'theme-color', content: '#0f172a' }
  ],
  link: [
    // Apple Touch Icon (required for iOS "Add to Home Screen")
    { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }
  ]
})

// Initialize session on first load so auth middleware has a current session
// This works both server-side and client-side
const { fetchUser } = useAuth()
await fetchUser()
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
