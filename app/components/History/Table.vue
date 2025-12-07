<script setup lang="ts">
const { history: scans, loading, error, fetchHistory, removeScan } = useHistory()

const searchQuery = ref('')
// We might want to pass search query as prop or handle it internally
// For now keeping self-contained

const filteredScans = computed(() => {
  if (!searchQuery.value) return scans.value
  const q = searchQuery.value.toLowerCase()
  return scans.value.filter(s =>
    s.title?.toLowerCase().includes(q) ||
    s.isbn?.includes(q) ||
    s.authors?.toLowerCase().includes(q)
  )
})

async function handleDelete(id: string) {
  if (confirm('Delete this scan?')) {
    await removeScan(id)
  }
}

onMounted(() => fetchHistory())

function formatDate(dateString: string | number | Date | null | undefined): string {
  if (!dateString) return 'Unknown date'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid date'
    
    // Relative time if less than 24h
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    
    if (diffHours < 24 && diffHours >= 0) {
      if (diffHours < 1) return 'Just now'
      return `${Math.floor(diffHours)}h ago`
    }
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  } catch (e) {
    return 'Invalid date'
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Search -->
    <input
      v-model="searchQuery"
      type="search"
      placeholder="Search scans..."
      class="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
    >

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-lg">
      {{ error }}
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredScans.length === 0" class="text-center py-8 text-gray-500">
      No scans found
    </div>

    <!-- Scan List -->
    <ul v-else class="space-y-3">
      <li
        v-for="scan in filteredScans"
        :key="scan.id"
        class="group bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors cursor-pointer flex gap-4 relative"
        @click="navigateTo(`/book/${scan.isbn}`)"
      >
        <!-- Cover Thumbnail -->
        <div class="w-12 h-16 shrink-0 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
          <img 
            v-if="scan.thumbnail"
            :src="`/api/image-proxy?url=${encodeURIComponent(scan.thumbnail)}`" 
            :alt="scan.title || 'Cover'"
            class="w-full h-full object-cover"
            loading="lazy"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </div>

        <div class="flex-1 min-w-0 py-0.5">
          <div class="flex justify-between items-start gap-2">
            <div>
              <h3 class="font-medium text-gray-900 dark:text-gray-100 truncate pr-6 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {{ scan.title || 'Untitled Book' }}
              </h3>
              <p class="text-sm text-gray-500 truncate">{{ scan.authors || 'Unknown Author' }}</p>
            </div>
            
            <button
              class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors z-10"
              aria-label="Delete scan"
              @click.stop="handleDelete(scan.id)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          
          <div class="flex items-center gap-3 mt-1.5">
            <span class="text-xs text-mono bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">
              {{ scan.isbn }}
            </span>
            <span class="text-xs text-gray-400 border-l border-gray-200 dark:border-gray-700 pl-3">
              {{ formatDate(scan.created_at) }}
            </span>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
