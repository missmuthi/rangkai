import type { Html5Qrcode, Html5QrcodeCameraScanConfig } from 'html5-qrcode'

export function useScanner() {
  const isScanning = ref(false)
  const error = ref<string | null>(null)
  const scanner = ref<Html5Qrcode | null>(null)

  // Sound effect
  const beep = new Audio('/sounds/beep.mp3')
  const playBeep = () => {
    beep.play().catch(() => {}) // Ignore auto-play errors
  }

  // Haptic feedback (vibration)
  const vibrate = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50) // Short 50ms vibration
    }
  }

  // Combined feedback on scan success
  const triggerScanFeedback = () => {
    playBeep()
    vibrate()
  }

  async function startScanner(
    elementId: string,
    onResult: (text: string) => void,
    onError?: (error: string) => void
  ) {
    try {
      // Allow e2e tests to disable camera usage
      if (typeof window !== 'undefined' && (window as any).__SCANNER_DISABLED__) {
        isScanning.value = false
        error.value = null
        return
      }

      if (scanner.value) {
        await stopScanner()
      }

      // Dynamic import to reduce bundle size
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode')

      const instance = new Html5Qrcode(elementId, { 
        verbose: false,
        useBarCodeDetectorIfSupported: true,
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.QR_CODE
        ]
      })
      
      scanner.value = instance
      
      const config: Html5QrcodeCameraScanConfig = { 
        fps: 12, 
        qrbox: { width: 320, height: 200 },
        aspectRatio: 4 / 3,
        disableFlip: true // better for 1D barcodes
      }

      await instance.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          triggerScanFeedback()
          onResult(decodedText)
        },
        (_errorMessage) => {
          // Ignore frequent scanning errors, only report critical ones if needed
          // onError(errorMessage) 
        }
      )
      
      isScanning.value = true
      error.value = null
    } catch (e: unknown) {
      error.value = (e instanceof Error) ? e.message : 'Failed to start camera'
      isScanning.value = false
      if (onError && error.value) {
        onError(error.value)
      }
      console.error('Scanner failed to start', e)
    }
  }

  async function stopScanner() {
    if (scanner.value) {
      try {
        await scanner.value.stop()
        scanner.value.clear()
        isScanning.value = false
      } catch (e) {
        console.error('Failed to stop scanner', e)
      } finally {
        scanner.value = null
      }
    }
  }

  onUnmounted(() => {
    stopScanner()
  })

  return {
    isScanning,
    error,
    startScanner,
    stopScanner
  }
}
