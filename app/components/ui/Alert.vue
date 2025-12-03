<script setup lang="ts">
interface Props {
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  dismissible?: boolean
}

const _props = withDefaults(defineProps<Props>(), {
  type: 'info',
  title: '',
  dismissible: false
})

const emit = defineEmits<{
  dismiss: []
}>()

const visible = ref(true)

const icons = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ'
}

const colors = {
  success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
  error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
  info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200'
}

function dismiss() {
  visible.value = false
  emit('dismiss')
}
</script>

<template>
  <div
    v-if="visible"
    :class="['p-4 rounded-lg border flex items-start gap-3', colors[type]]"
    role="alert"
  >
    <span class="text-lg flex-shrink-0">{{ icons[type] }}</span>
    <div class="flex-1">
      <p v-if="title" class="font-medium">{{ title }}</p>
      <div class="text-sm">
        <slot />
      </div>
    </div>
    <button
      v-if="dismissible"
      class="text-current opacity-50 hover:opacity-100 flex-shrink-0"
      aria-label="Dismiss"
      @click="dismiss"
    >
      ✕
    </button>
  </div>
</template>
