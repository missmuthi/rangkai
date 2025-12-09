/**
 * Offline Queue Composable
 * Stores scanned ISBNs in localStorage when offline, syncs when back online
 */
import { useOnline } from '@vueuse/core'

const STORAGE_KEY = 'rangkai_offline_queue'

interface OfflineQueueItem {
  isbn: string
  scannedAt: string
  autoClean: boolean
}

export function useOfflineQueue() {
  const isOnline = useOnline()
  const toast = useToast()
  const { searchByISBN, cleanMetadata, book } = useBookSearch()
  
  // Queue state
  const queue = ref<OfflineQueueItem[]>([])
  const isSyncing = ref(false)
  const syncProgress = ref(0)

  // Load queue from localStorage on init
  onMounted(() => {
    loadQueue()
    
    // Auto-sync when coming back online
    watch(isOnline, (online) => {
      if (online && queue.value.length > 0) {
        syncQueue()
      }
    })
  })

  function loadQueue() {
    if (import.meta.client) {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          queue.value = JSON.parse(stored)
        } catch {
          queue.value = []
        }
      }
    }
  }

  function saveQueue() {
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue.value))
    }
  }

  function addToQueue(isbn: string, autoClean = true) {
    // Deduplicate
    if (queue.value.some(item => item.isbn === isbn)) {
      return false
    }
    
    queue.value.push({
      isbn,
      scannedAt: new Date().toISOString(),
      autoClean
    })
    saveQueue()
    
    toast.add({
      title: 'Saved offline',
      description: `${isbn} queued for sync`,
      color: 'yellow'
    })
    
    return true
  }

  function removeFromQueue(isbn: string) {
    queue.value = queue.value.filter(item => item.isbn !== isbn)
    saveQueue()
  }

  function clearQueue() {
    queue.value = []
    saveQueue()
  }

  async function syncQueue() {
    if (isSyncing.value || queue.value.length === 0) return
    
    isSyncing.value = true
    syncProgress.value = 0
    const total = queue.value.length
    let synced = 0
    const failed: string[] = []
    
    // Process each queued item
    for (const item of [...queue.value]) {
      try {
        await searchByISBN(item.isbn)
        if (item.autoClean && book.value) {
          await cleanMetadata(book.value)
        }
        removeFromQueue(item.isbn)
        synced++
        syncProgress.value = Math.round((synced / total) * 100)
      } catch (err) {
        console.error(`Failed to sync ${item.isbn}:`, err)
        failed.push(item.isbn)
      }
    }
    
    isSyncing.value = false
    
    if (synced > 0) {
      toast.add({
        title: 'Sync complete',
        description: `${synced} book${synced > 1 ? 's' : ''} synced${failed.length > 0 ? `, ${failed.length} failed` : ''}`,
        color: synced === total ? 'green' : 'yellow'
      })
    }
  }

  return {
    isOnline,
    queue,
    isSyncing,
    syncProgress,
    addToQueue,
    removeFromQueue,
    clearQueue,
    syncQueue
  }
}
