<script setup lang="ts">
/**
 * Perpusnas Experimental Testing Page
 * 
 * Tests the Perpusnas OAI-PMH integration in isolation.
 * Allows manual ISBN input and displays results with timing.
 */
definePageMeta({
  layout: 'default'
})

useSeoMeta({
  title: 'Perpusnas API Test | Rangkai Diagnostics',
  description: 'Experimental page for testing Perpusnas OAI-PMH integration'
})

// State
const isbn = ref('')
const isLoading = ref(false)
const connectionStatus = ref<any>(null)
const searchResult = ref<any>(null)
const error = ref<string | null>(null)
const endpointErrors = ref<string[]>([])

// Test connection on mount
onMounted(async () => {
  await testConnection()
})

// Test Perpusnas connectivity
async function testConnection() {
  connectionStatus.value = null
  endpointErrors.value = []
  try {
    const result = await $fetch('/api/experimental/perpusnas/test')
    connectionStatus.value = result
    endpointErrors.value = result.errors || []
  } catch (e: any) {
    connectionStatus.value = { available: false, error: e.message }
  }
}

// Search by ISBN
async function searchByIsbn() {
  if (!isbn.value.trim()) return

  isLoading.value = true
  error.value = null
  searchResult.value = null

  try {
    const result = await $fetch(`/api/experimental/perpusnas/${isbn.value}`)
    searchResult.value = result
  } catch (e: any) {
    error.value = e.data?.message || e.message || 'Unknown error'
  } finally {
    isLoading.value = false
  }
}

// Sample Indonesian ISBNs for testing
const sampleIsbns = [
  { isbn: '9786020332093', title: 'Filosofi Teras (Popular)' },
  { isbn: '9786232128000', title: 'Laut Bercerita' },
  { isbn: '9789791227957', title: 'Laskar Pelangi' },
]
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Header -->
    <div class="mb-8">
      <div class="inline-flex items-center gap-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 text-sm font-medium text-yellow-500 mb-4">
        <UIcon name="i-lucide-flask-conical" class="w-4 h-4" />
        <span>Experimental</span>
      </div>
      <h1 class="text-3xl font-bold text-foreground">Perpusnas API Test</h1>
      <p class="text-muted-foreground mt-2">
        Test the Indonesian National Library (Perpusnas) OAI-PMH integration.
        This is an isolated experiment - no data is saved.
      </p>
    </div>

    <!-- Connection Status -->
    <UCard class="mb-6">
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="font-semibold">Connection Status</h2>
          <UButton
            size="xs"
            color="gray"
            variant="ghost"
            icon="i-lucide-refresh-cw"
            :loading="!connectionStatus"
            @click="testConnection"
          >
            Refresh
          </UButton>
        </div>
      </template>

      <div v-if="!connectionStatus" class="flex items-center gap-2 text-muted-foreground">
        <UIcon name="i-lucide-loader-2" class="w-4 h-4 animate-spin" />
        <span>Testing connection...</span>
      </div>

      <div v-else-if="connectionStatus.available" class="space-y-2">
        <div class="flex items-center gap-2 text-green-500">
          <UIcon name="i-lucide-check-circle" class="w-5 h-5" />
          <span class="font-medium">Connected</span>
        </div>
        <div class="text-sm text-muted-foreground">
          <p>Endpoint: <code class="bg-muted px-1 rounded text-xs">{{ connectionStatus.endpoint }}</code></p>
          <p>Response time: {{ connectionStatus.responseTime }}ms</p>
        </div>
      </div>

      <div v-else class="space-y-2">
        <div class="flex items-center gap-2 text-red-500">
          <UIcon name="i-lucide-x-circle" class="w-5 h-5" />
          <span class="font-medium">Connection Failed</span>
        </div>
        <p class="text-sm text-muted-foreground">
          {{ connectionStatus.error || 'All Perpusnas endpoints are unreachable' }}
        </p>
        <UAccordion v-if="endpointErrors.length" :items="[{ label: 'Error details', slot: 'errors' }]">
          <template #errors>
            <ul class="text-xs text-muted-foreground space-y-1">
              <li v-for="(err, idx) in endpointErrors" :key="idx">• {{ err }}</li>
            </ul>
          </template>
        </UAccordion>
        <p class="text-xs text-muted-foreground">
          Note: Perpusnas servers may be slow during peak hours (9am-5pm WIB)
        </p>
      </div>
    </UCard>

    <!-- Search Form -->
    <UCard class="mb-6">
      <template #header>
        <h2 class="font-semibold">Search by ISBN</h2>
      </template>

      <form class="space-y-4" @submit.prevent="searchByIsbn">
        <UFormGroup label="ISBN" hint="Enter Indonesian ISBN (978-602-xxx or 978-623-xxx)">
          <UInput
            v-model="isbn"
            placeholder="e.g., 9786020332093"
            size="lg"
            :disabled="isLoading"
          />
        </UFormGroup>

        <div class="flex items-center gap-4">
          <UButton
            type="submit"
            :loading="isLoading"
            :disabled="!isbn.trim() || !connectionStatus?.available"
            icon="i-lucide-search"
          >
            Search Perpusnas
          </UButton>

          <span class="text-sm text-muted-foreground">or try:</span>
          <div class="flex gap-2 flex-wrap">
            <UButton
              v-for="sample in sampleIsbns"
              :key="sample.isbn"
              size="xs"
              color="gray"
              variant="outline"
              @click="isbn = sample.isbn"
            >
              {{ sample.title }}
            </UButton>
          </div>
        </div>
      </form>
    </UCard>

    <!-- Error Display -->
    <UAlert
      v-if="error"
      color="red"
      variant="subtle"
      icon="i-lucide-alert-circle"
      class="mb-6"
    >
      <template #title>Search Failed</template>
      <template #description>{{ error }}</template>
    </UAlert>

    <!-- Results -->
    <UCard v-if="searchResult" class="mb-6">
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="font-semibold">
            {{ searchResult.found ? 'Book Found' : 'Not Found' }}
          </h2>
          <UBadge :color="searchResult.found ? 'green' : 'yellow'" variant="subtle">
            {{ searchResult.timing.total }}ms
          </UBadge>
        </div>
      </template>

      <!-- Book Details -->
      <div v-if="searchResult.book" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-xs font-medium text-muted-foreground uppercase">Title</label>
            <p class="text-foreground font-medium">{{ searchResult.book.title || 'N/A' }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-muted-foreground uppercase">Authors</label>
            <p class="text-foreground">{{ searchResult.book.authors?.join(', ') || 'N/A' }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-muted-foreground uppercase">Publisher</label>
            <p class="text-foreground">{{ searchResult.book.publisher || 'N/A' }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-muted-foreground uppercase">Year</label>
            <p class="text-foreground">{{ searchResult.book.publishedDate || 'N/A' }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-muted-foreground uppercase">Language</label>
            <p class="text-foreground">{{ searchResult.book.language || 'N/A' }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-muted-foreground uppercase">Publish Place</label>
            <p class="text-foreground">{{ searchResult.book.publishPlace || 'N/A' }}</p>
          </div>
        </div>

        <div v-if="searchResult.book.subjects">
          <label class="text-xs font-medium text-muted-foreground uppercase">Subjects</label>
          <p class="text-foreground">{{ searchResult.book.subjects }}</p>
        </div>
      </div>

      <!-- Not Found -->
      <div v-else class="text-center py-8">
        <UIcon name="i-lucide-book-x" class="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p class="text-muted-foreground">
          ISBN <code class="bg-muted px-1 rounded">{{ searchResult.request.isbn }}</code> 
          was not found in Perpusnas database.
        </p>
        <p class="text-sm text-muted-foreground mt-2">
          {{ searchResult.error }}
        </p>
      </div>

      <!-- Timing Details -->
      <div class="mt-6 pt-4 border-t border-border">
        <h3 class="text-sm font-medium text-muted-foreground mb-2">Performance Metrics</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span class="text-muted-foreground">Total:</span>
            <span class="font-mono ml-1">{{ searchResult.timing.total }}ms</span>
          </div>
          <div>
            <span class="text-muted-foreground">Fetch:</span>
            <span class="font-mono ml-1">{{ searchResult.timing.fetchDuration }}ms</span>
          </div>
          <div>
            <span class="text-muted-foreground">Endpoint:</span>
            <span class="font-mono ml-1 text-xs">{{ searchResult.timing.endpoint }}</span>
          </div>
          <div>
            <span class="text-muted-foreground">Source:</span>
            <span class="font-mono ml-1">{{ searchResult.meta.source }}</span>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Raw JSON (Collapsible) -->
    <UAccordion v-if="searchResult" :items="[{ label: 'Raw API Response', slot: 'raw' }]">
      <template #raw>
        <pre class="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono">{{ JSON.stringify(searchResult, null, 2) }}</pre>
      </template>
    </UAccordion>

    <!-- Info Section -->
    <div class="mt-8 p-4 bg-muted/50 rounded-lg">
      <h3 class="font-medium mb-2">About This Test</h3>
      <ul class="text-sm text-muted-foreground space-y-1">
        <li>• Uses Perpusnas INLIS Lite v3 OAI-PMH endpoint</li>
        <li>• Parses MARCXML format (Library standard)</li>
        <li>• Timeout set to 8 seconds (Perpusnas can be slow)</li>
        <li>• Best coverage for Indonesian publishers (978-602-*, 978-623-*)</li>
        <li>• This page is experimental and won't affect your scan history</li>
      </ul>
    </div>
  </div>
</template>
