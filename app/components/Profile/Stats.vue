<script setup lang="ts">
/**
 * Profile/Stats.vue
 * User scan statistics display
 */

const props = defineProps<{
  totalScans?: number
  thisMonth?: number
  successRate?: number
}>()

const stats = computed(() => [
  {
    label: 'Total Scans',
    value: props.totalScans ?? 0,
    icon: 'book',
    color: 'indigo'
  },
  {
    label: 'This Month',
    value: props.thisMonth ?? 0,
    icon: 'calendar',
    color: 'green'
  },
  {
    label: 'Success Rate',
    value: `${props.successRate ?? 100}%`,
    icon: 'check',
    color: 'emerald'
  }
])
</script>

<template>
  <div class="grid grid-cols-3 gap-4">
    <div
      v-for="stat in stats"
      :key="stat.label"
      class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm"
    >
      <!-- Icon -->
      <div 
        class="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center"
        :class="{
          'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400': stat.color === 'indigo',
          'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400': stat.color === 'green',
          'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400': stat.color === 'emerald'
        }"
      >
        <!-- Book Icon -->
        <svg v-if="stat.icon === 'book'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <!-- Calendar Icon -->
        <svg v-else-if="stat.icon === 'calendar'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <!-- Check Icon -->
        <svg v-else-if="stat.icon === 'check'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <!-- Value -->
      <p class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ stat.value }}
      </p>
      
      <!-- Label -->
      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {{ stat.label }}
      </p>
    </div>
  </div>
</template>
