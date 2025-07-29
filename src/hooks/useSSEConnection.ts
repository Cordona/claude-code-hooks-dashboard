import { useState, useEffect, useCallback, useRef } from 'react'

interface SSEConnectionState {
  isConnected: boolean
  isConnecting: boolean
  reconnectAttempts: number
  error: string | null
  userInitialized: boolean
  initializingUser: boolean
  initializationError: string | null
  initializationAttempts: number
}

interface UseSSEConnectionOptions {
  isAuthenticated: boolean
  accessToken?: string | undefined
}

interface UseSSEConnectionReturn {
  isConnected: boolean
  isConnecting: boolean
  reconnectAttempts: number
  error: string | null
  userInitialized: boolean
  initializingUser: boolean
  initializationError: string | null
  initializationAttempts: number
  connect: () => void
  disconnect: () => void
  retry: () => void
  retryInitialization: () => void
}

// SSE endpoint - environment-aware configuration
const getSSEEndpoint = (): string => {
  const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL
  const streamPath =
    import.meta.env.VITE_EVENTS_STREAM_PATH ?? '/api/v1/claude-code/hooks/events/stream'

  return baseUrl ? `${baseUrl}${streamPath}` : streamPath
}

const SSE_ENDPOINT = getSSEEndpoint()
const MAX_RECONNECT_ATTEMPTS = 10
const MAX_INITIALIZATION_ATTEMPTS = 5
const INITIAL_RECONNECT_DELAY = 1000
const RECONNECT_BACKOFF_MULTIPLIER = 1.5
const MAX_RECONNECT_DELAY = 30000
const INITIALIZATION_RETRY_DELAY = 2000

const calculateReconnectDelay = (attempts: number): number => {
  return Math.min(
    INITIAL_RECONNECT_DELAY * Math.pow(RECONNECT_BACKOFF_MULTIPLIER, attempts),
    MAX_RECONNECT_DELAY,
  )
}

const handleClaudeHookEvent = (data: string) => {
  try {
    const hookEvent = JSON.parse(data)
    window.dispatchEvent(new CustomEvent('claude-hook-received', { detail: hookEvent }))
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('🔔 SSE: Error parsing Claude hook event:', error)
  }
}

const parseSSEChunk = (chunk: string): { event?: string; data?: string } | null => {
  const lines = chunk.split('\n')
  const result: { event?: string; data?: string } = {}
  
  for (const line of lines) {
    if (line.startsWith('event:')) {
      result.event = line.substring(6).trim()
    } else if (line.startsWith('data:')) {
      result.data = line.substring(5).trim()
    }
  }
  
  return result.data ? result : null
}

export const useSSEConnection = (options: UseSSEConnectionOptions): UseSSEConnectionReturn => {
  const [state, setState] = useState<SSEConnectionState>({
    isConnected: false,
    isConnecting: false,
    reconnectAttempts: 0,
    error: null,
    userInitialized: false,
    initializingUser: false,
    initializationError: null,
    initializationAttempts: 0,
  })

  const abortControllerRef = useRef<AbortController | null>(null)
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
  }, [])

  const closeConnection = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    if (readerRef.current) {
      readerRef.current.cancel().catch(() => {
        // Ignore cancellation errors
      })
      readerRef.current = null
    }
  }, [])

  const handleAuthenticationError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      error: 'Authentication failed',
    }))
  }, [])

  const handleConnectionSuccess = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isConnected: true,
      isConnecting: false,
      reconnectAttempts: 0,
      error: null,
    }))
  }, [])

  const processSSEMessages = useCallback((buffer: string): string => {
    const messages = buffer.split('\n\n')
    const remainingBuffer = messages.pop() ?? ''
    
    for (const message of messages) {
      if (message.trim()) {
        const sseData = parseSSEChunk(message)
        if (sseData?.data && sseData.event === 'claude-hook') {
          handleClaudeHookEvent(sseData.data)
        }
      }
    }
    
    return remainingBuffer
  }, [])

  const createConnectionRef = useRef<() => Promise<void>>(async () => {})

  const initializeUser = useCallback(async () => {
    if (!options.accessToken) {
      setState((prev) => ({
        ...prev,
        initializationError: 'No access token available',
        initializingUser: false,
      }))
      return
    }

    setState((prev) => {
      // Check if we've exceeded max attempts
      if (prev.initializationAttempts >= MAX_INITIALIZATION_ATTEMPTS) {
        return {
          ...prev,
          initializationError: `User initialization failed after ${MAX_INITIALIZATION_ATTEMPTS} attempts`,
          initializingUser: false,
        }
      }

      return {
        ...prev,
        initializingUser: true,
        initializationError: null,
        initializationAttempts: prev.initializationAttempts + 1,
      }
    })

    try {
      const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL ?? 'http://localhost:8085'
      const initializePath = import.meta.env.VITE_USER_INITIALIZE_PATH ?? '/api/v1/claude-code/user/initialize'
      const response = await fetch(`${baseUrl}${initializePath}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${options.accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.status === 204) {
        setState((prev) => ({
          ...prev,
          userInitialized: true,
          initializingUser: false,
          initializationError: null,
          initializationAttempts: 0, // Reset on success
        }))
      } else {
        throw new Error(`User initialization failed with status ${response.status}`)
      }
    } catch (error) {
      setState((prev) => {
        const errorMessage = error instanceof Error ? error.message : 'User initialization failed'
        
        // If we haven't reached max attempts, schedule a retry
        if (prev.initializationAttempts < MAX_INITIALIZATION_ATTEMPTS) {
          setTimeout(() => {
            initializeUser().catch(() => {
              // Error handling is managed within this function
            })
          }, INITIALIZATION_RETRY_DELAY)
        }

        return {
          ...prev,
          initializingUser: false,
          initializationError: prev.initializationAttempts >= MAX_INITIALIZATION_ATTEMPTS 
            ? `${errorMessage}. Max attempts (${MAX_INITIALIZATION_ATTEMPTS}) reached.`
            : errorMessage,
        }
      })
    }
  }, [options.accessToken])

  const handleConnectionError = useCallback((error: unknown) => {
    closeConnection()

    // Don't retry if aborted (intentional disconnect)
    if (error instanceof Error && error.name === 'AbortError') {
      return
    }

    setState((prev) => {
      const newAttempts = prev.reconnectAttempts + 1

      if (newAttempts >= MAX_RECONNECT_ATTEMPTS) {
        return {
          ...prev,
          isConnected: false,
          isConnecting: false,
          error: 'Max reconnection attempts reached',
          reconnectAttempts: newAttempts,
        }
      }

      // Schedule reconnection
      const delay = calculateReconnectDelay(prev.reconnectAttempts)
      reconnectTimeoutRef.current = setTimeout(() => {
        if (createConnectionRef.current) {
          createConnectionRef.current()
        }
      }, delay)

      return {
        ...prev,
        isConnected: false,
        isConnecting: true,
        error: error instanceof Error ? error.message : 'Connection failed',
        reconnectAttempts: newAttempts,
      }
    })
  }, [closeConnection])

  const readStreamData = useCallback(async (reader: ReadableStreamDefaultReader<Uint8Array>, abortController: AbortController) => {
    const decoder = new TextDecoder()
    let buffer = ''

    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        buffer = processSSEMessages(buffer)
      }
    } catch (readError) {
      if (!abortController.signal.aborted) {
        throw readError
      }
    }
  }, [processSSEMessages])

  const createConnection = useCallback(async () => {
    // Don't create a connection if not authenticated
    if (!options.isAuthenticated || !options.accessToken) {
      setState((prev) => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        error: 'Authentication required',
      }))
      return
    }

    // Don't create a connection if user is not initialized
    if (!state.userInitialized) {
      setState((prev) => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        error: 'User initialization required',
      }))
      return
    }

    // Prevent creating a connection if one already exists
    if (abortControllerRef.current || readerRef.current) {
      return
    }

    try {
      const abortController = new AbortController()
      abortControllerRef.current = abortController

      const response = await fetch(SSE_ENDPOINT, {
        headers: {
          'Authorization': `Bearer ${options.accessToken}`,
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        signal: abortController.signal,
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          handleAuthenticationError()
          return
        }
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
        handleConnectionError(error)
        return
      }

      if (!response.body) {
        const error = new Error('No response body')
        handleConnectionError(error)
        return
      }

      const reader = response.body.getReader()
      readerRef.current = reader
      
      handleConnectionSuccess()
      await readStreamData(reader, abortController)
    } catch (error) {
      handleConnectionError(error)
    }
  }, [options.isAuthenticated, options.accessToken, state.userInitialized, handleAuthenticationError, handleConnectionSuccess, handleConnectionError, readStreamData])

  // Update the ref whenever createConnection changes
  createConnectionRef.current = createConnection

  const connect = useCallback(() => {
    setState((prev) => {
      if (prev.isConnecting || prev.isConnected) {
        return prev
      }

      // Prevent duplicate connections
      if (abortControllerRef.current || readerRef.current) {
        return prev
      }

      // Close any existing connection
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
      closeConnection()

      // Start new connection
      createConnection().catch(() => {
        // Connection error will be handled by createConnection
      })

      return {
        ...prev,
        isConnecting: true,
        error: null,
      }
    })
  }, [createConnection, closeConnection])

  const disconnect = useCallback(() => {
    clearReconnectTimeout()
    closeConnection()
    setState((prev) => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      reconnectAttempts: 0,
      error: null,
    }))
  }, [clearReconnectTimeout, closeConnection])

  const retry = useCallback(() => {
    setState((prev) => ({
      ...prev,
      reconnectAttempts: 0,
      error: null,
    }))
    connect()
  }, [connect])

  const retryInitialization = useCallback(() => {
    setState((prev) => ({
      ...prev,
      initializationError: null,
      initializationAttempts: 0, // Reset attempts for manual retry
    }))
    initializeUser()
  }, [initializeUser])

  // Initialize user when authenticated
  useEffect(() => {
    if (options.isAuthenticated && options.accessToken && !state.userInitialized && !state.initializingUser && state.initializationAttempts === 0) {
      initializeUser().catch(() => {
        // Error handling is managed within initializeUser function
      })
    }
  }, [options.isAuthenticated, options.accessToken, state.userInitialized, state.initializingUser, state.initializationAttempts, initializeUser])

  // Initialize connection when user is initialized
  useEffect(() => {
    // Only connect when authenticated, have access token, and user is initialized
    if (options.isAuthenticated && options.accessToken && state.userInitialized) {
      // Prevent duplicate connections during React StrictMode double-mounting
      if (abortControllerRef.current || readerRef.current) {
        return
      }
      connect()
    } else {
      // Disconnect if authentication state changes
      disconnect()
    }

    // Cleanup on the component unmount or auth change
    return () => {
      clearReconnectTimeout()
      closeConnection()
    }
  }, [options.isAuthenticated, options.accessToken, state.userInitialized, connect, disconnect, clearReconnectTimeout, closeConnection])

  return {
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    reconnectAttempts: state.reconnectAttempts,
    error: state.error,
    userInitialized: state.userInitialized,
    initializingUser: state.initializingUser,
    initializationError: state.initializationError,
    initializationAttempts: state.initializationAttempts,
    connect,
    disconnect,
    retry,
    retryInitialization,
  }
}