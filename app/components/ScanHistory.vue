<script setup lang="ts">
const { scans, loading, error, fetchScans, deleteScan } = useScans()

const searchQuery = ref('')

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
    await deleteScan(id)
  }
}

onMounted(() => fetchScans())
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
    <ul v-else class="space-y-2">
      <li
        v-for="scan in filteredScans"
        :key="scan.id"
        class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex justify-between items-center"
      >
        <div>
          <p class="font-medium">{{ scan.title || scan.isbn }}</p>
          <p class="text-sm text-gray-500">{{ scan.authors }}</p>
          <p class="text-xs text-gray-400">{{ new Date(scan.created_at).toLocaleDateString() }}</p>
        </div>
        <button
          class="text-red-600 hover:text-red-800"
          aria-label="Delete scan"
          @click="handleDelete(scan.id)"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </li>
    </ul>
  </div>
</template>
