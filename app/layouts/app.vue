<template>
  <LayoutAppLayout :page-title="pageTitle">
    <slot />
  </LayoutAppLayout>
</template>

<script setup lang="ts">
const route = useRoute()

const pageTitle = computed(() => {
  const meta = route.meta as { title?: string }
  return meta.title || 'Dashboard'
})
</script>
