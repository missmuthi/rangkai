<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { scans, fetchScans } = useScans()

onMounted(() => fetchScans())

function exportCSV() {
  const headers = ['ISBN', 'Title', 'Authors', 'Publisher', 'Date']
  const rows = scans.value.map(s => [
    s.isbn,
    s.title,
    s.authors,
    s.publisher,
    new Date(s.created_at).toISOString()
  ])

  const csv = [headers, ...rows].map(r => r.map(c => `"${c || ''}"`).join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `rangkai-scans-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <header class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Scan History</h1>
      <button
        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        @click="exportCSV"
      >
        Export CSV
      </button>
    </header>

    <ScanHistory />
  </div>
</template>
