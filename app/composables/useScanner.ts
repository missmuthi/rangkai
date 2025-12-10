import type { Html5Qrcode, Html5QrcodeCameraScanConfig } from 'html5-qrcode'

type CameraConfig = Parameters<Html5Qrcode['start']>[0]
type PermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported'
type CameraDevice = { id: string; label: string }

export function useScanner() {
  const isScanning = ref(false)
  const error = ref<string | null>(null)
  const scanner = ref<Html5Qrcode | null>(null)
  const availableCameras = ref<CameraDevice[]>([])
  const permissionState = ref<PermissionState>('prompt')
  const torchSupported = ref(false)
  const torchOn = ref(false)

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

  const formatError = (err: unknown) => {
    if (typeof err === 'string') {
      return err
    }
    if (err && typeof err === 'object' && 'message' in err) {
      return String((err as { message?: string }).message)
    }
    return 'Failed to start camera'
  }

  const describePermissionIssue = (err: unknown) => {
    if (err instanceof DOMException) {
      if (err.name === 'NotAllowedError') {
        return 'Camera access is blocked. Allow access in your browser settings and reload.'
      }
      if (err.name === 'NotFoundError') {
        return 'No camera found on this device.'
      }
    }
    return formatError(err)
  }

  const listCameras = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) {
      availableCameras.value = []
      return []
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const cameras = devices.filter(device => device.kind === 'videoinput')
      availableCameras.value = cameras.map((camera, index) => ({
        id: camera.deviceId,
        label: camera.label || `Camera ${index + 1}`
      }))
      return availableCameras.value
    } catch (err) {
      console.error('[Scanner] Failed to enumerate cameras:', err)
      availableCameras.value = []
      return []
    }
  }

  const checkPermission = async () => {
    console.log('[Scanner] checkPermission called')
    console.log('[Scanner] navigator exists:', typeof navigator !== 'undefined')
    console.log('[Scanner] navigator.permissions exists:', typeof navigator !== 'undefined' && !!navigator.permissions)
    console.log('[Scanner] navigator.permissions.query exists:', typeof navigator !== 'undefined' && !!navigator.permissions?.query)
    console.log('[Scanner] navigator.mediaDevices exists:', typeof navigator !== 'undefined' && !!navigator.mediaDevices)
    console.log('[Scanner] navigator.mediaDevices.getUserMedia exists:', typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia)
    
    if (typeof navigator === 'undefined' || !navigator.permissions?.query) {
      console.log('[Scanner] Permission API not available, returning unsupported')
      permissionState.value = 'unsupported'
      return permissionState.value
    }
    try {
      console.log('[Scanner] Querying camera permission...')
      const permission = await navigator.permissions.query({ name: 'camera' as PermissionName })
      console.log('[Scanner] Permission query result:', permission.state)
      permissionState.value = permission.state as PermissionState
      permission.onchange = () => {
        console.log('[Scanner] Permission changed to:', permission.state)
        permissionState.value = permission.state as PermissionState
      }
    } catch (err) {
      console.log('[Scanner] Could not query permission API:', err)
      console.log('[Scanner] Error type:', typeof err)
      console.log('[Scanner] Error message:', err instanceof Error ? err.message : String(err))
      permissionState.value = 'unsupported'
    }
    console.log('[Scanner] Final permission state:', permissionState.value)
    return permissionState.value
  }

  const requestCameraAccess = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      permissionState.value = 'unsupported'
      throw new Error('Camera is not available on this device/browser.')
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      permissionState.value = 'granted'
      stream.getTracks().forEach(track => track.stop())
      return true
    } catch (err) {
      console.error('[Scanner] Camera permission request failed:', err)
      const message = describePermissionIssue(err)
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        permissionState.value = 'denied'
      }
      throw new Error(message)
    }
  }

  const updateTorchSupport = () => {
    torchSupported.value = false
    torchOn.value = false
    if (!scanner.value) return
    const capabilities = (scanner.value as any).getRunningTrackCapabilities?.() as MediaTrackCapabilities | undefined
    if (!capabilities) return
    const supported = 'torch' in capabilities ? Boolean((capabilities as any).torch) : false
    torchSupported.value = supported
  }

  const setTorch = async (enabled: boolean) => {
    if (!scanner.value || !torchSupported.value) return
    try {
      await scanner.value.applyVideoConstraints({ advanced: [{ torch: enabled } as any] })
      torchOn.value = enabled
    } catch (err) {
      console.error('[Scanner] Failed to toggle torch:', err)
    }
  }

  async function startScanner(
    elementId: string,
    onResult: (text: string) => void,
    onError?: (error: string) => void,
    options?: { deviceId?: string }
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
      const permission = await checkPermission()
      console.log('[Scanner] Camera permission state:', permission)
      if (permission !== 'granted') {
        console.log('[Scanner] Requesting camera permission via getUserMedia...')
        await requestCameraAccess()
      }

      // Check available cameras
      console.log('[Scanner] Enumerating media devices...')
      const cameras = await listCameras()
      console.log('[Scanner] Available cameras:', cameras.length)
      cameras.forEach((cam, i) => {
        console.log(`[Scanner]   Camera ${i}: ${cam.label} (${cam.id.slice(0, 8)}...)`)
      })

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

      let lastError: unknown = null
      const tryStart = async (cameraConfig: CameraConfig, label: string) => {
        console.log(`[Scanner] Starting camera with ${label}...`)
        try {
          await instance.start(
            cameraConfig,
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
          updateTorchSupport()
          return true
        } catch (startErr) {
          lastError = startErr
          console.error(`[Scanner] Failed to start with ${label}:`, startErr)
          return false
        }
      }

      const attempts: { config: CameraConfig; label: string }[] = []
      if (options?.deviceId) {
        attempts.push({ config: options.deviceId, label: `deviceId: ${options.deviceId}` })
      }
      attempts.push(
        { config: { facingMode: 'environment' }, label: 'facingMode: environment' },
        { config: { facingMode: 'user' }, label: 'facingMode: user' }
      )

      let started = false
      for (const attempt of attempts) {
        started = await tryStart(attempt.config, attempt.label)
        if (started) break
      }

      if (!started) {
        try {
          const cameras = await Html5Qrcode.getCameras()
          console.log('[Scanner] Available cameras for fallback:', cameras.length)
          const fallbackList = cameras.filter(Boolean)
          if (fallbackList.length > 0) {
            availableCameras.value = fallbackList.map((cam, index) => ({
              id: cam.id,
              label: cam.label || `Camera ${index + 1}`
            }))
            const fallbackCamera = fallbackList.find(cam => cam.id === options?.deviceId) || fallbackList[0]
            console.log('[Scanner] Retrying with camera ID:', fallbackCamera!.id)
            started = await tryStart(fallbackCamera!.id, `deviceId: ${fallbackCamera!.id}`)
          }
        } catch (cameraListErr) {
          lastError = cameraListErr
          console.error('[Scanner] Failed to list cameras for fallback:', cameraListErr)
        }
      }

      if (!started) {
        throw lastError ?? new Error('Failed to start camera')
      }
    } catch (e: unknown) {
      const errorMessage = formatError(e)
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
        torchSupported.value = false
        torchOn.value = false
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
    stopScanner,
    availableCameras,
    permissionState,
    requestCameraAccess,
    torchSupported,
    torchOn,
    setTorch,
    listCameras
  }
}
