<script setup lang="ts">
/**
 * Scanner/Manual.vue
 * Manual ISBN/title input fallback when camera isn't available
 */

const emit = defineEmits<{
  search: [query: string]
}>()

const inputValue = ref('')
const inputType = ref<'isbn' | 'title'>('isbn')

const isValidISBN = computed(() => {
  if (inputType.value !== 'isbn') return true
  const cleaned = inputValue.value.replace(/[-\s]/g, '')
  return /^(97[89])?\d{9}[\dXx]$/.test(cleaned)
})

function handleSubmit() {
  if (!inputValue.value.trim()) return
  
  if (inputType.value === 'isbn') {
    const normalizedISBN = inputValue.value.replace(/[-\s]/g, '')
    emit('search', normalizedISBN)
  } else {
    emit('search', inputValue.value.trim())
  }
}

function clearInput() {
  inputValue.value = ''
}
</script>

<template>
  <div class="space-y-4">
    <!-- Input Type Toggle -->
    <div class="flex gap-2">
      <button
        type="button"
        class="flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
        :class="inputType === 'isbn' 
          ? 'bg-indigo-600 text-white' 
          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
        @click="inputType = 'isbn'"
      >
        ISBN
      </button>
      <button
        type="button"
        class="flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
        :class="inputType === 'title' 
          ? 'bg-indigo-600 text-white' 
          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
        @click="inputType = 'title'"
      >
        Title
      </button>
    </div>

    <!-- Input Field -->
    <form class="relative" @submit.prevent="handleSubmit">
      <input
        v-model="inputValue"
        :type="inputType === 'isbn' ? 'text' : 'search'"
        :placeholder="inputType === 'isbn' ? 'Enter ISBN (e.g., 978-0-13-468599-1)' : 'Enter book title...'"
        :inputmode="inputType === 'isbn' ? 'numeric' : 'text'"
        class="w-full px-4 py-3 pr-20 border rounded-lg dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        :class="{ 'border-red-500': inputType === 'isbn' && inputValue && !isValidISBN }"
      >
      
      <!-- Clear Button -->
      <button
        v-if="inputValue"
        type="button"
        class="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        @click="clearInput"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="!inputValue.trim() || (inputType === 'isbn' && !isValidISBN)"
        class="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>

    <!-- Validation Hint -->
    <p 
      v-if="inputType === 'isbn' && inputValue && !isValidISBN" 
      class="text-sm text-red-500"
    >
      Please enter a valid ISBN-10 or ISBN-13
    </p>
  </div>
</template>
