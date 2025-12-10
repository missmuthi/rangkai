/**
 * usePwaInstall - Handle PWA install prompt
 *
 * Captures the browser's beforeinstallprompt event and provides
 * a clean API to trigger the install flow from UI components.
 *
 * Usage:
 * ```vue
 * <script setup>
 * const { canInstall, install } = usePwaInstall()
 * </script>
 * <template>
 *   <button v-if="canInstall" @click="install">
 *     Install App
 *   </button>
 * </template>
 * ```
 */

// TypeScript interface for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Extend Window interface to include the event
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

// Extend Navigator interface for iOS standalone property
interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

export function usePwaInstall() {
  const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null);
  const canInstall = computed(() => !!deferredPrompt.value);
  const isInstalled = ref(false);

  // Capture the install prompt event when browser fires it
  const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
    // Prevent the default mini-infobar from appearing
    e.preventDefault();

    // Stash the event so it can be triggered later
    deferredPrompt.value = e;

    console.info("[PWA] Install prompt ready");
  };

  // Trigger the install prompt
  const install = async () => {
    if (!deferredPrompt.value) {
      console.warn("[PWA] No install prompt available");
      return;
    }

    try {
      // Show the install prompt
      await deferredPrompt.value.prompt();

      // Wait for the user's choice
      const { outcome } = await deferredPrompt.value.userChoice;

      console.info(`[PWA] User ${outcome} the install prompt`);

      if (outcome === "accepted") {
        isInstalled.value = true;
      }

      // Clear the prompt (can only be used once)
      deferredPrompt.value = null;
    } catch (error) {
      console.error("[PWA] Install failed:", error);
    }
  };

  // Check if app is already installed
  const checkInstalled = () => {
    if (import.meta.client) {
      // Check if running in standalone mode
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;

      // iOS Safari detection
      const nav = window.navigator as NavigatorWithStandalone;
      const isIosInstalled = "standalone" in nav && nav.standalone === true;

      isInstalled.value = isStandalone || isIosInstalled;
    }
  };

  // Setup event listeners (only on client)
  onMounted(() => {
    if (import.meta.client) {
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

      // Check if already installed
      checkInstalled();

      // Listen for app installed event
      window.addEventListener("appinstalled", () => {
        console.info("[PWA] App successfully installed");
        isInstalled.value = true;
        deferredPrompt.value = null;
      });
    }
  });

  // Cleanup
  onUnmounted(() => {
    if (import.meta.client) {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    }
  });

  return {
    canInstall: readonly(canInstall),
    isInstalled: readonly(isInstalled),
    install,
  };
}
