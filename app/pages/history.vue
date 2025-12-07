<script setup lang="ts">
/**
 * History Page - shadcn/Vercel Dashboard Style
 * Optimized for UX: flat hierarchy, proper action priority, distinct empty states
 */
import type { Scan } from '~/types'

definePageMeta({
  middleware: 'auth'
})

const { history, loading, fetchHistory } = useHistory()
const { exportToCSV } = useSlimsExport()

// Filter state
const filters = ref<{ status?: string; dateRange?: string; search?: string }>({})
const selectedIds = ref<string[]>([])

// Computed stats
const stats = computed(() => ({
  total: history.value.length,
  completed: history.value.filter(s => s.status === 'complete').length,
  pending: history.value.filter(s => s.status === 'pending').length,
  errors: history.value.filter(s => s.status === 'error').length
}))

// Filter logic
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
    const ranges: Record<string, number> = {
      today: 0,
      week: 7,
      month: 30,
      year: 365
    }
    const days = ranges[filters.value.dateRange]
    if (days !== undefined) {
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
      result = result.filter(s => new Date(s.created_at) >= cutoff)
    }
  }

  return result
})

// UX Helpers
const hasData = computed(() => history.value.length > 0)
const isFilteredEmpty = computed(() => hasData.value && filteredHistory.value.length === 0)

function handleExportAll() {
  exportToCSV(history.value)
}

function clearFilters() {
  filters.value = {}
}

onMounted(() => {
  fetchHistory()
})
</script>

<template>
  <div class="flex-1 space-y-8 p-4 md:p-8 pt-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h2>
        <p class="text-gray-500 dark:text-gray-400">
          Manage your scanned book metadata and export status.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button 
          v-if="hasData" 
          class="inline-flex items-center px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          @click="handleExportAll"
        >
          <!-- Download Icon -->
          <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export All
        </button>
        
        <!-- Only show header button when we have data (avoid duplicate CTAs) -->
        <NuxtLink 
          v-if="hasData"
          to="/scan/mobile"
          class="inline-flex items-center px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <!-- ScanBarcode Icon -->
          <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          Start Scanning
        </NuxtLink>
      </div>
    </div>

    <!-- Stats Cards -->
    <div v-if="hasData || loading" class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <UiCard>
        <UiCardHeader>
          <UiCardTitle>Total Scans</UiCardTitle>
          <!-- BookOpen Icon -->
          <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </UiCardHeader>
        <UiCardContent>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</div>
          <p class="text-xs text-gray-500 dark:text-gray-400">Lifetime volume</p>
        </UiCardContent>
      </UiCard>

      <UiCard>
        <UiCardHeader>
          <UiCardTitle>Completed</UiCardTitle>
          <!-- CheckCircle Icon -->
          <svg class="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </UiCardHeader>
        <UiCardContent>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.completed }}</div>
          <p class="text-xs text-gray-500 dark:text-gray-400">Ready for export</p>
        </UiCardContent>
      </UiCard>

      <UiCard>
        <UiCardHeader>
          <UiCardTitle>Pending</UiCardTitle>
          <!-- Clock Icon -->
          <svg class="h-4 w-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </UiCardHeader>
        <UiCardContent>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.pending }}</div>
          <p class="text-xs text-gray-500 dark:text-gray-400">Awaiting metadata</p>
        </UiCardContent>
      </UiCard>

      <UiCard>
        <UiCardHeader>
          <UiCardTitle>Errors</UiCardTitle>
          <!-- AlertCircle Icon -->
          <svg class="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </UiCardHeader>
        <UiCardContent>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.errors }}</div>
          <p class="text-xs text-gray-500 dark:text-gray-400">Requires attention</p>
        </UiCardContent>
      </UiCard>
    </div>

    <!-- Content Area -->
    <div class="space-y-4">
      <!-- Search Bar (only shown when has data) -->
      <div v-if="hasData" class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <div class="relative w-full sm:w-[300px]">
            <!-- Search Icon -->
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <UiInput 
              v-model="filters.search" 
              placeholder="Search by title or ISBN..." 
              class="pl-10" 
            />
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center h-64 border rounded-lg border-dashed bg-gray-50/50 dark:bg-gray-800/50">
        <div class="flex flex-col items-center gap-2">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          <p class="text-sm text-gray-500 dark:text-gray-400">Syncing history...</p>
        </div>
      </div>

      <!-- Empty State A: No Data At All -->
      <div v-else-if="!hasData" class="flex h-[450px] shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
        <div class="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <!-- Softer icon background -->
          <div class="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <!-- ScanBarcode Icon - using muted color for softer look -->
            <svg class="h-10 w-10 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <h3 class="mt-4 text-lg font-semibold text-gray-900 dark:text-white">No books scanned</h3>
          <!-- Constrained text width for better readability -->
          <p class="mb-4 mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
            You haven't scanned any books yet. Start scanning to populate your library metadata.
          </p>
          <NuxtLink 
            to="/scan/mobile"
            class="inline-flex items-center px-6 py-3 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Start Scanning
          </NuxtLink>
        </div>
      </div>

      <!-- Empty State B: Search/Filter Found Nothing -->
      <div v-else-if="isFilteredEmpty" class="flex flex-col items-center justify-center h-64 border rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
        <!-- Search Icon -->
        <svg class="h-10 w-10 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">No results found</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          No books match "<strong>{{ filters.search }}</strong>". Try adjusting your filters.
        </p>
        <button 
          class="mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          @click="clearFilters"
        >
          Clear Filters
        </button>
      </div>

      <!-- Data Table -->
      <div v-else class="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <HistoryTable />
      </div>
    </div>
  </div>
</template>
