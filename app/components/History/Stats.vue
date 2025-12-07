<script setup lang="ts">
/**
 * History/Stats.vue
 * Analytics summary for scan history
 */

const props = defineProps<{
  totalScans: number
  completedScans: number
  pendingScans: number
  errorScans: number
}>()

const completionRate = computed(() => {
  if (props.totalScans === 0) return 0
  return Math.round((props.completedScans / props.totalScans) * 100)
})
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
    <!-- Total Scans -->
    <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ totalScans }}</p>
      <p class="text-sm text-gray-500 dark:text-gray-400">Total Scans</p>
    </div>

    <!-- Completed -->
    <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ completedScans }}</p>
      <p class="text-sm text-gray-500 dark:text-gray-400">Completed</p>
    </div>

    <!-- Pending -->
    <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <p class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ pendingScans }}</p>
      <p class="text-sm text-gray-500 dark:text-gray-400">Pending</p>
    </div>

    <!-- Completion Rate -->
    <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <p class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{{ completionRate }}%</p>
      <p class="text-sm text-gray-500 dark:text-gray-400">Success Rate</p>
    </div>
  </div>
</template>
