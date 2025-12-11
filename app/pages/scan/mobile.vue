<script setup lang="ts">
/**
 * Mobile Scanner Page
 * Uses native vue-qrcode-reader for hardware-accelerated barcode scanning
 */
definePageMeta({
  middleware: "auth",
  layout: "scanner",
});

const router = useRouter();
const toast = useToast();
const { book, loading, error, searchByISBN, cleanMetadata } = useBookSearch();
const {
  isOnline,
  queue: offlineQueue,
  addToQueue,
  syncQueue,
  isSyncing,
} = useOfflineQueue();

// Scanner state
const scannerActive = ref(true);
const scannerError = ref<string | null>(null);

// Rapid Fire Mode
const isRapidMode = ref(true);
const sessionQueue = ref<string[]>([]);
const isProcessing = ref(false);
const processProgress = ref(0);
const autoClean = ref(true);

/**
 * Handle successful barcode scan
 */
function onScan(isbn: string) {
  // Normalize ISBN (remove hyphens/spaces)
  const normalizedIsbn = isbn.replace(/[-\s]/g, "");

  // Validate ISBN format (ISBN-13 with 978/979 prefix)
  if (!/^97[89]\d{10}$/.test(normalizedIsbn)) {
    return;
  }

  // If offline, add to offline queue
  if (!isOnline.value) {
    addToQueue(normalizedIsbn, autoClean.value);
    toast.add({
      title: "Queued for later",
      description: `${normalizedIsbn} saved offline`,
      color: "yellow",
    });
    return;
  }

  if (isRapidMode.value) {
    // Rapid Fire: Queue only, don't process yet
    if (!sessionQueue.value.includes(normalizedIsbn)) {
      sessionQueue.value.push(normalizedIsbn);
    }
  } else {
    // Normal mode: Navigate to book page
    router.push(`/book/${normalizedIsbn}`);
  }
}

/**
 * Handle scanner errors
 */
function onScanError(message: string) {
  scannerError.value = message;
  toast.add({
    title: "Camera error",
    description: message,
    color: "red",
  });
}

function removeFromQueue(isbn: string) {
  sessionQueue.value = sessionQueue.value.filter((i) => i !== isbn);
}

function clearSession() {
  sessionQueue.value = [];
}

async function processSession() {
  if (sessionQueue.value.length === 0) return;

  isProcessing.value = true;
  processProgress.value = 0;
  const total = sessionQueue.value.length;
  let processed = 0;

  for (const isbn of sessionQueue.value) {
    try {
      await searchByISBN(isbn);
      if (autoClean.value && book.value) {
        await cleanMetadata(book.value);
      }
      processed++;
      processProgress.value = Math.round((processed / total) * 100);
    } catch (err) {
      console.error(`Failed to process ${isbn}:`, err);
    }
  }

  toast.add({
    title: "Batch complete!",
    description: `Processed ${processed} of ${total} books`,
    color: "green",
  });

  sessionQueue.value = [];
  isProcessing.value = false;
  router.push("/history");
}
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-white pb-20">
    <!-- Floating Badge Counter -->
    <Transition name="bounce">
      <div
        v-if="isRapidMode && sessionQueue.length > 0"
        class="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg"
      >
        {{ sessionQueue.length }} scanned
      </div>
    </Transition>

    <!-- Offline Indicator -->
    <div
      v-if="!isOnline"
      class="fixed top-4 left-4 z-50 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
    >
      <span class="animate-pulse">●</span> Offline
    </div>

    <!-- Offline Queue Badge -->
    <div
      v-if="offlineQueue.length > 0"
      class="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold cursor-pointer"
      @click="syncQueue"
    >
      {{ isSyncing ? "Syncing..." : `${offlineQueue.length} queued` }}
    </div>

    <!-- Native Scanner Component -->
    <ScannerNative
      :active="scannerActive"
      :formats="['ean_13']"
      @scan="onScan"
      @error="onScanError"
    />

    <!-- Mode Badge Overlay -->
    <div class="absolute top-14 left-2 z-10">
      <div
        class="px-2 py-1 rounded text-xs font-bold"
        :class="isRapidMode ? 'bg-amber-500' : 'bg-blue-500'"
      >
        {{ isRapidMode ? "⚡ RAPID FIRE" : "📖 NORMAL" }}
      </div>
    </div>

    <!-- Controls -->
    <div class="p-4 space-y-3 border-b border-gray-800">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <label class="flex items-center gap-2 cursor-pointer">
          <input v-model="isRapidMode" type="checkbox" class="rounded" />
          <span class="text-sm">Rapid Fire Mode</span>
        </label>

        <label class="flex items-center gap-2 cursor-pointer">
          <input v-model="autoClean" type="checkbox" class="rounded" />
          <span class="text-sm">Auto AI Clean</span>
        </label>
      </div>
    </div>

    <!-- Rapid Fire: Session Queue -->
    <div v-if="isRapidMode" class="p-4">
      <div
        v-if="sessionQueue.length === 0"
        class="text-center text-gray-500 py-8"
      >
        <p class="text-4xl mb-2">📚</p>
        <p>Point camera at barcodes to start scanning</p>
        <p class="text-xs mt-1">Books will be queued for batch processing</p>
      </div>

      <div v-else class="space-y-3">
        <div class="flex justify-between items-center">
          <span class="font-bold text-green-400"
            >{{ sessionQueue.length }} books queued</span
          >
          <button
            class="text-red-400 text-sm hover:text-red-300"
            @click="clearSession"
          >
            Clear All
          </button>
        </div>

        <!-- Queue List -->
        <div class="max-h-40 overflow-y-auto space-y-2">
          <div
            v-for="isbn in sessionQueue"
            :key="isbn"
            class="flex justify-between items-center bg-gray-800 p-2 rounded text-sm font-mono"
          >
            <span>{{ isbn }}</span>
            <button
              class="text-gray-500 hover:text-red-400 px-2"
              @click="removeFromQueue(isbn)"
            >
              ×
            </button>
          </div>
        </div>

        <!-- Process Button -->
        <button
          :disabled="isProcessing"
          class="w-full py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 rounded-lg font-bold text-lg transition-colors"
          @click="processSession"
        >
          <span v-if="isProcessing">Processing... {{ processProgress }}%</span>
          <span v-else>✓ Finish & Process All</span>
        </button>
      </div>
    </div>

    <!-- Normal Mode: Result Panel -->
    <div v-else class="p-4">
      <div v-if="loading" class="animate-pulse bg-gray-800 h-32 rounded-lg" />
      <div v-else-if="error" class="bg-red-900/50 text-red-300 p-4 rounded-lg">
        {{ error }}
      </div>
      <div v-else-if="book">
        <BookCard :book="book" :show-actions="false" />
      </div>
      <div v-else class="text-center text-gray-500 py-8">
        <p>Point camera at a barcode to scan</p>
      </div>
    </div>

    <!-- Navigation Footer -->
    <div
      class="fixed bottom-0 inset-x-0 bg-gray-900 border-t border-gray-800 p-3 flex justify-around items-center text-sm z-10 pb-6 sm:pb-3"
    >
      <NuxtLink
        to="/dashboard"
        class="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors p-2"
      >
        <component :is="resolveComponent('LucideHome')" class="h-5 w-5" />
        <span class="text-xs">Home</span>
      </NuxtLink>

      <NuxtLink
        to="/scan/batch"
        class="flex flex-col items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors p-2"
      >
        <component
          :is="resolveComponent('LucideClipboardList')"
          class="h-5 w-5"
        />
        <span class="text-xs">Batch</span>
      </NuxtLink>

      <NuxtLink
        to="/history"
        class="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors p-2"
      >
        <component :is="resolveComponent('LucideHistory')" class="h-5 w-5" />
        <span class="text-xs">History</span>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.bounce-enter-active {
  animation: bounce-in 0.3s;
}
.bounce-leave-active {
  animation: bounce-in 0.2s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
</style>
