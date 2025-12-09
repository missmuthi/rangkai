import type { Scan } from '~/types'

export function useHistory() {
  const history = ref<Scan[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const toast = useToast()

  async function fetchHistory() {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch<{ scans: Scan[]; count: number }>('/api/scans')
      history.value = response.scans || []
    } catch (e: unknown) {
      const err = e as { data?: { message?: string } }
      error.value = err.data?.message || 'Failed to fetch history'
    } finally {
      loading.value = false
    }
  }

  async function addScan(data: Partial<Scan>) {
    // Optimistic: Add immediately with temp ID
    const tempId = `temp-${Date.now()}`
    const optimisticScan = { 
      ...data, 
      id: tempId, 
      createdAt: new Date().toISOString() 
    } as Scan
    history.value.unshift(optimisticScan)
    
    try {
      const newScan = await $fetch<Scan>('/api/scans', {
        method: 'POST',
        body: data
      })
      // Replace temp with real data
      const idx = history.value.findIndex(s => s.id === tempId)
      if (idx !== -1) history.value[idx] = newScan
      return newScan
    } catch (err) {
      // Rollback on failure
      history.value = history.value.filter(s => s.id !== tempId)
      toast.add({ 
        title: 'Save failed', 
        description: 'Could not save to library. Please try again.',
        color: 'red'
      })
      throw err
    }
  }

  async function updateScan(id: string, data: Partial<Scan>) {
    // Store original for rollback
    const idx = history.value.findIndex(s => s.id === id)
    if (idx === -1) return null
    const original = { ...history.value[idx] }
    
    // Optimistic: Update immediately
    history.value[idx] = { ...original, ...data } as Scan
    
    try {
      const updated = await $fetch<Scan>(`/api/scans/${id}`, {
        method: 'PATCH',
        body: data
      })
      history.value[idx] = updated
      return updated
    } catch (err) {
      // Rollback on failure
      history.value[idx] = original as Scan
      toast.add({ 
        title: 'Update failed', 
        description: 'Could not save changes. Please try again.',
        color: 'red'
      })
      throw err
    }
  }

  async function removeScan(id: string) {
    // Store original for rollback
    const idx = history.value.findIndex(s => s.id === id)
    if (idx === -1) return
    const original = history.value[idx]
    
    // Optimistic: Remove immediately
    history.value = history.value.filter(s => s.id !== id)
    
    try {
      await $fetch(`/api/scans/${id}`, { method: 'DELETE' })
    } catch (err) {
      // Rollback on failure - restore at original position
      history.value.splice(idx, 0, original as Scan)
      toast.add({ 
        title: 'Delete failed', 
        description: 'Could not remove item. Please try again.',
        color: 'red'
      })
      throw err
    }
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


