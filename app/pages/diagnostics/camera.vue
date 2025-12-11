<script setup lang="ts">
definePageMeta({
  layout: "default",
});

interface DiagnosticResult {
  name: string;
  status: "pending" | "success" | "warning" | "error";
  message: string;
  details?: string;
}

const results = ref<DiagnosticResult[]>([]);
const isRunning = ref(false);
const cameraStream = ref<MediaStream | null>(null);
const videoRef = ref<HTMLVideoElement | null>(null);
const isRequestingPermission = ref(false);

// Helper to add result
function addResult(result: DiagnosticResult) {
  results.value.push(result);
}

// Run all diagnostics
async function runDiagnostics() {
  results.value = [];
  isRunning.value = true;

  // Stop any existing stream
  if (cameraStream.value) {
    cameraStream.value.getTracks().forEach((track) => track.stop());
    cameraStream.value = null;
  }

  // 1. Check if running in secure context
  addResult({
    name: "Secure Context (HTTPS)",
    status: window.isSecureContext ? "success" : "error",
    message: window.isSecureContext
      ? "Running in secure context"
      : "NOT secure context - camera will not work",
    details: `Location: ${window.location.protocol}//${window.location.host}`,
  });

  // 2. Check navigator exists
  addResult({
    name: "Navigator API",
    status: typeof navigator !== "undefined" ? "success" : "error",
    message:
      typeof navigator !== "undefined"
        ? "Navigator available"
        : "Navigator not available",
  });

  // 3. Check mediaDevices
  const hasMediaDevices =
    typeof navigator !== "undefined" && !!navigator.mediaDevices;
  addResult({
    name: "MediaDevices API",
    status: hasMediaDevices ? "success" : "error",
    message: hasMediaDevices
      ? "MediaDevices API available"
      : "MediaDevices API not available",
    details: hasMediaDevices
      ? `getUserMedia: ${!!navigator.mediaDevices.getUserMedia}`
      : undefined,
  });

  // 4. Check Permissions API
  const hasPermissionsAPI =
    typeof navigator !== "undefined" && !!navigator.permissions?.query;
  addResult({
    name: "Permissions API",
    status: hasPermissionsAPI ? "success" : "warning",
    message: hasPermissionsAPI
      ? "Permissions API available"
      : "Permissions API not available (will try direct access)",
  });

  // 5. Query camera permission
  if (hasPermissionsAPI) {
    try {
      const permission = await navigator.permissions.query({
        name: "camera" as PermissionName,
      });
      const statusMap: Record<string, "success" | "warning" | "error"> = {
        granted: "success",
        prompt: "warning",
        denied: "error",
      };
      addResult({
        name: "Camera Permission",
        status: statusMap[permission.state] || "warning",
        message: `Permission state: ${permission.state}`,
        details:
          permission.state === "denied"
            ? "User has blocked camera access in browser settings. Tap the lock icon in the address bar → Site settings → Allow camera, then reload."
            : undefined,
      });
    } catch (err) {
      addResult({
        name: "Camera Permission",
        status: "warning",
        message: "Could not query camera permission",
        details: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // 6. Enumerate devices
  if (hasMediaDevices) {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((d) => d.kind === "videoinput");
      addResult({
        name: "Available Cameras",
        status: cameras.length > 0 ? "success" : "warning",
        message: `Found ${cameras.length} camera(s)`,
        details:
          cameras
            .map(
              (c, i) =>
                `${i + 1}. ${c.label || "Unknown"} (${c.deviceId.slice(
                  0,
                  8
                )}...)`
            )
            .join("\n") || "No labels available (permission not granted yet)",
      });
    } catch (err) {
      addResult({
        name: "Available Cameras",
        status: "error",
        message: "Failed to enumerate devices",
        details: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // 7. Try to get user media (actual camera access)
  if (hasMediaDevices && navigator.mediaDevices.getUserMedia) {
    try {
      addResult({
        name: "Camera Access Test",
        status: "pending",
        message: "Requesting camera access...",
      });

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      cameraStream.value = stream;

      // Update last result
      results.value[results.value.length - 1] = {
        name: "Camera Access Test",
        status: "success",
        message: "Camera access granted!",
        details: `Tracks: ${stream.getTracks().length}, Active: ${
          stream.active
        }`,
      };

      // Attach to video element if available
      if (videoRef.value) {
        videoRef.value.srcObject = stream;
      }

      // Get track settings
      const track = stream.getVideoTracks()[0];
      if (track) {
        const settings = track.getSettings();
        addResult({
          name: "Camera Settings",
          status: "success",
          message: `${settings.width}x${settings.height} @ ${settings.frameRate}fps`,
          details: `Device: ${settings.deviceId?.slice(0, 8)}...\nFacing: ${
            settings.facingMode || "unknown"
          }`,
        });

        // Check torch capability
        const capabilities =
          track.getCapabilities() as MediaTrackCapabilities & {
            torch?: boolean;
          };
        addResult({
          name: "Torch (Flash) Support",
          status: capabilities.torch ? "success" : "warning",
          message: capabilities.torch
            ? "Torch is supported"
            : "Torch not supported on this device",
        });
      }
    } catch (err) {
      results.value[results.value.length - 1] = {
        name: "Camera Access Test",
        status: "error",
        message: "Failed to access camera",
        details:
          err instanceof DOMException
            ? `${err.name}: ${err.message}${
                err.name === "NotAllowedError"
                  ? "\nHint: Allow camera access for this site in your browser settings, then refresh."
                  : ""
              }`
            : err instanceof Error
            ? err.message
            : String(err),
      };
    }
  }

  // 8. Check vue-qrcode-reader availability
  try {
    const { QrcodeStream } = await import("vue-qrcode-reader");
    addResult({
      name: "QR Scanner Library",
      status: "success",
      message: "vue-qrcode-reader loaded successfully",
      details: `QrcodeStream available: ${!!QrcodeStream}`,
    });
  } catch (err) {
    addResult({
      name: "QR Scanner Library",
      status: "error",
      message: "Failed to load vue-qrcode-reader",
      details: err instanceof Error ? err.message : String(err),
    });
  }

  isRunning.value = false;
}

// Stop camera
function stopCamera() {
  if (cameraStream.value) {
    cameraStream.value.getTracks().forEach((track) => track.stop());
    cameraStream.value = null;
  }
  if (videoRef.value) {
    videoRef.value.srcObject = null;
  }
}

// Manually request permission (useful when the browser cached a block)
async function requestPermission() {
  if (isRequestingPermission.value) return;
  if (typeof navigator === "undefined") {
    alert("Camera access can only be requested in the browser.");
    return;
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    alert("Camera access is not supported in this browser.");
    return;
  }
  isRequestingPermission.value = true;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    stream.getTracks().forEach((track) => track.stop());
    addResult({
      name: "Permission Request",
      status: "success",
      message: "Camera permission granted. Re-run diagnostics to verify.",
    });
  } catch (err) {
    addResult({
      name: "Permission Request",
      status: "error",
      message:
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Camera is blocked. Allow this site in the browser lock icon or Site settings, then retry."
          : err instanceof Error
          ? err.message
          : String(err),
    });
  } finally {
    isRequestingPermission.value = false;
  }
}

// Copy results to clipboard
function copyResults() {
  const text = results.value
    .map(
      (r) =>
        `${r.status.toUpperCase()}: ${r.name}\n  ${r.message}${
          r.details ? "\n  Details: " + r.details : ""
        }`
    )
    .join("\n\n");
  navigator.clipboard.writeText(text);
  alert("Results copied to clipboard!");
}

onUnmounted(() => {
  stopCamera();
});
</script>

<template>
  <main class="max-w-2xl mx-auto px-4 py-10 space-y-6">
    <header class="space-y-2">
      <p class="text-sm text-gray-500">Diagnostics</p>
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
        Camera Diagnostics
      </h1>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Test camera permissions and capabilities to debug scanner issues.
      </p>
    </header>

    <div class="flex gap-2 flex-wrap">
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        :disabled="isRunning"
        @click="runDiagnostics"
      >
        <span
          v-if="isRunning"
          class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
        />
        <span v-else>🔍</span>
        {{ isRunning ? "Running..." : "Run Diagnostics" }}
      </button>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-black hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-60"
        :disabled="isRunning || isRequestingPermission"
        @click="requestPermission"
      >
        <span
          v-if="isRequestingPermission"
          class="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent"
        />
        <span v-else>🔓</span>
        {{ isRequestingPermission ? "Requesting..." : "Request Camera Access" }}
      </button>

      <button
        v-if="cameraStream"
        type="button"
        class="inline-flex items-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
        @click="stopCamera"
      >
        ⏹️ Stop Camera
      </button>

      <button
        v-if="results.length > 0"
        type="button"
        class="inline-flex items-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
        @click="copyResults"
      >
        📋 Copy Results
      </button>
    </div>

    <!-- Camera Preview -->
    <div
      v-if="cameraStream"
      class="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
    >
      <video
        ref="videoRef"
        autoplay
        playsinline
        muted
        class="w-full aspect-video bg-black"
      />
    </div>

    <!-- Results -->
    <section v-if="results.length > 0" class="space-y-3">
      <h2 class="text-lg font-medium text-gray-900 dark:text-white">Results</h2>

      <div
        class="divide-y divide-gray-200 dark:divide-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
      >
        <div v-for="(result, index) in results" :key="index" class="p-4">
          <div class="flex items-start gap-3">
            <!-- Status Icon -->
            <span
              class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm"
              :class="{
                'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400':
                  result.status === 'success',
                'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400':
                  result.status === 'warning',
                'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400':
                  result.status === 'error',
                'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 animate-pulse':
                  result.status === 'pending',
              }"
            >
              <template v-if="result.status === 'success'">✓</template>
              <template v-else-if="result.status === 'warning'">⚠</template>
              <template v-else-if="result.status === 'error'">✗</template>
              <template v-else>○</template>
            </span>

            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-900 dark:text-white">
                {{ result.name }}
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ result.message }}
              </p>
              <pre
                v-if="result.details"
                class="mt-2 text-xs text-gray-500 dark:text-gray-500 whitespace-pre-wrap font-mono bg-gray-50 dark:bg-gray-800 p-2 rounded"
                >{{ result.details }}</pre
              >
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Links -->
    <section class="pt-6 border-t border-gray-200 dark:border-gray-700">
      <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
        Related Pages
      </h3>
      <div class="flex gap-2 flex-wrap">
        <NuxtLink
          to="/scan/mobile"
          class="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          → Mobile Scanner
        </NuxtLink>
        <NuxtLink
          to="/diagnostics/auth-providers"
          class="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          → Auth Providers
        </NuxtLink>
        <NuxtLink
          to="/settings"
          class="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          → Settings
        </NuxtLink>
      </div>
    </section>
  </main>
</template>
