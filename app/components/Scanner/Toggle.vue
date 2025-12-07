<script setup lang="ts">
/**
 * Scanner/Toggle.vue
 * Toggle between camera and manual input modes
 */

const props = defineProps<{
  modelValue: 'camera' | 'manual'
}>()

const emit = defineEmits<{
  'update:modelValue': [mode: 'camera' | 'manual']
}>()

const mode = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
</script>

<template>
  <div class="flex items-center justify-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
    <!-- Camera Mode -->
    <button
      type="button"
      class="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all"
      :class="mode === 'camera' 
        ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'"
      aria-label="Switch to Camera Mode"
      @click="mode = 'camera'"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <span class="hidden sm:inline">Camera</span>
    </button>

    <!-- Manual Mode -->
    <button
      type="button"
      class="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all"
      :class="mode === 'manual' 
        ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'"
      aria-label="Switch to Manual Input Mode"
      @click="mode = 'manual'"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
      <span class="hidden sm:inline">Manual</span>
    </button>
  </div>
</template>
