<script setup lang="ts">
import { cn } from '~/utils/cn'

interface Props {
  open: boolean
  side?: 'left' | 'right' | 'top' | 'bottom'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  side: 'left'
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const close = () => emit('update:open', false)

// Close on Escape key
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') close()
}

// Add/remove event listener based on open state
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    document.addEventListener('keydown', handleKeydown)
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', handleKeydown)
    document.body.style.overflow = ''
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})

const slideClasses = {
  left: 'inset-y-0 left-0 h-full w-3/4 max-w-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
  right: 'inset-y-0 right-0 h-full w-3/4 max-w-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
  top: 'inset-x-0 top-0 h-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
  bottom: 'inset-x-0 bottom-0 h-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
}
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 bg-black/80"
        @click="close"
      />
    </Transition>

    <!-- Sheet Content -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      leave-active-class="transition-transform duration-300 ease-in"
      :enter-from-class="side === 'left' ? '-translate-x-full' : side === 'right' ? 'translate-x-full' : side === 'top' ? '-translate-y-full' : 'translate-y-full'"
      :leave-to-class="side === 'left' ? '-translate-x-full' : side === 'right' ? 'translate-x-full' : side === 'top' ? '-translate-y-full' : 'translate-y-full'"
    >
      <div
        v-if="open"
        :class="cn(
          'fixed z-50 gap-4 bg-background p-6 shadow-lg',
          slideClasses[side],
          props.class
        )"
        role="dialog"
        aria-modal="true"
      >
        <slot :close="close" />
      </div>
    </Transition>
  </Teleport>
</template>
