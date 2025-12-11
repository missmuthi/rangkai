<script setup lang="ts">
/**
 * History Page - shadcn/Vercel Dashboard Style
 * Optimized for UX: flat hierarchy, proper action priority, distinct empty states
 */
// Scan import removed
import {
  Download,
  ScanBarcode,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-vue-next";
import Button from "@/components/ui/Button.vue";

definePageMeta({
  middleware: "auth",
  layout: "app",
});

useHead({
  title: "Scan History - Rangkai Dashboard",
  meta: [
    {
      name: "description",
      content: "Manage your scanned book metadata and export status.",
    },
  ],
});

const { history, loading, error, pagination, fetchHistory, setPage, setLimit } =
  useHistory();

// Filter state
const filters = ref<{ status?: string; dateRange?: string; search?: string }>(
  {}
);
// selectedIds removed

// Computed stats (use API total for accurate count)
const stats = computed(() => ({
  total: pagination.value.total,
  completed: history.value.filter((s) => s.status === "complete").length,
  pending: history.value.filter((s) => s.status === "pending").length,
  errors: history.value.filter((s) => s.status === "error").length,
}));

// Filter logic
const filteredHistory = computed(() => {
  let result = history.value;

  if (filters.value.search) {
    const q = filters.value.search.toLowerCase();
    result = result.filter(
      (s) =>
        (s.title && s.title.toLowerCase().includes(q)) ||
        (s.isbn && s.isbn.includes(q)) ||
        (Array.isArray(s.authors)
          ? s.authors.join(" ").toLowerCase().includes(q)
          : String(s.authors || "")
              .toLowerCase()
              .includes(q))
    );
  }

  if (filters.value.status) {
    result = result.filter((s) => s.status === filters.value.status);
  }

  if (filters.value.dateRange) {
    const now = new Date();
    const ranges: Record<string, number> = {
      today: 0,
      week: 7,
      month: 30,
      year: 365,
    };
    const days = ranges[filters.value.dateRange];
    if (days !== undefined) {
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      result = result.filter((s) => new Date(s.created_at) >= cutoff);
    }
  }

  return result;
});

// UX Helpers
const hasData = computed(() => history.value.length > 0);
const isFilteredEmpty = computed(
  () => hasData.value && filteredHistory.value.length === 0
);

function handleExportAll() {
  // Use server-side export endpoint for better compatibility
  // This works reliably across all browsers including Brave
  window.location.href = "/api/scans/export";
}

function handleExportMarc21() {
  // Export as MARC21 for Koha and other library systems
  window.location.href = "/api/scans/export/marc";
}

function clearFilters() {
  filters.value = {};
}

onMounted(() => {
  fetchHistory();
});
</script>

<template>
  <main class="flex-1 space-y-8 p-4 md:p-8 pt-6">
    <!-- Header -->
    <header
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <!-- H2 per Design System Rule 4 (Page Title) -->
        <h2
          class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white"
        >
          Dashboard
        </h2>
        <p class="text-gray-500 dark:text-gray-400">
          Manage your scanned book metadata and export status.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <!-- SLiMS CSV Export -->
        <Button v-if="hasData" variant="outline" @click="handleExportAll">
          <Download class="mr-2 h-4 w-4" />
          CSV (SLiMS)
        </Button>

        <!-- MARC21 Export for Koha etc -->
        <Button v-if="hasData" variant="outline" @click="handleExportMarc21">
          <Download class="mr-2 h-4 w-4" />
          MARC21
        </Button>

        <!-- Updated to use shadcn Button (as-child) with NuxtLink -->
        <Button v-if="hasData" as-child>
          <NuxtLink to="/dashboard">
            <ScanBarcode class="mr-2 h-4 w-4" />
            Start Scanning
          </NuxtLink>
        </Button>
      </div>
    </header>

    <!-- Stats Cards -->
    <section
      v-if="hasData || loading"
      class="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
    >
      <UiCard>
        <UiCardHeader>
          <UiCardTitle>Total Scans</UiCardTitle>
          <BookOpen class="h-4 w-4 text-muted-foreground" />
        </UiCardHeader>
        <UiCardContent>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ stats.total }}
          </div>
          <p class="text-xs text-muted-foreground">Lifetime volume</p>
        </UiCardContent>
      </UiCard>

      <UiCard>
        <UiCardHeader>
          <UiCardTitle>Completed</UiCardTitle>
          <CheckCircle2 class="h-4 w-4 text-green-500" />
        </UiCardHeader>
        <UiCardContent>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ stats.completed }}
          </div>
          <p class="text-xs text-muted-foreground">Ready for export</p>
        </UiCardContent>
      </UiCard>

      <UiCard>
        <UiCardHeader>
          <UiCardTitle>Pending</UiCardTitle>
          <Clock class="h-4 w-4 text-yellow-500" />
        </UiCardHeader>
        <UiCardContent>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ stats.pending }}
          </div>
          <p class="text-xs text-muted-foreground">Awaiting metadata</p>
        </UiCardContent>
      </UiCard>

      <UiCard>
        <UiCardHeader>
          <UiCardTitle>Errors</UiCardTitle>
          <AlertCircle class="h-4 w-4 text-red-500" />
        </UiCardHeader>
        <UiCardContent>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ stats.errors }}
          </div>
          <p class="text-xs text-muted-foreground">Requires attention</p>
        </UiCardContent>
      </UiCard>
    </section>

    <!-- Content Area -->
    <section class="space-y-4">
      <!-- Error State -->
      <div
        v-if="error"
        class="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
      >
        <div class="flex items-start gap-3">
          <AlertCircle class="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
          <div class="flex-1">
            <h3 class="text-sm font-medium text-red-800 dark:text-red-300">
              Failed to load history
            </h3>
            <p class="mt-1 text-sm text-red-700 dark:text-red-400">
              {{ error }}
            </p>
            <Button
              variant="outline"
              class="mt-3 border-red-200 text-red-800 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/40"
              size="sm"
              @click="fetchHistory"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>

      <!-- Search Bar and Pagination Controls -->
      <div
        v-if="hasData"
        class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <div class="relative w-full sm:w-[300px]">
            <Search
              class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            />
            <UiInput
              v-model="filters.search"
              placeholder="Search by title or ISBN..."
              class="pl-10"
            />
          </div>
        </div>
        <!-- Items per page selector -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">Show:</span>
          <select
            :value="pagination.limit"
            class="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-indigo-500"
            @change="
              setLimit(Number(($event.target as HTMLSelectElement).value))
            "
          >
            <option :value="25">25</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="flex items-center justify-center h-64 border rounded-lg border-dashed bg-gray-50/50 dark:bg-gray-800/50"
      >
        <div class="flex flex-col items-center gap-2">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"
          />
          <p class="text-sm text-muted-foreground">Syncing history...</p>
        </div>
      </div>

      <!-- Empty State A: No Data At All -->
      <div
        v-else-if="!hasData"
        class="flex h-[450px] shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-700"
      >
        <div
          class="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center"
        >
          <!-- Softer icon background -->
          <div
            class="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
          >
            <ScanBarcode class="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 class="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
            No books scanned
          </h3>
          <!-- Constrained text width for better readability -->
          <p class="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
            You haven't scanned any books yet. Start scanning to populate your
            library metadata.
          </p>
          <Button as-child>
            <NuxtLink to="/scan/mobile"> Starts Scanning </NuxtLink>
          </Button>
        </div>
      </div>

      <!-- Empty State B: Search/Filter Found Nothing -->
      <div
        v-else-if="isFilteredEmpty"
        class="flex flex-col items-center justify-center h-64 border rounded-lg bg-gray-50/50 dark:bg-gray-800/50"
      >
        <Search class="h-10 w-10 text-muted-foreground mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">
          No results found
        </h3>
        <p class="text-sm text-muted-foreground mt-1">
          No books match "<strong>{{ filters.search }}</strong
          >". Try adjusting your filters.
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
      <div v-else class="space-y-4">
        <div
          class="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <HistoryTable />
        </div>

        <!-- Pagination Controls -->
        <div
          v-if="pagination.totalPages > 1"
          class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700"
        >
          <p class="text-sm text-gray-500">
            Showing {{ (pagination.page - 1) * pagination.limit + 1 }}-{{
              Math.min(pagination.page * pagination.limit, pagination.total)
            }}
            of {{ pagination.total }}
          </p>
          <div class="flex items-center gap-2">
            <button
              class="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="pagination.page <= 1"
              @click="setPage(pagination.page - 1)"
            >
              <ChevronLeft class="w-4 h-4" /> Prev
            </button>
            <span class="text-sm text-gray-600 dark:text-gray-400">
              Page {{ pagination.page }} of {{ pagination.totalPages }}
            </span>
            <button
              class="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="pagination.page >= pagination.totalPages"
              @click="setPage(pagination.page + 1)"
            >
              Next <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
