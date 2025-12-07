<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'scanner'
})

const { book, loading, error, searchByISBN, cleanMetadata } = useBookSearch()
const { addScan } = useHistory()
const { startScanner, stopScanner } = useScanner()

const scannerRef = ref<HTMLElement | null>(null)
const lastScan = ref('')
const lastScanAt = ref(0)
const autoClean = ref(true)
const saveStatus = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')

async function onScanSuccess(decodedText: string) {
  // Debounce duplicates (3 second window)
  if (decodedText === lastScan.value && Date.now() - lastScanAt.value < 3000) {
    return
  }
  lastScan.value = decodedText
  lastScanAt.value = Date.now()

  // Normalize ISBN (remove hyphens/spaces)
  const isbn = decodedText.replace(/[-\s]/g, '')

  // Validate ISBN format
  if (!/^(97[89])?\d{9}[\dXx]$/.test(isbn)) {
    return
  }

  // Fetch metadata
  await searchByISBN(isbn)

  // Auto-clean if enabled
  if (autoClean.value && book.value) {
    book.value = await cleanMetadata(book.value)
  }
}

async function saveCurrentBook() {
  if (!book.value) return

  saveStatus.value = 'saving'
  try {
    await addScan({
      isbn: book.value.isbn || '',
      title: book.value.title || '',
      authors: book.value.authors?.join('; ') || '',
      publisher: book.value.publisher || '',
      status: 'complete',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    saveStatus.value = 'saved'
    setTimeout(() => {
      book.value = null
      saveStatus.value = 'idle'
    }, 1500)
  } catch {
    saveStatus.value = 'error'
  }
}

onMounted(() => {
  if (scannerRef.value) {
    // Start scanner when mounted
    startScanner('scanner-reader', onScanSuccess, (err) => console.warn(err))
  }
})
// onUnmounted is handled by useScanner composable
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <!-- Scanner Viewport -->
    <div class="relative">
      <div id="scanner-reader" ref="scannerRef" class="w-full aspect-[4/3]" />

      <!-- Scan Overlay -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-24 border-2 border-green-400 rounded-lg" />
      </div>
    </div>

    <!-- Controls -->
    <div class="p-4 space-y-4">
      <label class="flex items-center gap-2">
        <input v-model="autoClean" type="checkbox" class="rounded" >
        <span>Auto-clean metadata with AI</span>
      </label>
    </div>

    <!-- Result Panel -->
    <div v-if="loading" class="p-4">
      <div class="animate-pulse bg-gray-800 h-32 rounded-lg" />
    </div>

    <div v-else-if="error" class="p-4">
      <div class="bg-red-900/50 text-red-300 p-4 rounded-lg">
        {{ error }}
      </div>
    </div>

    <div v-else-if="book" class="p-4">
      <BookCard :book="book" :show-actions="true" @save="saveCurrentBook" />

      <div v-if="saveStatus === 'saved'" class="mt-4 text-green-400 text-center">
        ✓ Saved to history
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="fixed bottom-0 inset-x-0 bg-gray-800 p-4 flex justify-between text-sm">
      <span>Last: {{ lastScan || '—' }}</span>
      <NuxtLink to="/history" class="text-indigo-400">View History →</NuxtLink>
    </div>
  </div>
</template>
