<script setup lang="ts">
import { cn } from '~/utils/cn'

interface Props {
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <h3 :class="cn('text-sm font-medium leading-none tracking-tight', props.class)">
    <slot />
  </h3>
</template>
