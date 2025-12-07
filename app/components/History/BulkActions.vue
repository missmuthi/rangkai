<script setup lang="ts">
/**
 * History/BulkActions.vue
 * Multi-select actions for scan history
 */
import type { Scan } from '~/types'

const props = defineProps<{
  selectedIds: string[]
  totalCount: number
}>()

const emit = defineEmits<{
  selectAll: []
  clearSelection: []
  deleteSelected: []
  exportSelected: []
}>()

const selectedCount = computed(() => props.selectedIds.length)
const allSelected = computed(() => selectedCount.value === props.totalCount && props.totalCount > 0)
</script>

<template>
  <div 
    v-if="selectedCount > 0"
    class="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-lg p-3 flex items-center justify-between"
  >
    <div class="flex items-center gap-3">
      <!-- Checkbox -->
      <input
        type="checkbox"
        :checked="allSelected"
        :indeterminate="selectedCount > 0 && !allSelected"
        class="w-4 h-4 text-indigo-600 rounded"
        @change="allSelected ? emit('clearSelection') : emit('selectAll')"
      >
      
      <!-- Count -->
      <span class="text-sm text-indigo-700 dark:text-indigo-300">
        {{ selectedCount }} of {{ totalCount }} selected
      </span>
    </div>

    <div class="flex items-center gap-2">
      <!-- Export Button -->
      <button
        type="button"
        class="px-3 py-1.5 text-sm font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-800 rounded-lg transition-colors"
        @click="emit('exportSelected')"
      >
        <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export
      </button>

      <!-- Delete Button -->
      <button
        type="button"
        class="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
        @click="emit('deleteSelected')"
      >
        <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete
      </button>

      <!-- Clear Selection -->
      <button
        type="button"
        class="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        @click="emit('clearSelection')"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>
