<script setup lang="ts">
/**
 * BiblioModal.vue - SLiMS Bibliographic Record Display
 * Two-column layout with classification trust badges and ISBD formatting
 */
import type { BookMetadata } from '~/types'
import BibliographicRecord from '~/components/BibliographicRecord.vue'
import { X, Sparkles } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'

const props = defineProps<{
  book: BookMetadata
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  clean: []
}>()

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
        <div class="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <!-- Header -->
          <div class="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between shrink-0">
            <div class="flex items-center gap-3">
              <h2 class="text-xl font-bold text-white">Bibliographic Record</h2>
              <span v-if="book.isAiEnhanced" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white">
                <Sparkles class="w-3 h-3" />
                AI Enhanced
              </span>
              <button 
                v-else 
                class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm ml-2"
                @click="$emit('clean')"
              >
                <Sparkles class="w-3 h-3" />
                AI Clean
              </button>
            </div>
            <button class="p-1 rounded-full hover:bg-white/20 transition-colors" @click="$emit('close')">
              <X class="w-5 h-5 text-white" />
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto min-h-0">
            <BibliographicRecord :book="book">
              <template #actions>
                 <div class="space-y-2">
                  <Button variant="outline" class="w-full" @click="emit('close')">
                    Close
                  </Button>
                </div>
              </template>
            </BibliographicRecord>
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
