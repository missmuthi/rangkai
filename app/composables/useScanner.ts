import type { Html5Qrcode, Html5QrcodeCameraScanConfig } from 'html5-qrcode'

export function useScanner() {
  const isScanning = ref(false)
  const error = ref<string | null>(null)
  const scanner = ref<Html5Qrcode | null>(null)

  // Sound effect with fallback to Web Audio API
  let beepAudio: HTMLAudioElement | null = null
  let audioContext: AudioContext | null = null

  const initAudio = () => {
    if (typeof window === 'undefined') return
    
    // Try to load audio file
    try {
      beepAudio = new Audio('/sounds/beep.mp3')
      beepAudio.preload = 'auto'
    } catch {
      beepAudio = null
    }
  }

  // Initialize on first use
  initAudio()

  const playBeep = () => {
    // Try HTML Audio first
    if (beepAudio) {
      beepAudio.currentTime = 0
      beepAudio.play().catch(() => {
        // Fallback to Web Audio API beep
        playWebAudioBeep()
      })
      return
    }
    // Fallback to Web Audio API
    playWebAudioBeep()
  }

  const playWebAudioBeep = () => {
    try {
      if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 1000 // 1000 Hz beep
      oscillator.type = 'sine'
      gainNode.gain.value = 0.3
      
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.1) // 100ms beep
    } catch {
      // Silently fail if Web Audio API is not available
    }
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
