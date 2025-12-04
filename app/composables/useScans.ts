interface Scan {
  id: string
  isbn: string
  title: string
  authors: string
  publisher: string
  status: 'pending' | 'complete' | 'error'
  created_at: string
  updated_at: string
}

export function useScans() {
  const scans = ref<Scan[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchScans() {
    loading.value = true
    error.value = null
    try {
      scans.value = await $fetch<Scan[]>('/api/scans')
    } catch (e: unknown) {
      const err = e as { data?: { message?: string } }
      error.value = err.data?.message || 'Failed to fetch scans'
    } finally {
      loading.value = false
    }
  }

  async function createScan(data: Partial<Scan>) {
    const newScan = await $fetch<Scan>('/api/scans', {
      method: 'POST',
      body: data
    })
    scans.value.unshift(newScan)
    return newScan
  }

  async function updateScan(id: string, data: Partial<Scan>) {
    const updated = await $fetch<Scan>(`/api/scans/${id}`, {
      method: 'PATCH',
      body: data
    })
    const idx = scans.value.findIndex(s => s.id === id)
    if (idx !== -1) scans.value[idx] = updated
    return updated
  }

  async function deleteScan(id: string) {
    await $fetch(`/api/scans/${id}`, { method: 'DELETE' })
    scans.value = scans.value.filter(s => s.id !== id)
  }

  return { scans, loading, error, fetchScans, createScan, updateScan, deleteScan }
}
