<script setup lang="ts">
/**
 * ReloadPrompt.vue - PWA Update Notification
 * 
 * Shows a subtle toast when a new version is available.
 * User can manually refresh to get the update.
 * Does NOT auto-reload to avoid disrupting active scanning sessions.
 */
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { X, RefreshCw } from 'lucide-vue-next'

const {
  needRefresh,
  updateServiceWorker
} = useRegisterSW({
  onRegistered(registration) {
    console.info('[PWA] Service Worker registered:', registration)
  },
  onRegisterError(error) {
    console.error('[PWA] Service Worker registration failed:', error)
  }
})

// State
const isVisible = ref(true)

// Handlers
const updateApp = async () => {
  try {
    await updateServiceWorker(true)
    // Reload will happen automatically after update
  } catch (error) {
    console.error('[PWA] Update failed:', error)
  }
}

const dismiss = () => {
  isVisible.value = false
}
</script>

<template>
  <!-- Only show if update available and user hasn't dismissed -->
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div
      v-if="needRefresh && isVisible"
      class="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
      role="alert"
      aria-live="polite"
    >
      <div class="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-4 flex items-center gap-3">
        <!-- Icon -->
        <div class="flex-shrink-0">
          <div class="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
            <RefreshCw class="w-5 h-5 text-blue-500" />
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-white">
            Update Available
          </p>
          <p class="text-xs text-slate-400 mt-0.5">
            New features and improvements ready
          </p>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <button
            class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            @click="updateApp"
          >
            Refresh
          </button>
          <button
            class="p-1.5 hover:bg-slate-800 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-2 focus:ring-offset-slate-900"
            aria-label="Dismiss update notification"
            @click="dismiss"
          >
            <X class="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
