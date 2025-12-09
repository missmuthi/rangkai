<script setup lang="ts">
import BibliographicRecord from '~/components/BibliographicRecord.vue'
import { ArrowLeft, Sparkles, Edit } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Skeleton from '@/components/ui/Skeleton.vue'

const route = useRoute()
const isbn = computed(() => route.params.isbn as string)

const { book, scanId, loading, error, searchByISBN, cleanMetadata } = useBookSearch()
const isCleaning = ref(false)
const loadingStep = ref('')
const cooldown = ref(0)
const cleanError = ref<string | null>(null)
const showDebug = ref(false)
let cooldownTimer: NodeJS.Timeout

// Keyboard shortcuts - Ctrl+Enter for AI Clean
useKeyboardShortcuts({
  onAiClean: () => {
    if (!isCleaning.value && book.value && cooldown.value <= 0) {
      handleAiClean()
    }
  }
})

// Steps for AI loader
const STEPS = [
  'Searching OpenLibrary sources...',
  'Extracting bibliographic metadata...',
  'Standardizing titles and authors...',
  'Generating LCC/DDC classifications...',
  'Finalizing record...'
]

// Determine if saved based on scanId existence
const isSaved = computed(() => !!scanId.value)

onMounted(async () => {
  if (isbn.value) {
    await searchByISBN(isbn.value)
  }
})

// Cleanup timer
onUnmounted(() => {
  if (cooldownTimer) clearInterval(cooldownTimer)
})

function startCooldown() {
  cooldown.value = 10
  cooldownTimer = setInterval(() => {
    cooldown.value--
    if (cooldown.value <= 0) clearInterval(cooldownTimer)
  }, 1000)
}

async function handleAiClean() {
  if (!book.value || cooldown.value > 0) return
  
  isCleaning.value = true
  cleanError.value = null
  let stepIdx = 0
  loadingStep.value = STEPS[0]
  
  // Cycle steps
  const stepInterval = setInterval(() => {
    stepIdx = (stepIdx + 1) % STEPS.length
    loadingStep.value = STEPS[stepIdx]
  }, 1500)
  
  try {
    console.log('[Book Details] Calling AI clean with:', book.value.isbn)
    const cleaned = await cleanMetadata(book.value)
    console.log('[Book Details] AI clean successful:', cleaned)
    
    // OPTIMISTIC: Update UI immediately after AI returns
    book.value = { ...book.value, ...cleaned, isAiEnhanced: true }
    clearInterval(stepInterval)
    isCleaning.value = false
    startCooldown()
    
    // Background save (don't block UI)
    const savePromise = scanId.value
      ? $fetch(`/api/scans/${scanId.value}`, { method: 'PATCH', body: cleaned })
      : $fetch<{ id: string }>('/api/scans', { method: 'POST', body: cleaned })
    
    savePromise
      .then((result) => {
        if (!scanId.value && result?.id) scanId.value = result.id
        console.log('[Book Details] Background save complete')
      })
      .catch((saveErr) => {
        console.error('[Book Details] Background save failed:', saveErr)
        // Show warning toast but don't rollback - data is good locally
        const toast = useToast()
        toast.add({
          title: 'Sync warning',
          description: 'Changes saved locally but not synced to server.',
          color: 'yellow'
        })
      })
  } catch (err: any) {
    console.error('[Book Details] AI clean failed:', err)
    
    // Extract the most informative error message
    let errorMsg = 'AI enhancement failed. Please try again.'
    
    if (err.data?.message) {
      errorMsg = err.data.message
    } else if (err.message) {
      errorMsg = err.message
    } else if (err.statusMessage) {
      errorMsg = err.statusMessage
    }
    
    // Add helpful context based on error type
    if (errorMsg.includes('GROQ_API_KEY')) {
      errorMsg += ' (Configuration issue - please contact administrator)'
    } else if (errorMsg.includes('rate limit')) {
      errorMsg += ' (Too many requests - please wait a moment)'
    } else if (errorMsg.includes('502') || errorMsg.includes('Service')) {
      errorMsg += ' (External service issue - please try again later)'
    }
    
    cleanError.value = errorMsg
  } finally {
    clearInterval(stepInterval)
    isCleaning.value = false
  }
}

function handleEdit() {
  alert('Manual editing is coming soon to Rangkai!')
}

function copyDebug() {
  if (book.value) {
    navigator.clipboard.writeText(JSON.stringify(book.value, null, 2))
    alert('Debug info copied to clipboard!')
  }
}
</script>

<template>
  <div class="container mx-auto p-4 max-w-5xl min-h-screen py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-4">
        <Button variant="ghost" size="icon" @click="$router.back()">
          <ArrowLeft class="h-5 w-5" />
        </Button>
        <h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Book Details</h1>
        
        <!-- Saved Badge (Personalized - ClientOnly to avoid SWR caching) -->
        <ClientOnly>
          <span v-if="isSaved" class="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
            ✓ Saved to Library
          </span>
          <template #fallback>
            <div class="hidden sm:block h-6 w-28 bg-muted/40 animate-pulse rounded-full" />
          </template>
        </ClientOnly>
      </div>
      
      <!-- Action Buttons (Personalized - ClientOnly) -->
      <ClientOnly>
        <div class="flex items-center gap-2">
           <Button 
            variant="outline" 
            size="sm"
            class="gap-2"
            @click="handleEdit"
          >
            <Edit class="w-4 h-4" />
            Edit
          </Button>
          <Button 
            v-if="book" 
            :variant="book.isAiEnhanced ? 'secondary' : 'default'"
            size="sm"
            :class="[
              'gap-2 min-w-[140px] transition-all duration-300',
              !book.isAiEnhanced && !isCleaning && cooldown === 0 ? 'shadow-[0_0_20px_rgba(99,102,241,0.5),0_0_40px_rgba(99,102,241,0.2)] animate-pulse' : ''
            ]"
            :disabled="isCleaning || cooldown > 0"
            @click="handleAiClean"
          >
            <Sparkles class="w-4 h-4" :class="{ 'animate-pulse': isCleaning }" />
            <span v-if="isCleaning">Cleaning...</span>
            <span v-else-if="cooldown > 0">Wait {{ cooldown }}s</span>
            <span v-else-if="book.isAiEnhanced">Re-Clean</span>
            <span v-else>AI Clean</span>
          </Button>
        </div>
        <template #fallback>
          <div class="flex items-center gap-2">
            <div class="h-9 w-20 bg-muted/40 animate-pulse rounded-md" />
            <div class="h-9 w-32 bg-muted/40 animate-pulse rounded-md" />
          </div>
        </template>
      </ClientOnly>
    </div>

    <!-- STATUS OVERLAY (DEBUG) -->
    <div class="fixed bottom-4 right-4 z-50 p-4 bg-black/80 text-white text-xs font-mono rounded shadow-lg pointer-events-auto">
      <p>Loaded: {{ !!book }}</p>
      <p>Loading: {{ loading }}</p>
      <p>Clean: {{ isCleaning }}</p>
      <p>Err: {{ !!error }}</p>
      <p>ISBN: {{ isbn }}</p>
      <button class="mt-2 underline text-yellow-400" @click="showDebug = !showDebug">Toggle JSON</button>
    </div>

    <!-- Debug Section (Unconditional) -->
    <div v-if="showDebug" class="fixed inset-0 z-50 bg-black/90 text-green-400 p-8 overflow-auto font-mono text-xs">
      <button class="absolute top-4 right-4 text-white text-lg" @click="showDebug = false">✕</button>
      <pre>{{ JSON.stringify({ book, loading, error, cleanError }, null, 2) }}</pre>
    </div>

    <div v-if="loading" class="flex items-center justify-center p-12">
      <div class="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
    </div>

    <!-- Generative UI Loader -->
    <div v-else-if="isCleaning" class="p-8 bg-white dark:bg-gray-900 rounded-xl border border-indigo-100 dark:border-indigo-900/50 shadow-lg space-y-6 max-w-2xl mx-auto my-12">
       <div class="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 animate-pulse">
         <Sparkles class="w-5 h-5" />
         <span class="font-medium text-lg">{{ loadingStep }}</span>
       </div>
       <div class="space-y-3">
         <Skeleton class="h-4 w-3/4 bg-indigo-50 dark:bg-indigo-900/20" />
         <Skeleton class="h-4 w-1/2 bg-indigo-50 dark:bg-indigo-900/20" />
         <Skeleton class="h-32 w-full bg-indigo-50 dark:bg-indigo-900/20 rounded-lg" />
       </div>
    </div>

    <!-- AI Error Display -->
    <div v-else-if="cleanError" class="p-6 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg border border-amber-200 dark:border-amber-900/30 max-w-2xl mx-auto my-12">
      <!-- ... error content ... -->
       <p>{{ cleanError }}</p>
       <button class="mt-2 underline" @click="cleanError = null">Dismiss</button>
    </div>

    <div v-else-if="error" class="p-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-900/30">
      <p class="font-medium">Error loading book</p>
      <p class="text-sm mt-1">{{ error }}</p>
    </div>

    <div v-else-if="book" class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 md:p-8">
      <!-- Mobile Saved Badge (ClientOnly) -->
      <ClientOnly>
        <div v-if="isSaved" class="sm:hidden mb-6 flex items-center justify-center">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-100 dark:border-green-900/50">
            ✓ Saved to Library
          </span>
        </div>
        <template #fallback>
          <div class="sm:hidden mb-6 flex items-center justify-center">
            <div class="h-7 w-36 bg-muted/40 animate-pulse rounded-full" />
          </div>
        </template>
      </ClientOnly>

      <BibliographicRecord :book="book" @ai-clean="handleAiClean" />
    </div>

    <div v-else class="text-center text-muted-foreground py-12">
      No book found specifically for ISBN {{ isbn }}
    </div>

    <!-- Debug Section -->
    <div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
      <button 
        class="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 underline" 
        @click="showDebug = !showDebug"
      >
        {{ showDebug ? 'Hide Debug Info' : 'Show Debug Info' }}
      </button>
      
      <div v-if="showDebug" class="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-auto max-h-96 font-mono text-xs text-gray-700 dark:text-gray-300">
        <div class="flex justify-between items-center mb-2">
          <span class="font-bold">Raw Book Data:</span>
          <button class="text-indigo-600 hover:underline" @click="copyDebug">Copy JSON</button>
        </div>
        <pre>{{ JSON.stringify(book, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>
