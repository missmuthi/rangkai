<script setup lang="ts">
import BiblioModal from '~/components/BiblioModal.vue'
import { BookOpen } from 'lucide-vue-next'

const route = useRoute()
const isbn = computed(() => route.params.isbn as string)

const { book, scanId, loading, error, searchByISBN, cleanMetadata } = useBookSearch()
const showBiblioModal = ref(false)
const isCleaning = ref(false)

onMounted(async () => {
  if (isbn.value) {
    await searchByISBN(isbn.value)
  }
})

async function handleAiClean() {
  if (!book.value || !scanId.value) return
  
  isCleaning.value = true
  try {
    const cleaned = await cleanMetadata(book.value)
    
    // Save to server
    await $fetch(`/api/scans/${scanId.value}`, {
      method: 'PATCH',
      body: cleaned
    })
    
    // Update local state
    book.value = cleaned
  } catch (err) {
    console.error('Failed to clean metadata', err)
    // Ideally show toast here
  } finally {
    isCleaning.value = false
  }
}
</script>

<template>
  <div class="container mx-auto p-4 max-w-2xl min-h-screen py-8">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <Button variant="ghost" size="icon" @click="$router.back()">
          <component :is="resolveComponent('LucideArrowLeft')" class="h-5 w-5" />
        </Button>
        <h1 class="text-xl font-bold">Book Details</h1>
      </div>
      
      <Button 
        v-if="book" 
        variant="outline" 
        size="sm"
        class="gap-2"
        @click="showBiblioModal = true"
      >
        <BookOpen class="w-4 h-4" />
        <span class="hidden sm:inline">Bibliographic Record</span>
      </Button>
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
      
      <BiblioModal 
        :book="book" 
        :open="showBiblioModal" 
        @close="showBiblioModal = false"
        @clean="handleAiClean"
      />
    </div>

    <div v-else class="text-center text-muted-foreground py-12">
      No book found specifically for ISBN {{ isbn }}
    </div>
  </div>
</template>
