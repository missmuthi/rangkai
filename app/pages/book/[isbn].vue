<script setup lang="ts">
const route = useRoute()
const isbn = computed(() => route.params.isbn as string)

const { book, scanId, loading, error, searchByISBN } = useBookSearch()

onMounted(async () => {
  if (isbn.value) {
    await searchByISBN(isbn.value)
  }
})
</script>

<template>
  <div class="container mx-auto p-4 max-w-2xl min-h-screen py-8">
    <div class="flex items-center gap-4 mb-6">
      <Button variant="ghost" size="icon" @click="$router.back()">
        <component :is="resolveComponent('LucideArrowLeft')" class="h-5 w-5" />
      </Button>
      <h1 class="text-xl font-bold">Book Details</h1>
    </div>

    <div v-if="loading" class="space-y-4">
      <div class="h-64 bg-muted animate-pulse rounded-lg" />
      <div class="h-8 w-3/4 bg-muted animate-pulse rounded" />
      <div class="h-4 w-1/2 bg-muted animate-pulse rounded" />
    </div>

    <div v-else-if="error" class="p-4 bg-red-900/20 text-red-400 rounded-lg">
      {{ error }}
    </div>

    <div v-else-if="book" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div v-if="scanId" class="mb-4 text-green-400 text-center text-sm font-medium p-2 bg-green-900/10 rounded border border-green-900/20">
        ✓ Saved to history
      </div>
      
      <BookCard :book="book" :show-actions="true" />
    </div>

    <div v-else class="text-center text-muted-foreground py-12">
      No book found specifically for ISBN {{ isbn }}
    </div>
  </div>
</template>
