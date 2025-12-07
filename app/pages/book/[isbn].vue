<script setup lang="ts">
const route = useRoute()
const isbn = computed(() => route.params.isbn as string)
</script>

<template>
  <div class="container mx-auto p-6">
    <div class="flex flex-col items-center justify-center space-y-4">
      <div class="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
        <component :is="resolveComponent('LucideBook')" class="h-6 w-6 text-primary" />
      </div>
      <h1 class="text-2xl font-bold">Book Details</h1>
      <p class="text-muted-foreground">ISBN: {{ isbn }}</p>
      <div class="p-4 rounded-lg bg-muted border border-border">
        <p class="text-sm">Fetching metadata for book {{ isbn }}...</p>
      </div>
      <Button variant="outline" @click="$router.back()">Go Back</Button>
    </div>
  </div>
</template>
