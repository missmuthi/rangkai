<script setup lang="ts">
/**
 * BibliographicRecord.vue - Shared SLiMS Record Display
 * Used in Modal and Book Details Page
 */
import type { BookMetadata } from '~/types'
import Button from '@/components/ui/Button.vue'
import { Building2, Users, AlertTriangle, Check, Copy, Sparkles, ExternalLink, Download } from 'lucide-vue-next'

const props = defineProps<{
  book: BookMetadata
  onAiCleanTrigger?: () => void
}>()

const emit = defineEmits<{
  aiClean: []
}>()

// Copy state
const copiedField = ref<string | null>(null)
const isDownloading = ref(false)
const toast = useToast()

async function copyToClipboard(text: string | null | undefined, fieldName: string) {
  if (!text) return
  await navigator.clipboard.writeText(text)
  copiedField.value = fieldName
  setTimeout(() => { copiedField.value = null }, 2000)
}

const downloadFilename = computed(() => {
  const base = props.book.title || props.book.isbn || 'book-cover'
  const slug = base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return slug || 'book-cover'
})

async function downloadCover() {
  if (!props.book.thumbnail || isDownloading.value) return

  isDownloading.value = true
  try {
    const response = await fetch(`/api/image-proxy?url=${encodeURIComponent(props.book.thumbnail)}`)
    if (!response.ok) {
      throw new Error('Failed to fetch cover image')
    }

    const blob = await response.blob()
    const extension = blob.type.split('/')[1] || 'jpg'
    const objectUrl = URL.createObjectURL(blob)

    const anchor = document.createElement('a')
    anchor.href = objectUrl
    anchor.download = `${downloadFilename.value}.${extension}`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(objectUrl)

    toast.add({ title: 'Cover downloaded', color: 'green' })
  } catch (error) {
    console.error('Download cover failed', error)
    toast.add({
      title: 'Download failed',
      description: 'Unable to download the cover right now.',
      color: 'red'
    })
  } finally {
    isDownloading.value = false
  }
}

// Trust badge helpers
const trustBadge = computed(() => {
  if (props.book.classificationTrust === 'high') {
    return { label: 'Library of Congress Verified', icon: Building2, class: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' }
  } else if (props.book.classificationTrust === 'medium') {
    return { label: 'Community Data', icon: Users, class: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' }
  } else {
    return { label: 'Estimated Classification', icon: AlertTriangle, class: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30' }
  }
})

// ISBD formatted publisher string
const publisherString = computed(() => {
  const parts = []
  if (props.book.publishPlace) parts.push(props.book.publishPlace)
  if (props.book.publisher) parts.push(props.book.publisher)
  
  if (props.book.publishedDate) {
    // Safety check: ensure publishedDate is a string before calling match
    const dateStr = String(props.book.publishedDate)
    const year = dateStr.match(/\d{4}/)?.[0]
    if (year) parts.push(year)
  }
  
  return parts.length > 0 ? parts.join(' : ') : props.book.publisher || '-'
})

// Cover image with fallback
const coverUrl = computed(() => {
  if (props.book.thumbnail) {
    return `/api/image-proxy?url=${encodeURIComponent(props.book.thumbnail)}`
  }
  return '/images/no-cover.svg'
})
</script>

<template>
  <div class="grid md:grid-cols-[1fr_280px] gap-8">
    <!-- Left Column: Bibliographic Data -->
    <div class="space-y-1">
      <!-- Title -->
      <div class="grid grid-cols-[140px_1fr] py-2 border-b border-gray-100 dark:border-gray-800">
        <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Title</span>
        <div class="flex items-center gap-2">
          <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ book.title || '-' }}</span>
          <button v-if="book.title" class="p-1 rounded opacity-0 hover:opacity-100 transition-opacity group-hover:opacity-60" @click="copyToClipboard(book.title, 'title')">
            <Check v-if="copiedField === 'title'" class="w-3.5 h-3.5 text-green-500" />
            <Copy v-else class="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      <!-- Series -->
      <div v-if="book.series" class="grid grid-cols-[140px_1fr] py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
        <span class="text-sm font-medium text-muted-foreground">Series</span>
        <span class="text-sm text-gray-900 dark:text-gray-100">{{ book.series }}</span>
      </div>

      <!-- Call Number -->
      <div class="grid grid-cols-[140px_1fr] py-2 border-b border-gray-100 dark:border-gray-800">
        <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Call Number</span>
        <div class="flex items-center gap-2">
          <template v-if="book.callNumber || book.ddc">
            <span class="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-800 dark:text-gray-200">{{ book.callNumber || book.ddc }}</span>
            <button class="p-1 rounded opacity-0 hover:opacity-100 transition-opacity" @click="copyToClipboard(book.callNumber || book.ddc, 'callNumber')">
              <Check v-if="copiedField === 'callNumber'" class="w-3.5 h-3.5 text-green-500" />
              <Copy v-else class="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </template>
          <button v-else class="text-xs text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 font-medium flex items-center gap-1" @click="emit('aiClean')">
            <Sparkles class="w-3 h-3" />
            Generate with AI
          </button>
        </div>
      </div>

      <!-- Publisher (ISBD format) -->
      <div class="grid grid-cols-[140px_1fr] py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
        <span class="text-sm font-medium text-muted-foreground">Publisher</span>
        <span class="text-sm text-gray-900 dark:text-gray-100">{{ publisherString }}</span>
      </div>

      <!-- Collation -->
      <div class="grid grid-cols-[140px_1fr] py-2 border-b border-gray-100 dark:border-gray-800">
        <span class="text-sm font-medium text-muted-foreground">Collation</span>
        <span class="text-sm text-gray-900 dark:text-gray-100">{{ book.collation || (book.pageCount ? `${book.pageCount} p.` : '-') }}</span>
      </div>

      <!-- Language -->
      <div class="grid grid-cols-[140px_1fr] py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
        <span class="text-sm font-medium text-muted-foreground">Language</span>
        <span class="text-sm uppercase text-gray-900 dark:text-gray-100">{{ book.language || '-' }}</span>
      </div>

      <!-- ISBN -->
      <div class="grid grid-cols-[140px_1fr] py-2 border-b border-gray-100 dark:border-gray-800">
        <span class="text-sm font-medium text-muted-foreground">ISBN/ISSN</span>
        <div class="flex items-center gap-2">
          <span class="text-sm font-mono text-gray-900 dark:text-gray-100">{{ book.isbn || '-' }}</span>
          <button v-if="book.isbn" class="p-1 rounded opacity-0 hover:opacity-100 transition-opacity" @click="copyToClipboard(book.isbn, 'isbn')">
            <Check v-if="copiedField === 'isbn'" class="w-3.5 h-3.5 text-green-500" />
            <Copy v-else class="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      <!-- Classification -->
      <div class="grid grid-cols-[140px_1fr] py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
        <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Classification</span>
        <div class="flex items-center gap-2">
          <template v-if="book.ddc">
            <span class="text-sm text-gray-900 dark:text-gray-100">{{ book.ddc }} (DDC)</span>
            <span v-if="trustBadge" :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', trustBadge.class]">
              <component :is="trustBadge.icon" class="w-3 h-3" />
              {{ trustBadge.label }}
            </span>
          </template>
          <button v-else class="text-xs text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 font-medium flex items-center gap-1" @click="emit('aiClean')">
            <AlertTriangle class="w-3 h-3" />
            Missing - Fix with AI
          </button>
        </div>
      </div>

      <!-- Edition -->
      <div v-if="book.edition" class="grid grid-cols-[140px_1fr] py-2 border-b border-gray-100 dark:border-gray-800">
        <span class="text-sm font-medium text-muted-foreground">Edition</span>
        <span class="text-sm text-gray-900 dark:text-gray-100">{{ book.edition }}</span>
      </div>

      <!-- Subjects -->
      <div class="grid grid-cols-[140px_1fr] py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
        <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Subject(s)</span>
        <template v-if="book.subjects">
          <span class="text-sm text-gray-900 dark:text-gray-100">{{ book.subjects }}</span>
        </template>
        <button v-else class="text-xs text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium flex items-center gap-1" @click="emit('aiClean')">
          <Sparkles class="w-3 h-3" />
          Add subjects with AI
        </button>
      </div>

      <!-- Authors -->
      <div class="grid grid-cols-[140px_1fr] py-2 border-b border-gray-100 dark:border-gray-800">
        <span class="text-sm font-medium text-muted-foreground">Author(s)</span>
        <span class="text-sm text-gray-900 dark:text-gray-100">{{ book.authors?.join('; ') || '-' }}</span>
      </div>

      <!-- Description -->
      <div v-if="book.description" class="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
        <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Description</p>
        <p class="text-sm leading-relaxed text-gray-700 dark:text-gray-200">{{ book.description }}</p>
      </div>
    </div>

    <!-- Right Column: Cover & Quick View -->
    <div class="space-y-6">
      <!-- Cover Image -->
      <div class="aspect-[2/3] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
        <img 
          :src="coverUrl" 
          :alt="book.title || 'Book cover'"
          class="w-full h-full object-cover"
          loading="lazy"
        >
      </div>

      <Button
        variant="outline"
        class="w-full justify-center gap-2"
        :disabled="!book.thumbnail || isDownloading"
        @click="downloadCover"
      >
        <Download class="w-4 h-4" />
        <span v-if="isDownloading">Preparing...</span>
        <span v-else-if="book.thumbnail">Download cover</span>
        <span v-else>No cover available</span>
      </Button>

      <!-- Classification Quick View -->
      <div class="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg space-y-3 border border-indigo-100 dark:border-indigo-900/50">
        <div>
          <p class="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-1">DDC</p>
          <div class="bg-white dark:bg-gray-900 rounded px-3 py-2 font-mono text-sm shadow-sm flex justify-between items-center">
            <template v-if="book.ddc">
              <a 
                :href="`https://openlibrary.org/subjects/dewey_decimal_classification:${book.ddc}`" 
                target="_blank" 
                class="hover:underline decoration-indigo-400 underline-offset-2"
              >
                {{ book.ddc }}
              </a>
              <ExternalLink class="w-3 h-3 text-indigo-400" />
            </template>
            <span v-else>—</span>
          </div>
        </div>
        <div>
          <p class="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-1">LCC</p>
          <div class="bg-white dark:bg-gray-900 rounded px-3 py-2 font-mono text-sm shadow-sm">
             {{ book.lcc || '—' }}
          </div>
        </div>
        
        <!-- AI Clean Status -->
        <div v-if="book.isAiEnhanced" class="pt-2 border-t border-indigo-200 dark:border-indigo-800">
           <div class="flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-2 py-1.5 rounded">
             <Sparkles class="w-3.5 h-3.5" />
             AI Cleaned
           </div>
        </div>
      </div>

      <!-- AI History (if enhanced) -->
      <div v-if="book.isAiEnhanced && book.aiLog?.length" class="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-100 dark:border-purple-900/50">
        <p class="text-xs font-medium text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-1">
          <Sparkles class="w-3 h-3" />
          AI Enhancement Log
        </p>
        <ul class="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <!-- Handle aiLog as array of strings or array of objects -->
          <template v-if="Array.isArray(book.aiLog)">
            <li v-for="(entry, i) in book.aiLog.slice(0, 5)" :key="i" class="flex items-start gap-1">
              <span class="text-purple-500">•</span>
              <!-- If entry is a string, show it directly -->
              <span v-if="typeof entry === 'string'">{{ entry }}</span>
              <!-- If entry is an object with changes array, show each change -->
              <span v-else-if="entry?.changes">{{ entry.changes.slice(0, 1).join(', ') }}</span>
              <!-- Fallback for other object structures -->
              <span v-else>{{ JSON.stringify(entry).slice(0, 50) }}</span>
            </li>
          </template>
        </ul>
      </div>
      
      <!-- Slot for extra actions -->
      <slot name="actions" />
    </div>
  </div>
</template>
