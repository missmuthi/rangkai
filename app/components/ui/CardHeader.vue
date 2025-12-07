<script setup lang="ts">
import { cn } from '~/utils/cn'

interface Props {
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <div :class="cn('flex flex-row items-center justify-between space-y-0 p-6 pb-2', props.class)">
    <slot />
  </div>
</template>
