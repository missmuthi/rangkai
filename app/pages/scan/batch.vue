<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const router = useRouter()
const toast = useToast()
const { book, searchByISBN, cleanMetadata } = useBookSearch()

// Input state
const rawInput = ref('')
const autoClean = ref(true)

// Queue state
const isbnQueue = ref<string[]>([])
const isProcessing = ref(false)
const processProgress = ref(0)
const processedCount = ref(0)

// ISBN regex pattern
const ISBN_PATTERN = /(?:97[89])?\d{9}[\dXx]/g

// Parse ISBNs from raw input
function parseISBNs() {
  const text = rawInput.value.replace(/[-\s]/g, '') // Remove hyphens and spaces
  const matches = text.match(ISBN_PATTERN) || []
  
  // Deduplicate
  const unique = [...new Set(matches.map(isbn => isbn.toUpperCase()))]
  isbnQueue.value = unique
}

// Watch input and auto-parse
watch(rawInput, () => {
  parseISBNs()
})

function clearQueue() {
  rawInput.value = ''
  isbnQueue.value = []
}

function removeISBN(isbn: string) {
  isbnQueue.value = isbnQueue.value.filter(i => i !== isbn)
}

async function processQueue() {
  if (isbnQueue.value.length === 0) return
  
  isProcessing.value = true
  processProgress.value = 0
  processedCount.value = 0
  const total = isbnQueue.value.length
  
  for (const isbn of isbnQueue.value) {
    try {
      await searchByISBN(isbn)
      if (autoClean.value && book.value) {
        await cleanMetadata(book.value)
      }
      processedCount.value++
      processProgress.value = Math.round((processedCount.value / total) * 100)
    } catch (err) {
      console.error(`Failed to process ${isbn}:`, err)
      // Continue with others
    }
  }
  
  toast.add({
    title: 'Batch complete!',
    description: `Processed ${processedCount.value} of ${total} books`,
    color: 'green'
  })
  
  isbnQueue.value = []
  isProcessing.value = false
  router.push('/history')
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-2xl">
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/scan/mobile" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        <component :is="resolveComponent('LucideArrowLeft')" class="w-5 h-5" />
      </NuxtLink>
      <h1 class="text-2xl font-bold">Smart Batch Mode</h1>
    </div>

    <p class="text-gray-600 dark:text-gray-400 mb-6">
      Paste a list of ISBNs (one per line, comma-separated, or mixed). We'll extract and process them all.
    </p>

    <!-- Input Section -->
    <div class="space-y-4">
      <textarea
        v-model="rawInput"
        :disabled="isProcessing"
        rows="6"
        class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
        placeholder="978-0-13-468599-1
9780134685991
0-13-468599-X, 0134685997
..."
      />

      <!-- Controls -->
      <div class="flex items-center justify-between">
        <label class="flex items-center gap-2 cursor-pointer">
          <input v-model="autoClean" type="checkbox" class="rounded">
          <span class="text-sm">Auto AI Clean</span>
        </label>
        
        <span class="text-sm text-gray-500">
          {{ isbnQueue.length }} valid ISBN{{ isbnQueue.length === 1 ? '' : 's' }} found
        </span>
      </div>
    </div>

    <!-- Queue Preview -->
    <div v-if="isbnQueue.length > 0" class="mt-6 space-y-3">
      <div class="flex justify-between items-center">
        <span class="font-medium text-green-600 dark:text-green-400">
          Ready to process
        </span>
        <button 
          class="text-sm text-red-500 hover:text-red-400"
          :disabled="isProcessing"
          @click="clearQueue"
        >
          Clear All
        </button>
      </div>

      <!-- ISBN List -->
      <div class="max-h-48 overflow-y-auto space-y-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
        <div 
          v-for="isbn in isbnQueue" 
          :key="isbn"
          class="flex justify-between items-center text-sm font-mono py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <span>{{ isbn }}</span>
          <button 
            class="text-gray-400 hover:text-red-500 px-1"
            :disabled="isProcessing"
            @click="removeISBN(isbn)"
          >
            ×
          </button>
        </div>
      </div>

      <!-- Process Button -->
      <button 
        :disabled="isProcessing || isbnQueue.length === 0"
        class="w-full py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-400 text-white rounded-lg font-bold text-lg transition-colors"
        @click="processQueue"
      >
        <span v-if="isProcessing">
          Processing... {{ processProgress }}% ({{ processedCount }}/{{ isbnQueue.length }})
        </span>
        <span v-else>
          🚀 Process {{ isbnQueue.length }} Book{{ isbnQueue.length === 1 ? '' : 's' }}
        </span>
      </button>
    </div>

    <!-- Empty State -->
    <div v-else class="mt-8 text-center text-gray-500 dark:text-gray-400 py-8">
      <p class="text-4xl mb-3">📋</p>
      <p>Paste ISBNs above to get started</p>
    </div>

    <!-- Quick Link -->
    <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
      <NuxtLink 
        to="/scan/mobile" 
        class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-green-500"
      >
        <component :is="resolveComponent('LucideCamera')" class="w-4 h-4" />
        Prefer camera scanning? Use Rapid Fire mode
      </NuxtLink>
    </div>
  </div>
</template>
