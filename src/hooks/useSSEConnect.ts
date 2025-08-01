import { useState, useEffect, useCallback, useRef } from 'react'
import type { ClaudeHookEvent, SSEConnectionError } from '@/types'
import { createSSEConnectionError } from '@/types'
import { getSSEEndpoint, env } from '@/utils'

interface SSEConnectionState {
  readonly isConnected: boolean
  readonly isConnecting: boolean
  readonly reconnectAttempts: number
  readonly error: SSEConnectionError | null
  readonly connectionId: string | null
}

interface UseSSEConnectOptions {
  isAuthenticated: boolean
  userInitialized: boolean
  accessToken?: string | undefined
}

interface UseSSEConnectReturn {
  readonly isConnected: boolean
  readonly isConnecting: boolean
  readonly reconnectAttempts: number
  readonly error: SSEConnectionError | null
  readonly connectionId: string | null
  readonly connect: () => void
  readonly disconnect: () => void
  readonly retry: () => void
}

const SSE_ENDPOINT = getSSEEndpoint()
const MAX_RECONNECT_ATTEMPTS = 10
const INITIAL_RECONNECT_DELAY = 1000
const RECONNECT_BACKOFF_MULTIPLIER = 1.5
const MAX_RECONNECT_DELAY = 30000

/**
 * Calculate exponential backoff delay for reconnection attempts
 * @param attempts - Current number of attempts
 * @returns Delay in milliseconds, capped at MAX_RECONNECT_DELAY
 */
const calculateReconnectDelay = (attempts: number): number => {
  return Math.min(
    INITIAL_RECONNECT_DELAY * Math.pow(RECONNECT_BACKOFF_MULTIPLIER, attempts),
    MAX_RECONNECT_DELAY,
  )
}

/**
 * Type guard to validate Claude hook event structure
 * @param obj - Unknown object to validate
 * @returns True if an object is a valid ClaudeHookEvent
 */
const isClaudeHookEvent = (obj: unknown): obj is ClaudeHookEvent => {
  if (typeof obj !== 'object' || obj === null) {
    return false
  }
  
  const candidate = obj as Record<string, unknown>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.reason === 'string' &&
    typeof candidate.timestamp === 'string'
  )
}

/**
 * Type guard to validate SSE connection error structure
 * @param obj - Unknown object to validate  
 * @returns True if an object is a valid SSEConnectionError
 */
const isSSEConnectionError = (obj: unknown): obj is SSEConnectionError => {
  if (typeof obj !== 'object' || obj === null || !('type' in obj)) {
    return false
  }
  
  const candidate = obj as { type: unknown }
  const validTypes = [
    'AUTHENTICATION_REQUIRED',
    'USER_INITIALIZATION_REQUIRED', 
    'AUTHENTICATION_FAILED',
    'CONNECTION_FAILED',
    'MAX_RECONNECT_ATTEMPTS',
    'NO_RESPONSE_BODY'
  ]
  
  return typeof candidate.type === 'string' && validTypes.includes(candidate.type)
}

/**
 * Handle incoming Claude hook event from SSE stream
 * Parses JSON data and dispatches custom event to window
 * @param data - Raw JSON string from SSE stream
 */
const handleClaudeHookEvent = (data: string): void => {
  try {
    const hookEvent: unknown = JSON.parse(data)
    
    if (isClaudeHookEvent(hookEvent)) {
      window.dispatchEvent(new CustomEvent('claude-hook-received', { detail: hookEvent }))
    } else {
      // eslint-disable-next-line no-console
      console.error('SSE: Invalid hook event structure received')
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('SSE: Error parsing hook event:', error instanceof Error ? error.message : 'Unknown error')
  }
}

/**
 * Connection confirmation structure from backend (using snake_case as sent by Kotlin backend)
 */
interface BackendConnectionConfirmation {
  readonly connection_id: string
  readonly message: string
}

/**
 * Type guard to validate connection confirmation structure
 * @param obj - Unknown object to validate
 * @returns True if an object is a valid BackendConnectionConfirmation
 */
const isConnectionConfirmation = (obj: unknown): obj is BackendConnectionConfirmation => {
  if (typeof obj !== 'object' || obj === null) {
    return false
  }
  
  const candidate = obj as Record<string, unknown>
  return (
    typeof candidate.connection_id === 'string' &&
    typeof candidate.message === 'string'
  )
}

/**
 * Handle incoming connection confirmation event from SSE stream
 * Parses JSON data and extracts connection ID for tracking
 * @param data - Raw JSON string from SSE stream  
 * @param onConnectionId - Callback to handle extracted connection ID
 */
const handleConnectionEvent = (data: string, onConnectionId: (connectionId: string, message?: string) => void): void => {
  try {
    const connectionData: unknown = JSON.parse(data)
    
    if (isConnectionConfirmation(connectionData)) {
      onConnectionId(connectionData.connection_id, connectionData.message)
    } else {
      // eslint-disable-next-line no-console
      console.error('SSE: Invalid connection confirmation received')
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('SSE: Error parsing connection event:', error instanceof Error ? error.message : 'Unknown error')
  }
}

/**
 * SSE chunk parsing result
 */
interface SSEChunk {
  readonly event?: string
  readonly data?: string
}

/**
 * Parse Server-Sent Events chunk into structured data
 * @param chunk - Raw SSE chunk string
 * @returns Parsed SSE data or null if no data field present
 */
const parseSSEChunk = (chunk: string): SSEChunk | null => {
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

/**
 * Hook for managing Server-Sent Events (SSE) connection to Claude Code Hooks backend
 * 
 * Establishes and maintains a persistent SSE connection for real-time Claude Code Hook events.
 * Handles connection lifecycle, automatic reconnection with exponential backoff, and proper
 * error handling using discriminated union types for type-safe error management.
 * 
 * @param options - Configuration options for SSE connection
 * @param options.isAuthenticated - Whether the user is currently authenticated
 * @param options.userInitialized - Whether user has been initialized in backend
 * @param options.accessToken - JWT access token for API authentication
 * 
 * @returns SSE connection state and control functions
 * @returns isConnected - Whether SSE connection is currently active
 * @returns isConnecting - Whether connection attempt is in progress
 * @returns reconnectAttempts - Number of reconnection attempts made
 * @returns error - Structured error information if connection failed
 * @returns connect - Function to manually initiate connection
 * @returns disconnect - Function to manually close connection
 * @returns retry - Function to reset and retry connection
 * 
 * @example
 * ```TypeScript
 * const { isConnected, isConnecting, error, retry } = useSSEConnect({
 *   isAuthenticated: true,
 *   userInitialized: true,
 *   accessToken: 'jwt-token-here'
 * })
 * 
 * if (error?.type === 'MAX_RECONNECT_ATTEMPTS') {
 *   return <button onClick={retry}>Retry Connection</button>
 * }
 * 
 * return (
 *   <div>
 *     Status: {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
 *   </div>
 * )
 * ```
 */
export const useSSEConnect = (options: UseSSEConnectOptions): UseSSEConnectReturn => {
  const [state, setState] = useState<SSEConnectionState>({
    isConnected: false,
    isConnecting: false,
    reconnectAttempts: 0,
    error: null,
    connectionId: null,
  })

  const abortControllerRef = useRef<AbortController | null>(null)
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Store connection info for disconnect before it gets cleared during logout
  const lastConnectionIdRef = useRef<string | null>(null)
  const lastAccessTokenRef = useRef<string | null>(null)

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
    
    // Clear stored connection refs for proper cleanup
    lastConnectionIdRef.current = null
    lastAccessTokenRef.current = null
  }, [])

  /**
   * Handle authentication errors during SSE connection
   */
  const handleAuthenticationError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      error: createSSEConnectionError.authenticationFailed(),
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

  const handleConnectionIdReceived = useCallback((connectionId: string, message?: string) => {
    setState((prev) => ({
      ...prev,
      connectionId,
    }))
    
    // Store connection ID in ref for disconnect during logout
    lastConnectionIdRef.current = connectionId
    
    
    // Dispatch global event so other components can access connection ID
    window.dispatchEvent(new CustomEvent('sse-connection-id-received', { 
      detail: { connectionId, message } 
    }))
  }, [])

  const processSSEMessages = useCallback((buffer: string): string => {
    const messages = buffer.split('\n\n')
    const remainingBuffer = messages.pop() ?? ''
    
    for (const message of messages) {
      if (message.trim()) {
        const sseData = parseSSEChunk(message)
        if (sseData?.data) {
          if (sseData.event === 'claude-hook') {
            handleClaudeHookEvent(sseData.data)
          } else if (sseData.event === 'connected') {
            handleConnectionEvent(sseData.data, handleConnectionIdReceived)
          }
        }
      }
    }
    
    return remainingBuffer
  }, [handleConnectionIdReceived])

  const createConnectionRef = useRef<() => Promise<void>>(async () => {})


  /**
   * Schedule a reconnection attempt after delay
   * @param attemptNumber - Current attempt number for delay calculation
   */
  const scheduleReconnection = useCallback((attemptNumber: number) => {
    const delay = calculateReconnectDelay(attemptNumber)
    reconnectTimeoutRef.current = setTimeout(() => {
      // Set isConnecting to true when retry actually starts
      setState((prev) => ({
        ...prev,
        isConnecting: true,
      }))
      
      if (createConnectionRef.current) {
        createConnectionRef.current()
      }
    }, delay)
  }, [])

  /**
   * Process connection error and determine appropriate error object
   * @param error - Raw error from connection attempt
   * @returns Processed SSE connection error
   */
  const processConnectionError = useCallback((error: unknown): SSEConnectionError => {
    if (isSSEConnectionError(error)) {
      return error
    }
    if (error instanceof Error) {
      return createSSEConnectionError.connectionFailed(error.message, error.cause as string)
    }
    return createSSEConnectionError.connectionFailed('Connection failed')
  }, [])

  /**
   * Handle connection errors with automatic retry logic
   * @param error - Connection error (Error or SSEConnectionError)
   */
  const handleConnectionError = useCallback((error: unknown) => {
    closeConnection()

    // Don't retry if aborted (intentional disconnect)
    if (error instanceof Error && error.name === 'AbortError') {
      return
    }

    setState((prev) => {
      const newAttempts = prev.reconnectAttempts + 1
      const connectionError = processConnectionError(error)

      // Check if we've reached max attempts
      if (newAttempts >= MAX_RECONNECT_ATTEMPTS) {
        return {
          ...prev,
          isConnected: false,
          isConnecting: false,
          error: createSSEConnectionError.maxReconnectAttempts(newAttempts),
          reconnectAttempts: newAttempts,
        }
      }

      // Schedule reconnection for next attempt
      scheduleReconnection(prev.reconnectAttempts)

      return {
        ...prev,
        isConnected: false,
        isConnecting: false, // Set to false immediately, will be set to true when retry actually starts
        error: connectionError,
        reconnectAttempts: newAttempts,
      }
    })
  }, [closeConnection, processConnectionError, scheduleReconnection])

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

  /**
   * Validate connection prerequisites
   * @returns Validation error or null if valid
   */
  const validateConnectionPrerequisites = useCallback((): SSEConnectionError | null => {
    if (!options.isAuthenticated || !options.accessToken) {
      return createSSEConnectionError.authenticationRequired()
    }
    if (!options.userInitialized) {
      return createSSEConnectionError.userInitializationRequired()
    }
    return null
  }, [options.isAuthenticated, options.accessToken, options.userInitialized])

  /**
   * Handle fetch response validation
   * @param response - Fetch response object
   * @returns True if response is valid, false if error was handled
   */
  const validateFetchResponse = useCallback((response: Response): boolean => {
    if (response.ok) return true

    if (response.status === 401 || response.status === 403) {
      handleAuthenticationError()
      return false
    }

    const connectionError = createSSEConnectionError.connectionFailed(
      `HTTP ${response.status}: ${response.statusText}`
    )
    handleConnectionError(connectionError)
    return false
  }, [handleAuthenticationError, handleConnectionError])

  const createConnection = useCallback(async () => {
    // Validate prerequisites
    const validationError = validateConnectionPrerequisites()
    if (validationError) {
      setState((prev) => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        error: validationError,
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

      // Validate response
      if (!validateFetchResponse(response)) {
        return
      }

      if (!response.body) {
        const connectionError = createSSEConnectionError.noResponseBody()
        handleConnectionError(connectionError)
        return
      }

      const reader = response.body.getReader()
      readerRef.current = reader
      
      handleConnectionSuccess()
      await readStreamData(reader, abortController)
    } catch (error) {
      handleConnectionError(error)
    }
  }, [validateConnectionPrerequisites, validateFetchResponse, options.accessToken, handleConnectionSuccess, handleConnectionError, readStreamData])

  // Update the ref whenever createConnection changes
  createConnectionRef.current = createConnection

  const connect = useCallback(() => {
    setState((prev) => {
      // Consolidated connection guard - check state and refs together
      if (prev.isConnecting || prev.isConnected || abortControllerRef.current || readerRef.current) {
        return prev
      }

      // Close any existing connection and clear timeouts
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
      connectionId: null,
    }))
    
    // Clear stored refs
    lastConnectionIdRef.current = null
    lastAccessTokenRef.current = null
    
    // Dispatch global event for disconnection
    window.dispatchEvent(new CustomEvent('sse-disconnected'))
  }, [clearReconnectTimeout, closeConnection])

  const retry = useCallback(() => {
    setState((prev) => ({
      ...prev,
      reconnectAttempts: 0,
      error: null,
    }))
    connect()
  }, [connect])

  // Initialize connection when a user is initialized
  useEffect(() => {
    // Only connect when authenticated, have access token, and the user is initialized
    if (options.isAuthenticated && options.accessToken && options.userInitialized) {
      // Prevent duplicate connections during React StrictMode double-mounting
      if (abortControllerRef.current || readerRef.current || state.isConnected || state.isConnecting) {
        return
      }
      connect()
    } else {
      // Handle disconnection when authentication state changes
      // Clear stored values and do local cleanup only
      // Explicit disconnect API call is handled in the logout flow (UserProfile component)
      lastConnectionIdRef.current = null
      lastAccessTokenRef.current = null
      disconnect()
    }

    // Cleanup on the component unmount or auth change
    return () => {
      clearReconnectTimeout()
      closeConnection()
    }
    // Note: connect/disconnect are intentionally omitted from dependencies to prevent infinite re-renders
    // They are stable functions and state.isConnected/isConnecting are checked inline to prevent duplicates
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.isAuthenticated, options.accessToken, options.userInitialized, clearReconnectTimeout, closeConnection])

  // Keep refs updated with current values for logout disconnect
  useEffect(() => {
    if (options.accessToken) {
      lastAccessTokenRef.current = options.accessToken
    }
  }, [options.accessToken])

  // Cleanup timeout on unmounting to prevent memory leaks
  useEffect(() => {
    // Capture current ref value for cleanup
    const reconnectTimeout = reconnectTimeoutRef.current
    
    return () => {
      // Clear reconnect timeout to prevent memory leaks
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
    }
  }, [])

  /**
   * Attempt graceful disconnect on page unload
   * @param connectionId - Connection ID to disconnect
   * @param accessToken - Access token for authentication
   */
  const attemptPageUnloadDisconnect = useCallback((connectionId: string, accessToken: string): void => {
    const disconnectUrl = `${env.BACKEND_BASE_URL}${env.SSE_DISCONNECT_ENDPOINT}/${connectionId}`
    
    try {
      // Try keepalive fetch first (supports headers)
      fetch(disconnectUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: 'page_unload' }),
        keepalive: true, // Ensures request completes even if page unloads
      }).catch(() => {
        // If fetch fails, try sendBeacon without auth (backend will clean up eventually)
        navigator.sendBeacon(disconnectUrl, JSON.stringify({ reason: 'page_unload_fallback' }))
      })
    } catch (error) {
      // All methods failed, browser will handle connection cleanup eventually
      // eslint-disable-next-line no-console
      console.warn('SSE: Page unload disconnect failed:', error instanceof Error ? error.message : 'Unknown error')
    }
  }, [])

  // Handle page unload for graceful cleanup
  useEffect(() => {
    const handleBeforeUnload = (): void => {
      if (state.connectionId && options.accessToken) {
        attemptPageUnloadDisconnect(state.connectionId, options.accessToken)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [state.connectionId, options.accessToken, attemptPageUnloadDisconnect])

  return {
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    reconnectAttempts: state.reconnectAttempts,
    error: state.error,
    connectionId: state.connectionId,
    connect,
    disconnect,
    retry,
  }
}