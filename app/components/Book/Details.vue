<script setup lang="ts">
import type { BookMetadata } from '~/types/book'
// import { cn } from '~/utils/cn' unused

const props = defineProps<{
  book: BookMetadata | null
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [book: BookMetadata]
}>()

const localBook = ref<BookMetadata | null>(null)
const saving = ref(false)

// Sync local copy when book changes
watch(() => props.book, (newBook) => {
  if (newBook) {
    localBook.value = { ...newBook }
  }
}, { immediate: true })

// Handle author input (comma-separated)
const authorsInput = computed({
  get: () => localBook.value?.authors?.join(', ') || '',
  set: (value: string) => {
    if (localBook.value) {
      localBook.value.authors = value.split(',').map(a => a.trim()).filter(Boolean)
    }
  }
})

async function handleSave() {
  if (!localBook.value) return

  saving.value = true
  try {
    emit('save', localBook.value)
  } finally {
    saving.value = false
  }
}

function handleClose() {
  emit('close')
}

// Close on Escape key
onMounted(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.open) {
      handleClose()
    }
  }
  document.addEventListener('keydown', handler)
  onUnmounted(() => document.removeEventListener('keydown', handler))
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open && book"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50"
          @click="handleClose"
        />

        <!-- Modal Content -->
        <div
          class="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <!-- Header -->
          <div class="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex justify-between items-center">
            <h2 class="text-xl font-semibold">Edit Book Details</h2>
            <button
              class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              @click="handleClose"
            >
              ✕
            </button>
          </div>

          <!-- Form -->
          <form v-if="localBook" class="p-6 space-y-4" @submit.prevent="handleSave">
            <!-- Cover & Basic Info -->
            <div class="flex gap-6">
              <div class="w-32 flex-shrink-0">
                <NuxtImg
                  v-if="localBook.thumbnail"
                  :src="localBook.thumbnail"
                  :alt="localBook.title || 'Book cover'"
                  class="w-full rounded-lg shadow"
                  width="128"
                  provider="ipx"
                  placeholder
                />
                <div v-else class="w-full aspect-[2/3] bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <span class="text-gray-400">No Cover</span>
                </div>
              </div>

              <div class="flex-1 space-y-4">
                <div>
                  <label class="block text-sm font-medium mb-1">Title</label>
                  <input
                    v-model="localBook.title"
                    type="text"
                    class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium mb-1">Authors (comma-separated)</label>
                  <input
                    v-model="authorsInput"
                    type="text"
                    class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium mb-1">ISBN</label>
                  <input
                    v-model="localBook.isbn"
                    type="text"
                    readonly
                    class="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-600 dark:border-gray-600"
                  >
                </div>
              </div>
            </div>

            <!-- Publisher & Date -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Publisher</label>
                <input
                  v-model="localBook.publisher"
                  type="text"
                  class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Published Date</label>
                <input
                  v-model="localBook.publishedDate"
                  type="text"
                  class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
              </div>
            </div>

            <!-- Page Count & Language -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Page Count</label>
                <input
                  v-model.number="localBook.pageCount"
                  type="number"
                  class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Language</label>
                <input
                  v-model="localBook.language"
                  type="text"
                  class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium mb-1">Description</label>
              <textarea
                v-model="localBook.description"
                rows="4"
                class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 resize-none"
              />
            </div>

            <!-- Source Info -->
            <div class="text-sm text-gray-500 dark:text-gray-400">
              <span v-if="localBook?.source">Source: {{ localBook.source }}</span>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
              <button
                type="button"
                class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                @click="handleClose"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {{ saving ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
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

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.2s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
}
</style>
