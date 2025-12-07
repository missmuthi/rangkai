<script setup lang="ts">
/**
 * BiblioModal.vue - SLiMS Bibliographic Record Display
 * Two-column layout with classification trust badges and ISBD formatting
 */
import type { BookMetadata } from '~/types'
import { X, Building2, Users, AlertTriangle, Sparkles, Copy, Check } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'

const props = defineProps<{
  book: BookMetadata
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  clean: []
}>()

// Copy state
const copiedField = ref<string | null>(null)

async function copyToClipboard(text: string | null | undefined, fieldName: string) {
  if (!text) return
  await navigator.clipboard.writeText(text)
  copiedField.value = fieldName
  setTimeout(() => { copiedField.value = null }, 2000)
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
    const year = props.book.publishedDate.match(/\d{4}/)?.[0]
    if (year) parts.push(year)
  }
  return parts.length > 0 ? parts.join(' : ') : props.book.publisher || '-'
})

// Cover image with fallback
const coverUrl = computed(() => {
  return props.book.thumbnail || '/placeholder-book.svg'
})

// Handle escape key
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="emit('close')" />
        
        <!-- Modal Content -->
        <div class="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <!-- Header -->
          <div class="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <h2 class="text-xl font-bold text-white">Bibliographic Record</h2>
              <span v-if="book.isAiEnhanced" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white">
                <Sparkles class="w-3 h-3" />
                AI Enhanced
              </span>
              <button 
                v-else 
                @click="$emit('clean')"
                class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm ml-2"
              >
                <Sparkles class="w-3 h-3" />
                AI Clean
              </button>
            </div>
            <button @click="$emit('close')" class="p-1 rounded-full hover:bg-white/20 transition-colors">
              <X class="w-5 h-5 text-white" />
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div class="grid md:grid-cols-[1fr_280px] gap-8">
              <!-- Left Column: Bibliographic Data -->
              <div class="space-y-1">
                <!-- Title -->
                <div class="grid grid-cols-[140px_1fr] py-2 border-b border-gray-100 dark:border-gray-800">
                  <span class="text-sm font-medium text-muted-foreground">Title</span>
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold">{{ book.title || '-' }}</span>
                    <button v-if="book.title" @click="copyToClipboard(book.title, 'title')" class="p-1 rounded opacity-0 hover:opacity-100 transition-opacity group-hover:opacity-60">
                      <Check v-if="copiedField === 'title'" class="w-3.5 h-3.5 text-green-500" />
                      <Copy v-else class="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                <!-- Series -->
                <div v-if="book.series" class="grid grid-cols-[140px_1fr] py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                  <span class="text-sm font-medium text-muted-foreground">Series</span>
                  <span class="text-sm">{{ book.series }}</span>
                </div>

                <!-- Call Number -->
                <div class="grid grid-cols-[140px_1fr] py-2 border-b border-gray-100 dark:border-gray-800">
                  <span class="text-sm font-medium text-muted-foreground">Call Number</span>
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{{ book.callNumber || book.ddc || '-' }}</span>
                    <button v-if="book.callNumber || book.ddc" @click="copyToClipboard(book.callNumber || book.ddc, 'callNumber')" class="p-1 rounded opacity-0 hover:opacity-100 transition-opacity">
                      <Check v-if="copiedField === 'callNumber'" class="w-3.5 h-3.5 text-green-500" />
                      <Copy v-else class="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                <!-- Publisher (ISBD format) -->
                <div class="grid grid-cols-[140px_1fr] py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                  <span class="text-sm font-medium text-muted-foreground">Publisher</span>
                  <span class="text-sm">{{ publisherString }}</span>
                </div>

                <!-- Collation -->
                <div class="grid grid-cols-[140px_1fr] py-2 border-b border-gray-100 dark:border-gray-800">
                  <span class="text-sm font-medium text-muted-foreground">Collation</span>
                  <span class="text-sm">{{ book.collation || (book.pageCount ? `${book.pageCount} p.` : '-') }}</span>
                </div>

                <!-- Language -->
                <div class="grid grid-cols-[140px_1fr] py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                  <span class="text-sm font-medium text-muted-foreground">Language</span>
                  <span class="text-sm uppercase">{{ book.language || '-' }}</span>
                </div>

                <!-- ISBN -->
                <div class="grid grid-cols-[140px_1fr] py-2 border-b border-gray-100 dark:border-gray-800">
                  <span class="text-sm font-medium text-muted-foreground">ISBN/ISSN</span>
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-mono">{{ book.isbn || '-' }}</span>
                    <button v-if="book.isbn" @click="copyToClipboard(book.isbn, 'isbn')" class="p-1 rounded opacity-0 hover:opacity-100 transition-opacity">
                      <Check v-if="copiedField === 'isbn'" class="w-3.5 h-3.5 text-green-500" />
                      <Copy v-else class="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                <!-- Classification -->
                <div class="grid grid-cols-[140px_1fr] py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                  <span class="text-sm font-medium text-muted-foreground">Classification</span>
                  <div class="flex items-center gap-2">
                    <span class="text-sm">{{ book.ddc ? `${book.ddc} (DDC)` : '-' }}</span>
                    <span v-if="trustBadge" :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', trustBadge.class]">
                      <component :is="trustBadge.icon" class="w-3 h-3" />
                      {{ trustBadge.label }}
                    </span>
                  </div>
                </div>

                <!-- Edition -->
                <div v-if="book.edition" class="grid grid-cols-[140px_1fr] py-2 border-b border-gray-100 dark:border-gray-800">
                  <span class="text-sm font-medium text-muted-foreground">Edition</span>
                  <span class="text-sm">{{ book.edition }}</span>
                </div>

                <!-- Subjects -->
                <div v-if="book.subjects" class="grid grid-cols-[140px_1fr] py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                  <span class="text-sm font-medium text-muted-foreground">Subject(s)</span>
                  <span class="text-sm">{{ book.subjects }}</span>
                </div>

                <!-- Authors -->
                <div class="grid grid-cols-[140px_1fr] py-2 border-b border-gray-100 dark:border-gray-800">
                  <span class="text-sm font-medium text-muted-foreground">Author(s)</span>
                  <span class="text-sm">{{ book.authors?.join('; ') || '-' }}</span>
                </div>

                <!-- Description -->
                <div v-if="book.description" class="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <p class="text-xs font-medium text-muted-foreground mb-2">Description</p>
                  <p class="text-sm text-gray-700 dark:text-gray-300 line-clamp-4">{{ book.description }}</p>
                </div>
              </div>

              <!-- Right Column: Cover & Quick View -->
              <div class="space-y-6">
                <!-- Cover Image -->
                <div class="aspect-[2/3] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                  <img 
                    :src="coverUrl" 
                    :alt="book.title || 'Book cover'"
                    class="w-full h-full object-cover"
                    @error="(e: Event) => (e.target as HTMLImageElement).src = '/placeholder-book.svg'"
                  />
                </div>

                <!-- Classification Quick View -->
                <div class="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg space-y-3">
                  <div>
                    <p class="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-1">DDC</p>
                    <div class="bg-white dark:bg-gray-900 rounded px-3 py-2 font-mono text-sm">
                      {{ book.ddc || '—' }}
                    </div>
                  </div>
                  <div>
                    <p class="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-1">LCC</p>
                    <div class="bg-white dark:bg-gray-900 rounded px-3 py-2 font-mono text-sm">
                      {{ book.lcc || '—' }}
                    </div>
                  </div>
                </div>

                <!-- AI History (if enhanced) -->
                <div v-if="book.isAiEnhanced && book.aiLog?.length" class="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                  <p class="text-xs font-medium text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-1">
                    <Sparkles class="w-3 h-3" />
                    AI Enhancement Log
                  </p>
                  <ul class="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <li v-for="(change, i) in book.aiLog[book.aiLog.length - 1]?.changes.slice(0, 3)" :key="i" class="flex items-start gap-1">
                      <span class="text-purple-500">•</span>
                      <span>{{ change }}</span>
                    </li>
                  </ul>
                </div>

                <!-- Actions -->
                <div class="space-y-2">
                  <Button variant="outline" class="w-full" @click="emit('close')">
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div:last-child,
.modal-leave-active > div:last-child {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-enter-from > div:last-child,
.modal-leave-to > div:last-child {
  transform: scale(0.95);
  opacity: 0;
}
</style>
