<script setup lang="ts">
interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

const _props = defineProps<{
  toasts: Toast[]
}>()

const emit = defineEmits<{
  dismiss: [id: string]
}>()

const icons = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ'
}

const colors = {
  success: 'bg-green-50 text-green-800 dark:bg-green-900/50 dark:text-green-200',
  error: 'bg-red-50 text-red-800 dark:bg-red-900/50 dark:text-red-200',
  warning: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
  info: 'bg-blue-50 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['p-4 rounded-lg shadow-lg flex items-center gap-3', colors[toast.type]]"
        >
          <span class="text-lg">{{ icons[toast.type] }}</span>
          <p class="flex-1 text-sm">{{ toast.message }}</p>
          <button
            class="text-current opacity-50 hover:opacity-100"
            @click="emit('dismiss', toast.id)"
          >
            ✕
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
