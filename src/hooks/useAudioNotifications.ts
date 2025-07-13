import { useState, useEffect, useCallback, useRef } from 'react'

interface AudioNotificationState {
  isEnabled: boolean
  isInitialized: boolean
  isSupported: boolean
  contextState: string
}

interface UseAudioNotificationsReturn {
  isEnabled: boolean
  isInitialized: boolean
  isSupported: boolean
  contextState: string
  enable: () => void
  disable: () => void
  toggle: () => boolean
  playTestSound: () => Promise<void>
  getStatus: () => AudioNotificationState
}

// Audio configuration constants (matching legacy dashboard)
const AUDIO_CONFIG = {
  FREQUENCY: 2093, // C7 note frequency (very high pitch)
  DURATION: 1200, // 1.2 seconds
  VOLUME: 0.3, // 30% volume
  FADE_OUT_DURATION: 0.8, // 800ms fade out
  CONTEXT_RESUME_TIMEOUT: 5000,
} as const

/**
 * Audio capabilities detection
 */
const getAudioCapabilities = (): boolean => {
  return 'AudioContext' in window || 'webkitAudioContext' in window
}

/**
 * Custom hook for audio notifications with background support
 * Implements glass-like notification sounds using Web Audio API
 * Handles browser autoplay policies and background audio playback
 */
export const useAudioNotifications = (): UseAudioNotificationsReturn => {
  const [state, setState] = useState<AudioNotificationState>({
    isEnabled: true,
    isInitialized: false,
    isSupported: getAudioCapabilities(),
    contextState: 'closed',
  })

  const audioContextRef = useRef<AudioContext | null>(null)
  const initializationAttemptedRef = useRef<boolean>(false)

  /**
   * Update audio context state in component state
   */
  const updateContextState = useCallback((): void => {
    setState((prev) => ({
      ...prev,
      contextState: audioContextRef.current?.state ?? 'closed',
    }))
  }, [])

  /**
   * Resume audio context if suspended
   */
  const resumeAudioContext = useCallback(async (): Promise<void> => {
    if (!audioContextRef.current) return

    try {
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume()
        // Audio context resumed successfully
      }
      updateContextState()
    } catch {
      // Failed to resume audio context - continue silently
    }
  }, [updateContextState])

  /**
   * Initialize audio context (must be called after user interaction)
   */
  const initializeAudioContext = useCallback(async (): Promise<void> => {
    if (initializationAttemptedRef.current || !state.isSupported) {
      return
    }

    try {
      // Create audio context
      const AudioContextConstructor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      audioContextRef.current = new AudioContextConstructor()

      initializationAttemptedRef.current = true

      setState((prev) => ({
        ...prev,
        isInitialized: true,
      }))

      // Resume context if suspended
      await resumeAudioContext()
    } catch {
      // Failed to initialize audio context
      setState((prev) => ({
        ...prev,
        isInitialized: false,
      }))
    }
  }, [state.isSupported, resumeAudioContext])

  /**
   * Generate and play glass-like notification sound
   * Matches legacy dashboard audio specifications exactly
   */
  const playNotificationSound = useCallback(async (): Promise<void> => {
    if (!state.isEnabled || !audioContextRef.current || !state.isInitialized) {
      return
    }

    try {
      // Ensure context is running
      await resumeAudioContext()

      if (audioContextRef.current.state !== 'running') {
        return
      }

      // Create audio nodes for glass-like sound
      const oscillator = audioContextRef.current.createOscillator()
      const gainNode = audioContextRef.current.createGain()
      const filterNode = audioContextRef.current.createBiquadFilter()

      // Configure oscillator - C7 note (2093 Hz)
      oscillator.frequency.setValueAtTime(
        AUDIO_CONFIG.FREQUENCY,
        audioContextRef.current.currentTime,
      )
      oscillator.type = 'sine'

      // Configure bandpass filter for glass-like sound
      filterNode.type = 'bandpass'
      filterNode.frequency.setValueAtTime(
        AUDIO_CONFIG.FREQUENCY,
        audioContextRef.current.currentTime,
      )
      filterNode.Q.setValueAtTime(10, audioContextRef.current.currentTime)

      // Configure gain (volume and fade out)
      gainNode.gain.setValueAtTime(AUDIO_CONFIG.VOLUME, audioContextRef.current.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContextRef.current.currentTime + AUDIO_CONFIG.FADE_OUT_DURATION,
      )

      // Connect the audio processing chain: Oscillator → Filter → Gain → Destination
      oscillator.connect(filterNode)
      filterNode.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)

      // Play sound
      oscillator.start(audioContextRef.current.currentTime)
      oscillator.stop(audioContextRef.current.currentTime + AUDIO_CONFIG.DURATION / 1000)
    } catch {
      // Audio playback failed - continue silently
    }
  }, [state.isEnabled, state.isInitialized, resumeAudioContext])

  /**
   * Set up audio initialization on first user interaction
   */
  useEffect(() => {
    if (!state.isSupported || initializationAttemptedRef.current) {
      return
    }

    const initAudio = (): void => {
      void initializeAudioContext()
      document.removeEventListener('click', initAudio)
      document.removeEventListener('keydown', initAudio)
    }

    // Wait for user interaction to initialize audio context
    document.addEventListener('click', initAudio, { once: true })
    document.addEventListener('keydown', initAudio, { once: true })

    return () => {
      document.removeEventListener('click', initAudio)
      document.removeEventListener('keydown', initAudio)
    }
  }, [state.isSupported, initializeAudioContext])

  /**
   * Listen for Claude hook events and play notification sounds
   */
  useEffect(() => {
    const handleClaudeHookEvent = (): void => {
      void playNotificationSound()
    }

    // Listen for claude-hook-received events from SSE
    window.addEventListener('claude-hook-received', handleClaudeHookEvent)

    return () => {
      window.removeEventListener('claude-hook-received', handleClaudeHookEvent)
    }
  }, [playNotificationSound])

  /**
   * Update context state periodically
   */
  useEffect(() => {
    const interval = setInterval(updateContextState, 1000)
    return () => clearInterval(interval)
  }, [updateContextState])

  /**
   * Cleanup on component unmount
   */
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        void audioContextRef.current.close()
        audioContextRef.current = null
      }
    }
  }, [])

  // Public API functions
  const enable = useCallback((): void => {
    setState((prev) => ({ ...prev, isEnabled: true }))
  }, [])

  const disable = useCallback((): void => {
    setState((prev) => ({ ...prev, isEnabled: false }))
  }, [])

  const toggle = useCallback((): boolean => {
    setState((prev) => ({ ...prev, isEnabled: !prev.isEnabled }))
    return !state.isEnabled
  }, [state.isEnabled])

  const playTestSound = useCallback(async (): Promise<void> => {
    try {
      // Ensure audio is initialized before test
      if (!state.isInitialized) {
        await initializeAudioContext()
      }
      await playNotificationSound()
    } catch {
      // Test sound failed - continue silently
    }
  }, [state.isInitialized, initializeAudioContext, playNotificationSound])

  const getStatus = useCallback((): AudioNotificationState => {
    return {
      isEnabled: state.isEnabled,
      isInitialized: state.isInitialized,
      isSupported: state.isSupported,
      contextState: audioContextRef.current?.state ?? 'closed',
    }
  }, [state])

  return {
    isEnabled: state.isEnabled,
    isInitialized: state.isInitialized,
    isSupported: state.isSupported,
    contextState: state.contextState,
    enable,
    disable,
    toggle,
    playTestSound,
    getStatus,
  }
}
