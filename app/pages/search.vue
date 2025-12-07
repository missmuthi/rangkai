<script setup lang="ts">
import { Search as SearchIcon } from 'lucide-vue-next'

interface SearchResult {
  id: string
  isbn: string
  title: string
  authors: string
  status: string
  createdAt: string
}

const route = useRoute()
const query = computed(() => (route.query.q as string) || '')

const { data, pending, error } = await useFetch<{
  results: SearchResult[]
  count: number
  query: string
}>('/api/search', {
  query: { q: query },
  watch: [query]
})
</script>

<template>
  <div class="container mx-auto p-6">
    <div class="flex flex-col items-center justify-center space-y-6">
      <div class="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
        <SearchIcon class="h-6 w-6 text-primary" />
      </div>
      <h1 class="text-2xl font-bold">Search Results</h1>
      <p class="text-muted-foreground">Query: "{{ query }}"</p>

      <!-- Loading State -->
      <div v-if="pending" class="p-4 rounded-lg bg-muted border border-border w-full max-w-2xl text-center">
        <p class="text-sm">Searching for "{{ query }}"...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-4 rounded-lg bg-destructive/10 border border-destructive w-full max-w-2xl text-center">
        <p class="text-sm text-destructive">Error: {{ error.message }}</p>
      </div>

      <!-- Results -->
      <div v-else-if="data" class="w-full max-w-2xl space-y-4">
        <p class="text-sm text-muted-foreground text-center">
          Found {{ data.count }} result(s) in your history
        </p>

        <div v-if="data.results.length === 0" class="p-6 rounded-lg bg-muted border border-border text-center">
          <p class="text-muted-foreground">No books found matching "{{ query }}"</p>
          <p class="text-sm text-muted-foreground mt-2">Try scanning a book first, then search will find it in your history.</p>
        </div>

        <div v-else class="space-y-3">
          <NuxtLink
            v-for="result in data.results"
            :key="result.id"
            :to="`/book/${result.isbn}`"
            class="block p-4 rounded-lg border border-border hover:bg-muted transition-colors"
          >
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-medium">{{ result.title || 'Unknown Title' }}</h3>
                <p class="text-sm text-muted-foreground">{{ result.authors || 'Unknown Author' }}</p>
                <p class="text-xs text-muted-foreground mt-1">ISBN: {{ result.isbn }}</p>
              </div>
              <span 
                class="text-xs px-2 py-1 rounded-full"
                :class="result.status === 'complete' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'"
              >
                {{ result.status }}
              </span>
            </div>
          </NuxtLink>
        </div>
      </div>

      <Button variant="outline" @click="$router.push('/dashboard')">Back to Dashboard</Button>
    </div>
  </div>
</template>
