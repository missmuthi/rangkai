<script setup lang="ts">
/**
 * Scanner/Native.vue
 * Native barcode scanner component using vue-qrcode-reader
 * Features: EAN-13 detection, torch toggle, cooldown flash, corner markers
 */
import { QrcodeStream } from "vue-qrcode-reader";

interface DetectedCode {
  rawValue: string;
  format: string;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

type BarcodeFormat =
  | "ean_13"
  | "ean_8"
  | "qr_code"
  | "code_128"
  | "code_39"
  | "upc_a"
  | "upc_e";

const props = withDefaults(
  defineProps<{
    active?: boolean;
    formats?: BarcodeFormat[];
  }>(),
  {
    active: true,
    formats: () => ["ean_13"] as BarcodeFormat[], // ISBN-13 only by default
  }
);

const emit = defineEmits<{
  scan: [isbn: string];
  error: [message: string];
}>();

const {
  isCooldown,
  torchActive,
  errorMsg,
  shouldProcessScan,
  recordScan,
  handleError,
} = useScannerNative();

/**
 * Handle detected barcodes from the scanner
 */
const onDetect = (detectedCodes: DetectedCode[]) => {
  if (!detectedCodes || detectedCodes.length === 0) return;

  const result = detectedCodes[0];
  if (!result?.rawValue) return;

  const code = result.rawValue;

  // Check if we should process this scan (debounce + cooldown)
  if (!shouldProcessScan(code)) return;

  // Record the scan and trigger cooldown
  recordScan(code);

  // Emit to parent
  emit("scan", code);
};

/**
 * Handle camera/scanner errors
 */
const onError = (error: unknown) => {
  handleError(error);
  emit("error", errorMsg.value || "Unknown error");
};

/**
 * Toggle torch/flashlight
 */
const toggleTorch = () => {
  torchActive.value = !torchActive.value;
};
</script>

<template>
  <div class="relative w-full aspect-[4/3] bg-black rounded-lg overflow-hidden">
    <!-- Camera Stream -->
    <QrcodeStream
      v-if="props.active"
      :formats="props.formats"
      :torch="torchActive"
      class="h-full w-full"
      @detect="onDetect"
      @error="onError"
    >
      <!-- Reticle Overlay with Corner Markers -->
      <div
        class="absolute inset-0 pointer-events-none flex items-center justify-center"
      >
        <div
          class="relative w-[280px] h-[160px] border-2 rounded-lg transition-all duration-200"
          :class="
            isCooldown ? 'border-green-500 bg-green-500/20' : 'border-white/60'
          "
        >
          <!-- Corner Markers -->
          <div
            class="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-red-500 rounded-tl"
          />
          <div
            class="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-red-500 rounded-tr"
          />
          <div
            class="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-red-500 rounded-bl"
          />
          <div
            class="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-red-500 rounded-br"
          />

          <!-- Center Line Guide -->
          <div class="absolute top-1/2 left-0 right-0 h-[1px] bg-red-500/50" />
        </div>
      </div>
    </QrcodeStream>

    <!-- Inactive/Error State -->
    <div
      v-if="!active || errorMsg"
      class="absolute inset-0 flex items-center justify-center bg-gray-900"
    >
      <p v-if="errorMsg" class="text-red-400 text-center px-4">
        {{ errorMsg }}
      </p>
      <p v-else class="text-gray-400">Camera initializing...</p>
    </div>

    <!-- Torch Toggle Button -->
    <button
      class="absolute bottom-4 right-4 p-3 rounded-full backdrop-blur-sm transition-colors"
      :class="
        torchActive ? 'bg-amber-500 text-black' : 'bg-gray-900/80 text-white'
      "
      @click="toggleTorch"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path
          d="M18 6c0 2-2 2-2 4v10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V10c0-2-2-2-2-4V2h12z"
        />
        <line x1="6" x2="18" y1="6" y2="6" />
        <line x1="12" x2="12" y1="12" y2="12" />
      </svg>
    </button>

    <!-- Scanning Indicator -->
    <div v-if="active && !errorMsg" class="absolute top-2 right-2">
      <span class="flex h-3 w-3">
        <span
          class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
          :class="isCooldown ? 'bg-green-400' : 'bg-blue-400'"
        />
        <span
          class="relative inline-flex rounded-full h-3 w-3"
          :class="isCooldown ? 'bg-green-500' : 'bg-blue-500'"
        />
      </span>
    </div>
  </div>
</template>
