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

  async function startScanner(
    elementId: string,
    onResult: (text: string) => void,
    onError?: (error: string) => void
  ) {
    try {
      if (scanner.value) {
        await stopScanner()
      }

      // Dynamic import to reduce bundle size
      const { Html5Qrcode } = await import('html5-qrcode')

      const instance = new Html5Qrcode(elementId, { 
        verbose: false,
        useBarCodeDetectorIfSupported: true
      })
      
      scanner.value = instance
      
      const config: Html5QrcodeCameraScanConfig = { 
        fps: 10, 
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.0
      }

      await instance.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          playBeep()
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
