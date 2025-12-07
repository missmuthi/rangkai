<script setup lang="ts">
/**
 * Scanner/Camera.vue
 * Barcode camera detection component using html5-qrcode
 */

const props = defineProps<{
  elementId?: string
}>()

const emit = defineEmits<{
  scan: [isbn: string]
  error: [message: string]
}>()

const { isScanning, error, startScanner } = useScanner()

const scannerId = computed(() => props.elementId || 'scanner-camera')

async function initScanner() {
  await startScanner(
    scannerId.value,
    (text) => emit('scan', text),
    (err) => emit('error', err)
  )
}

onMounted(() => {
  initScanner()
})

// Cleanup handled by useScanner composable
</script>

<template>
  <div class="relative">
    <!-- Scanner Container -->
    <div 
      :id="scannerId" 
      class="w-full aspect-[4/3] bg-gray-900 rounded-lg overflow-hidden"
    />
    
    <!-- Scan Overlay -->
    <div class="absolute inset-0 pointer-events-none flex items-center justify-center">
      <div class="w-64 h-24 border-2 border-green-400 rounded-lg opacity-75" />
    </div>

    <!-- Status Indicators -->
    <div v-if="isScanning" class="absolute top-2 right-2">
      <span class="flex h-3 w-3">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
      </span>
    </div>

    <!-- Error Display -->
    <div 
      v-if="error" 
      class="absolute bottom-0 left-0 right-0 bg-red-900/90 text-red-200 text-sm p-2 text-center"
    >
      {{ error }}
    </div>
  </div>
</template>
