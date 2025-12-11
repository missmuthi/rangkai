/**
 * useIosCacheDetection.ts
 * Detects when iOS Safari has purged the PWA cache/IndexedDB
 * (iOS can delete PWA data after ~7 days of inactivity)
 */

const CACHE_MARKER_KEY = "rangkai_cache_marker";
const LAST_VISIT_KEY = "rangkai_last_visit";

export function useIosCacheDetection() {
  const toast = useToast();
  const wasCacheCleared = ref(false);
  const daysSinceLastVisit = ref(0);

  /**
   * Check for iOS cache purge on app launch
   * Call this in app.vue or a layout's onMounted
   */
  const checkCacheIntegrity = () => {
    if (!import.meta.client) return;

    const now = Date.now();
    const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
    const cacheMarker = localStorage.getItem(CACHE_MARKER_KEY);

    // Update last visit timestamp
    localStorage.setItem(LAST_VISIT_KEY, String(now));

    // First visit ever - set marker
    if (!cacheMarker) {
      localStorage.setItem(CACHE_MARKER_KEY, "v1");
      return;
    }

    // If marker exists but localStorage is suspiciously empty, cache may have been cleared
    // Also check if user hasn't visited in a while (iOS purge threshold)
    if (lastVisit) {
      const days = Math.floor(
        (now - Number(lastVisit)) / (1000 * 60 * 60 * 24)
      );
      daysSinceLastVisit.value = days;

      // iOS typically purges after 7+ days of inactivity
      if (days >= 7) {
        // Check if other critical data is missing (offline queue, etc.)
        const offlineQueue = localStorage.getItem("rangkai_offline_queue");

        // If queue should exist but doesn't, or other signs of purge
        if (offlineQueue === null && cacheMarker) {
          wasCacheCleared.value = true;
          showCacheClearedWarning();
        }
      }
    }
  };

  /**
   * Show user-friendly warning when cache was cleared
   */
  const showCacheClearedWarning = () => {
    toast.add({
      id: "cache-cleared",
      title: "Data refreshed",
      description:
        "Your device cleared cached data. Some offline scans may need to be re-synced.",
      color: "yellow",
      timeout: 10000,
    });
  };

  /**
   * Detect if running on iOS (for conditional logic)
   */
  const isIos = computed(() => {
    if (!import.meta.client) return false;
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as unknown as { MSStream?: unknown }).MSStream
    );
  });

  /**
   * Detect if running as installed PWA
   */
  const isInstalledPwa = computed(() => {
    if (!import.meta.client) return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true
    );
  });

  return {
    checkCacheIntegrity,
    wasCacheCleared: readonly(wasCacheCleared),
    daysSinceLastVisit: readonly(daysSinceLastVisit),
    isIos,
    isInstalledPwa,
  };
}
