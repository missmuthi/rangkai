<script setup lang="ts">
/**
 * History/Filters.vue
 * Filter controls for scan history
 */

const emit = defineEmits<{
  filter: [filters: { status?: string; dateRange?: string; search?: string }]
}>()

const status = ref('')
const dateRange = ref('')
const search = ref('')

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'complete', label: 'Complete' },
  { value: 'pending', label: 'Pending' },
  { value: 'error', label: 'Error' }
]

const dateOptions = [
  { value: '', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' }
]

// Emit changes
watch([status, dateRange, search], () => {
  emit('filter', {
    status: status.value || undefined,
    dateRange: dateRange.value || undefined,
    search: search.value || undefined
  })
})

function clearFilters() {
  status.value = ''
  dateRange.value = ''
  search.value = ''
}
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
    <div class="flex flex-col sm:flex-row gap-3">
      <!-- Search -->
      <div class="flex-1">
        <input
          v-model="search"
          type="search"
          placeholder="Search by title or ISBN..."
          class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm"
        >
      </div>

      <!-- Status Filter -->
      <select
        v-model="status"
        class="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm"
      >
        <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>

      <!-- Date Filter -->
      <select
        v-model="dateRange"
        class="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm"
      >
        <option v-for="opt in dateOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>

      <!-- Clear Button -->
      <button
        v-if="status || dateRange || search"
        type="button"
        class="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
        @click="clearFilters"
      >
        Clear
      </button>
    </div>
  </div>
</template>
