<script setup lang="ts">
useSeoMeta({
  title: 'Rangkai - Book Scanner',
  description: 'Indonesian book metadata harvester for librarians.'
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
