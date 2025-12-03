<script setup lang="ts">
interface Props {
  width?: string
  height?: string
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'
}

const _props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '1rem',
  rounded: 'md'
})

const roundedClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full'
}
</script>

<template>
  <div
    :class="['animate-pulse bg-gray-200 dark:bg-gray-700', roundedClasses[rounded]]"
    :style="{ width, height }"
  />
</template>
