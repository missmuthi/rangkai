<script setup lang="ts">
const route = useRoute()
const query = computed(() => route.query.q as string)
</script>

<template>
  <div class="container mx-auto p-6">
    <div class="flex flex-col items-center justify-center space-y-4">
      <div class="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
        <component :is="resolveComponent('LucideSearch')" class="h-6 w-6 text-primary" />
      </div>
      <h1 class="text-2xl font-bold">Search Results</h1>
      <p class="text-muted-foreground">Query: "{{ query }}"</p>
      <div class="p-4 rounded-lg bg-muted border border-border w-full max-w-md text-center">
        <p class="text-sm">Displaying results for "{{ query }}"...</p>
      </div>
      <Button variant="outline" @click="$router.push('/dashboard')">Back to Dashboard</Button>
    </div>
  </div>
</template>
