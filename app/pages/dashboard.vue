<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'app',
  title: 'Dashboard'
})
</script>

<template>
  <DashboardView />
</template>
