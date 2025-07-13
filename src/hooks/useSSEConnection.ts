import { useState, useEffect, useCallback, useRef } from 'react'

interface SSEConnectionState {
  isConnected: boolean
  isConnecting: boolean
  reconnectAttempts: number
  error: string | null
}

interface UseSSEConnectionReturn {
  isConnected: boolean
  isConnecting: boolean
  reconnectAttempts: number
  error: string | null
  connect: () => void
  disconnect: () => void
  retry: () => void
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
const INITIAL_RECONNECT_DELAY = 1000
const RECONNECT_BACKOFF_MULTIPLIER = 1.5
const MAX_RECONNECT_DELAY = 30000

const calculateReconnectDelay = (attempts: number): number => {
  return Math.min(
    INITIAL_RECONNECT_DELAY * Math.pow(RECONNECT_BACKOFF_MULTIPLIER, attempts),
    MAX_RECONNECT_DELAY,
  )
}

const handleClaudeHookEvent = (event: MessageEvent) => {
  try {
    const hookEvent = JSON.parse(event.data)
    window.dispatchEvent(new CustomEvent('claude-hook-received', { detail: hookEvent }))
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('🔔 SSE: Error parsing Claude hook event:', error)
  }
}

export const useSSEConnection = (): UseSSEConnectionReturn => {
  const [state, setState] = useState<SSEConnectionState>({
    isConnected: false,
    isConnecting: false,
    reconnectAttempts: 0,
    error: null,
  })

  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
  }, [])

  const closeConnection = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
  }, [])

  const createConnection = useCallback(() => {
    // Prevent creating a connection if one already exists
    if (eventSourceRef.current && eventSourceRef.current.readyState !== EventSource.CLOSED) {
      return
    }

    try {
      const eventSource = new EventSource(SSE_ENDPOINT)
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        setState((prev) => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          reconnectAttempts: 0,
          error: null,
        }))
      }

      eventSource.onerror = () => {
        closeConnection()

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
          reconnectTimeoutRef.current = setTimeout(createConnection, delay)

          return {
            ...prev,
            isConnected: false,
            isConnecting: true,
            error: 'Connection error',
            reconnectAttempts: newAttempts,
          }
        })
      }

      eventSource.onmessage = () => {
        // SSE message received - keeping for connection confirmation
      }

      eventSource.addEventListener('claude-hook', handleClaudeHookEvent)
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      }))
    }
  }, [closeConnection])

  const connect = useCallback(() => {
    setState((prev) => {
      if (prev.isConnecting || prev.isConnected) {
        return prev
      }

      // Prevent duplicate connections
      if (eventSourceRef.current && eventSourceRef.current.readyState !== EventSource.CLOSED) {
        return prev
      }

      // Close any existing connection
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }

      // Start new connection
      createConnection()

      return {
        ...prev,
        isConnecting: true,
        error: null,
      }
    })
  }, [createConnection])

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

  // Initialize connection on component mount
  useEffect(() => {
    // Prevent duplicate connections during React StrictMode double-mounting
    if (eventSourceRef.current) {
      return
    }

    connect()

    // Cleanup on component unmount
    return () => {
      clearReconnectTimeout()
      closeConnection()
    }
  }, [connect, clearReconnectTimeout, closeConnection])

  return {
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    reconnectAttempts: state.reconnectAttempts,
    error: state.error,
    connect,
    disconnect,
    retry,
  }
}
