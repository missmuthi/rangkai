<script setup lang="ts">
import type { Scan } from '~/types'

definePageMeta({
  middleware: 'auth'
})

const { history, loading, fetchHistory } = useHistory()
const { exportToCSV } = useSlimsExport()

// Filter state
const filters = ref<{ status?: string; dateRange?: string; search?: string }>({})

// Selection state for bulk actions
const selectedIds = ref<string[]>([])

// Computed stats
const stats = computed(() => {
  const total = history.value.length
  const completed = history.value.filter(s => s.status === 'complete').length
  const pending = history.value.filter(s => s.status === 'pending').length
  const errors = history.value.filter(s => s.status === 'error').length
  return { total, completed, pending, errors }
})

// Filtered history
const filteredHistory = computed(() => {
  let result = history.value

  if (filters.value.search) {
    const q = filters.value.search.toLowerCase()
    result = result.filter(s =>
      s.title?.toLowerCase().includes(q) ||
      s.isbn?.includes(q) ||
      s.authors?.toLowerCase().includes(q)
    )
  }

  if (filters.value.status) {
    result = result.filter(s => s.status === filters.value.status)
  }

  if (filters.value.dateRange) {
    const now = new Date()
    const ranges: Record<string, Date> = {
      today: new Date(now.setHours(0, 0, 0, 0)),
      week: new Date(now.setDate(now.getDate() - 7)),
      month: new Date(now.setMonth(now.getMonth() - 1)),
      year: new Date(now.setFullYear(now.getFullYear() - 1))
    }
    const cutoff = ranges[filters.value.dateRange]
    if (cutoff) {
      result = result.filter(s => new Date(s.created_at) >= cutoff)
    }
  }

  return result
})

function handleFilter(newFilters: typeof filters.value) {
  filters.value = newFilters
}

function handleSelectAll() {
  selectedIds.value = filteredHistory.value.map(s => s.id)
}

function handleClearSelection() {
  selectedIds.value = []
}

async function handleDeleteSelected() {
  // TODO: Implement bulk delete
  console.log('Delete selected:', selectedIds.value)
  selectedIds.value = []
}

function handleExportSelected() {
  const selected = history.value.filter(s => selectedIds.value.includes(s.id))
  exportToCSV(selected)
  selectedIds.value = []
}

function handleExportAll() {
  exportToCSV(history.value)
}

onMounted(() => {
  fetchHistory()
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <!-- Header -->
    <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Scan History</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Manage your scanned books</p>
      </div>
      <button
        class="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
        @click="handleExportAll"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export All
      </button>
    </header>

    <!-- Stats -->
    <div class="mb-6">
      <HistoryStats
        :total-scans="stats.total"
        :completed-scans="stats.completed"
        :pending-scans="stats.pending"
        :error-scans="stats.errors"
      />
    </div>

    <!-- Filters -->
    <div class="mb-4">
      <HistoryFilters @filter="handleFilter" />
    </div>

    <!-- Bulk Actions -->
    <div class="mb-4">
      <HistoryBulkActions
        :selected-ids="selectedIds"
        :total-count="filteredHistory.length"
        @select-all="handleSelectAll"
        @clear-selection="handleClearSelection"
        @delete-selected="handleDeleteSelected"
        @export-selected="handleExportSelected"
      />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" />
      <p class="text-gray-500 mt-4">Loading history...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredHistory.length === 0" class="text-center py-16 bg-white dark:bg-gray-800 rounded-xl">
      <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No scans found</h3>
      <p class="text-gray-500 dark:text-gray-400 mb-6">Start scanning books to see them here</p>
      <NuxtLink
        to="/scan/mobile"
        class="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
        Start Scanning
      </NuxtLink>
    </div>

    <!-- History Table -->
    <div v-else>
      <HistoryTable />
    </div>
  </div>
</template>
