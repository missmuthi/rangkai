<script setup lang="ts">
/**
 * Settings Page
 * Placeholder for future settings configuration
 */

definePageMeta({
  middleware: 'auth',
  layout: 'app',
  title: 'Settings'
})
</script>

<template>
  <div class="flex flex-1 items-center justify-center">
    <UiCard class="w-full max-w-md border-dashed bg-muted/50">
      <UiCardHeader class="items-center text-center">
        <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <component :is="resolveComponent('LucideSettings')" class="h-8 w-8 text-primary" />
        </div>
        <UiCardTitle class="text-lg">Settings</UiCardTitle>
      </UiCardHeader>
      <UiCardContent class="text-center">
        <p class="text-sm text-muted-foreground">
          Application settings and preferences will be available here.
        </p>
      </UiCardContent>
    </UiCard>
  </div>
</template>
