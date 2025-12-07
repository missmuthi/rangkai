<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { history: scans } = useHistory() // keeping 'scans' alias for now to minimize template changes if any, but actually template uses <HistoryTable> which handles fetching
const { exportToCSV } = useSlimsExport()

function handleExport() {
  exportToCSV(scans.value)
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <header class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Scan History</h1>
      <button
        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        @click="handleExport"
      >
        Export CSV
      </button>
    </header>

    <HistoryTable />
  </div>
</template>
