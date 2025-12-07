<script setup lang="ts">
/**
 * History Page - shadcn/Vercel Dashboard Style
 * Optimized for UX: flat hierarchy, proper action priority, distinct empty states
 */
import type { Scan } from '~/types'
import { 
  Download, 
  ScanBarcode, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Search,
  Filter
} from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'

definePageMeta({
  middleware: 'auth',
  layout: 'app'
})

useHead({
  title: 'Scan History - Rangkai Dashboard',
  meta: [
    { name: 'description', content: 'Manage your scanned book metadata and export status.' }
  ]
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
  <main class="flex-1 space-y-8 p-4 md:p-8 pt-6">
    <!-- Header -->
    <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <!-- H2 per Design System Rule 4 (Page Title) -->
        <h2 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h2>
        <p class="text-gray-500 dark:text-gray-400">
          Manage your scanned book metadata and export status.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <!-- Replaced native button with shadcn Button per Rule 3 -->
        <Button 
          v-if="hasData" 
          variant="outline"
          @click="handleExportAll"
        >
          <Download class="mr-2 h-4 w-4" />
          Export All
        </Button>
        
        <!-- Updated to use shadcn Button (as-child) with NuxtLink -->
        <Button 
          v-if="hasData"
          as-child
        >
          <NuxtLink to="/scan/mobile">
            <ScanBarcode class="mr-2 h-4 w-4" />
            Start Scanning
          </NuxtLink>
        </Button>
      </div>
    </header>

    <!-- Stats Cards -->
    <section v-if="hasData || loading" class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <UiCard>
        <UiCardHeader>
          <UiCardTitle>Total Scans</UiCardTitle>
          <BookOpen class="h-4 w-4 text-muted-foreground" />
        </UiCardHeader>
        <UiCardContent>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</div>
          <p class="text-xs text-muted-foreground">Lifetime volume</p>
        </UiCardContent>
      </UiCard>

      <UiCard>
        <UiCardHeader>
          <UiCardTitle>Completed</UiCardTitle>
          <CheckCircle2 class="h-4 w-4 text-green-500" />
        </UiCardHeader>
        <UiCardContent>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.completed }}</div>
          <p class="text-xs text-muted-foreground">Ready for export</p>
        </UiCardContent>
      </UiCard>

      <UiCard>
        <UiCardHeader>
          <UiCardTitle>Pending</UiCardTitle>
          <Clock class="h-4 w-4 text-yellow-500" />
        </UiCardHeader>
        <UiCardContent>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.pending }}</div>
          <p class="text-xs text-muted-foreground">Awaiting metadata</p>
        </UiCardContent>
      </UiCard>

      <UiCard>
        <UiCardHeader>
          <UiCardTitle>Errors</UiCardTitle>
          <AlertCircle class="h-4 w-4 text-red-500" />
        </UiCardHeader>
        <UiCardContent>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.errors }}</div>
          <p class="text-xs text-muted-foreground">Requires attention</p>
        </UiCardContent>
      </UiCard>
    </section>

    <!-- Content Area -->
    <section class="space-y-4">
      <!-- Search Bar (only shown when has data) -->
      <div v-if="hasData" class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <div class="relative w-full sm:w-[300px]">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
          <p class="text-sm text-muted-foreground">Syncing history...</p>
        </div>
      </div>

      <!-- Empty State A: No Data At All -->
      <div v-else-if="!hasData" class="flex h-[450px] shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
        <div class="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <!-- Softer icon background -->
          <div class="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <ScanBarcode class="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 class="mt-4 text-lg font-semibold text-gray-900 dark:text-white">No books scanned</h3>
          <!-- Constrained text width for better readability -->
          <p class="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
            You haven't scanned any books yet. Start scanning to populate your library metadata.
          </p>
          <Button as-child>
            <NuxtLink to="/scan/mobile">
              Starts Scanning
            </NuxtLink>
          </Button>
        </div>
      </div>

      <!-- Empty State B: Search/Filter Found Nothing -->
      <div v-else-if="isFilteredEmpty" class="flex flex-col items-center justify-center h-64 border rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
        <Search class="h-10 w-10 text-muted-foreground mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">No results found</h3>
        <p class="text-sm text-muted-foreground mt-1">
          No books match "<strong>{{ filters.search }}</strong>". Try adjusting your filters.
        </p>
        <Button 
          variant="link" 
          class="mt-2 text-indigo-600 dark:text-indigo-400"
          @click="clearFilters"
        >
          Clear Filters
        </Button>
      </div>

      <!-- Data Table -->
      <div v-else class="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <HistoryTable />
      </div>
    </section>
  </main>
</template>
