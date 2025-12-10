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
    console.log('[Scanner] Starting scanner initialization...')
    console.log('[Scanner] Element ID:', elementId)
    
    try {
      // Allow e2e tests to disable camera usage
      if (typeof window !== 'undefined' && (window as any).__SCANNER_DISABLED__) {
        console.log('[Scanner] Scanner disabled by test flag')
        isScanning.value = false
        error.value = null
        return
      }

      if (scanner.value) {
        console.log('[Scanner] Previous scanner instance found, stopping...')
        await stopScanner()
      }

      // Check if element exists
      const element = document.getElementById(elementId)
      console.log('[Scanner] Target element:', element ? 'found' : 'NOT FOUND')
      if (!element) {
        throw new Error(`Element with id "${elementId}" not found in DOM`)
      }

      // Check camera permissions
      console.log('[Scanner] Checking camera permissions...')
      try {
        const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName })
        console.log('[Scanner] Camera permission state:', permissions.state)
      } catch (permErr) {
        console.log('[Scanner] Could not query camera permission:', permErr)
      }

      // Check available cameras
      console.log('[Scanner] Enumerating media devices...')
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const cameras = devices.filter(d => d.kind === 'videoinput')
        console.log('[Scanner] Available cameras:', cameras.length)
        cameras.forEach((cam, i) => {
          console.log(`[Scanner]   Camera ${i}: ${cam.label || 'unnamed'} (${cam.deviceId.slice(0, 8)}...)`)
        })
      } catch (devErr) {
        console.log('[Scanner] Could not enumerate devices:', devErr)
      }

      // Dynamic import to reduce bundle size
      console.log('[Scanner] Importing html5-qrcode library...')
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode')
      console.log('[Scanner] Library imported successfully')

      console.log('[Scanner] Creating Html5Qrcode instance...')
      const instance = new Html5Qrcode(elementId, { 
        verbose: true, // Enable verbose logging
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
      console.log('[Scanner] Html5Qrcode instance created')
      
      scanner.value = instance
      
      const config: Html5QrcodeCameraScanConfig = { 
        fps: 12, 
        qrbox: { width: 320, height: 200 },
        aspectRatio: 4 / 3,
        disableFlip: true // better for 1D barcodes
      }
      console.log('[Scanner] Config:', JSON.stringify(config))

      console.log('[Scanner] Starting camera with facingMode: environment...')
      await instance.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          console.log('[Scanner] Scan success:', decodedText)
          triggerScanFeedback()
          onResult(decodedText)
        },
        (_errorMessage) => {
          // Ignore frequent scanning errors, only report critical ones if needed
          // console.log('[Scanner] Scan error:', _errorMessage)
        }
      )
      
      console.log('[Scanner] Camera started successfully!')
      isScanning.value = true
      error.value = null
    } catch (e: unknown) {
      const errorMessage = (e instanceof Error) ? e.message : 'Failed to start camera'
      console.error('[Scanner] FAILED TO START:', errorMessage)
      console.error('[Scanner] Full error:', e)
      error.value = errorMessage
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
