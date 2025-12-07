import type { Scan } from '~/types'

export function useHistory() {
  const history = ref<Scan[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchHistory() {
    loading.value = true
    error.value = null
    try {
      history.value = await $fetch<Scan[]>('/api/scans')
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to fetch history'
    } finally {
      loading.value = false
    }
  }

  async function addScan(data: Partial<Scan>) {
    const newScan = await $fetch<Scan>('/api/scans', {
      method: 'POST',
      body: data
    })
    history.value.unshift(newScan)
    return newScan
  }

  async function updateScan(id: string, data: Partial<Scan>) {
    const updated = await $fetch<Scan>(`/api/scans/${id}`, {
      method: 'PATCH',
      body: data
    })
    const idx = history.value.findIndex(s => s.id === id)
    if (idx !== -1) history.value[idx] = updated
    return updated
  }

  async function removeScan(id: string) {
    await $fetch(`/api/scans/${id}`, { method: 'DELETE' })
    history.value = history.value.filter(s => s.id !== id)
  }

  return { 
    history, 
    loading, 
    error, 
    fetchHistory, 
    addScan, 
    updateScan, 
    removeScan 
  }
}

