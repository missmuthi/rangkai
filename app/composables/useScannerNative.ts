/**
 * useScannerNative.ts
 * Lightweight composable for native barcode scanner state and feedback
 */

export function useScannerNative() {
  // State
  const isCooldown = ref(false);
  const torchActive = ref(false);
  const errorMsg = ref<string | null>(null);
  const lastScannedCode = ref("");

  // Audio context for beep
  let audioContext: AudioContext | null = null;

  /**
   * Play a beep sound using Web Audio API
   */
  const playBeep = () => {
    if (typeof window === "undefined") return;

    try {
      if (!audioContext) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        audioContext = new AudioContextClass();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 1000; // 1000 Hz beep
      oscillator.type = "sine";
      gainNode.gain.value = 0.3;

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1); // 100ms beep
    } catch {
      // Silently fail if Web Audio API not available
    }
  };

  /**
   * Trigger haptic feedback (vibration)
   */
  const vibrate = () => {
    if ("vibrate" in navigator) {
      navigator.vibrate(50); // 50ms vibration
    }
  };

  /**
   * Combined feedback on successful scan
   */
  const triggerScanFeedback = () => {
    playBeep();
    vibrate();
  };

  /**
   * Trigger cooldown period (prevents duplicate scans)
   * @param durationMs - Cooldown duration in milliseconds (default 1500ms)
   */
  const triggerCooldown = (durationMs = 1500) => {
    isCooldown.value = true;
    triggerScanFeedback();

    setTimeout(() => {
      isCooldown.value = false;
    }, durationMs);
  };

  /**
   * Check if a scan should be processed (debounce + cooldown)
   */
  const shouldProcessScan = (code: string): boolean => {
    if (isCooldown.value) return false;
    if (code === lastScannedCode.value) return false;
    return true;
  };

  /**
   * Record a successful scan
   */
  const recordScan = (code: string) => {
    lastScannedCode.value = code;
    triggerCooldown();
  };

  /**
   * Set error message from camera/scanner errors
   */
  const handleError = (error: unknown) => {
    const err = error as { name?: string };
    const name = err?.name || "Unknown";

    if (name === "NotAllowedError") {
      errorMsg.value = "Camera permission denied. Please check settings.";
    } else if (name === "NotFoundError") {
      errorMsg.value = "No camera device found.";
    } else if (name === "NotSupportedError") {
      errorMsg.value = "Secure context required (HTTPS or localhost).";
    } else {
      errorMsg.value = `Camera error: ${name}`;
    }
  };

  /**
   * Clear error state
   */
  const clearError = () => {
    errorMsg.value = null;
  };

  return {
    // State
    isCooldown: readonly(isCooldown),
    torchActive,
    errorMsg: readonly(errorMsg),
    lastScannedCode: readonly(lastScannedCode),

    // Actions
    triggerCooldown,
    triggerScanFeedback,
    shouldProcessScan,
    recordScan,
    handleError,
    clearError,
  };
}
