import {useCallback, useEffect, useRef, useState} from 'react'
import type {SSEDisconnectError} from '@/types'
import {createSSEDisconnectError} from '@/types'
import {getSSEDisconnectEndpoint} from '@/utils'

interface SSEDisconnectState {
    readonly isDisconnecting: boolean
    readonly disconnectAttempts: number
    readonly error: SSEDisconnectError | null
    readonly lastDisconnectedConnectionId: string | null
}

interface UseSSEDisconnectOptions {
    accessToken?: string | undefined
}

interface DisconnectResult {
    readonly success: boolean
    readonly connectionId: string
    readonly status?: number
    readonly alreadyDisconnected?: boolean
}

interface UseSSEDisconnectReturn {
    readonly isDisconnecting: boolean
    readonly disconnectAttempts: number
    readonly error: SSEDisconnectError | null
    readonly lastDisconnectedConnectionId: string | null
    readonly disconnect: (connectionId: string) => Promise<DisconnectResult>
    readonly disconnectWithRetry: (connectionId: string, maxRetries?: number) => Promise<DisconnectResult>
    readonly clearError: () => void
}

const MAX_DISCONNECT_ATTEMPTS = 3
const DISCONNECT_RETRY_DELAY = 1000

/**
 * Hook for managing SSE connection disconnection
 *
 * Handles the DELETE request to disconnect specific SSE connections from the backend.
 * Provides proper error handling, retry logic, and type-safe disconnection management
 * following SRP principles - exclusively responsible for disconnection operations.
 *
 * @param options - Configuration options for disconnection
 * @param options.accessToken - JWT access token for API authentication
 *
 * @returns Disconnection state and control functions
 * @returns isDisconnecting - Whether disconnection is currently in progress
 * @returns disconnectAttempts - Number of disconnect attempts made for current operation
 * @returns error - Structured error information if disconnection failed
 * @returns lastDisconnectedConnectionId - ID of the last successfully disconnected connection
 * @returns disconnect - Function to disconnect a specific connection ID
 * @returns disconnectWithRetry - Function to disconnect with automatic retry logic
 * @returns clearError - Function to clear current error state
 *
 * @example
 * ```typescript
 * const { disconnect, isDisconnecting, error } = useSSEDisconnect({
 *   accessToken: 'jwt-token-here'
 * })
 *
 * const handleDisconnect = async () => {
 *   try {
 *     const result = await disconnect(connectionId)
 *     if (result.success) {
 *       // Handle successful disconnection
 *     }
 *   } catch (error) {
 *     // Handle disconnection error
 *   }
 * }
 * ```
 */
export const useSSEDisconnect = (options: UseSSEDisconnectOptions): UseSSEDisconnectReturn => {
    const [state, setState] = useState<SSEDisconnectState>({
        isDisconnecting: false,
        disconnectAttempts: 0,
        error: null,
        lastDisconnectedConnectionId: null,
    })

    // Ref to avoid circular dependencies in retry logic
    const disconnectRef = useRef<((connectionId: string) => Promise<DisconnectResult>) | null>(null)
    // Ref to track active retry timeouts for cleanup
    const activeTimeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set())

    /**
     * Schedule a retry attempt after a delay
     * @param connectionId - Connection ID to retry disconnect
     * @param currentAttempt - Current attempt number for delay calculation
     */
    const scheduleRetryAttempt = useCallback((connectionId: string, currentAttempt: number): void => {
        const delay = DISCONNECT_RETRY_DELAY * currentAttempt
        const timeoutId = setTimeout(() => {
            // Remove from active timeouts set
            activeTimeoutsRef.current.delete(timeoutId)

            // Check if we're still in a state where retry is appropriate
            if (disconnectRef.current && !state.isDisconnecting) {
                disconnectRef.current(connectionId).catch(() => {
                    // Error handling is managed within the disconnect function
                })
            }
        }, delay)

        // Track timeout for cleanup
        activeTimeoutsRef.current.add(timeoutId)
    }, [state.isDisconnecting])

    /**
     * Handle disconnection errors with retry logic
     * @param error - The disconnection error to handle
     * @param connectionId - Connection ID that failed to disconnect
     */
    const handleDisconnectionError = useCallback((error: SSEDisconnectError, connectionId: string): void => {
        setState((prev) => {
            const newAttempts = prev.disconnectAttempts + 1

            // If we haven't reached max attempts, and it's a retryable error, schedule a retry
            if (newAttempts < MAX_DISCONNECT_ATTEMPTS && isRetryableError(error)) {
                scheduleRetryAttempt(connectionId, newAttempts)

                return {
                    ...prev,
                    disconnectAttempts: newAttempts,
                    error,
                }
            }

            // Max attempts reached or non-retryable error
            const finalError = newAttempts >= MAX_DISCONNECT_ATTEMPTS
                ? createSSEDisconnectError.maxDisconnectAttempts(newAttempts, connectionId)
                : error

            return {
                ...prev,
                isDisconnecting: false,
                disconnectAttempts: newAttempts,
                error: finalError,
            }
        })
    }, [scheduleRetryAttempt])

    /**
     * Determine if an error is retryable
     * @param error - SSE disconnect error to check
     * @returns True if the error should trigger a retry
     */
    const isRetryableError = (error: SSEDisconnectError): boolean => {
        return error.type === 'NETWORK_ERROR' ||
            (error.type === 'HTTP_ERROR' && error.status >= 500)
    }

    /**
     * Internal function to perform the actual disconnect API call
     * @param connectionId - Connection ID to disconnect
     * @returns Promise resolving to disconnect a result
     */
    const performDisconnect = useCallback(async (connectionId: string): Promise<DisconnectResult> => {
        // Validate required parameters - these are not retryable errors
        if (!connectionId) {
            const error = createSSEDisconnectError.noConnectionId()
            setState((prev) => ({
                ...prev,
                isDisconnecting: false,
                error,
            }))
            throw error
        }

        if (!options.accessToken) {
            const error = createSSEDisconnectError.noAccessToken()
            setState((prev) => ({
                ...prev,
                isDisconnecting: false,
                error,
            }))
            throw error
        }

        // Update state to indicate disconnection in progress
        setState((prev) => ({
            ...prev,
            isDisconnecting: true,
            error: null,
            disconnectAttempts: prev.disconnectAttempts + 1,
        }))

        try {
            const disconnectUrl = getSSEDisconnectEndpoint(connectionId)

            const response = await fetch(disconnectUrl, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${options.accessToken}`,
                    'Content-Type': 'application/json',
                },
            })

            // Handle different response statuses based on backend contract
            if (response.status === 204) {
                // Success - connection disconnected
                setState((prev) => ({
                    ...prev,
                    isDisconnecting: false,
                    disconnectAttempts: 0, // Reset on success
                    error: null,
                    lastDisconnectedConnectionId: connectionId,
                }))


                return {
                    success: true,
                    connectionId,
                    status: 204,
                }
            } else if (response.status === 404) {
                // Connection isn't found - treat as success since it's already disconnected
                setState((prev) => ({
                    ...prev,
                    isDisconnecting: false,
                    disconnectAttempts: 0, // Reset on success
                    error: null,
                    lastDisconnectedConnectionId: connectionId,
                }))


                return {
                    success: true,
                    connectionId,
                    status: 404,
                    alreadyDisconnected: true,
                }
            } else if (response.status === 403) {
                // Forbidden - cannot disconnect connection that doesn't belong to user
                const error = createSSEDisconnectError.forbiddenDisconnect(connectionId)
                handleDisconnectionError(error, connectionId)
                throw error
            } else if (response.status === 401) {
                // Authentication expired
                const error = createSSEDisconnectError.authenticationExpired(connectionId)
                handleDisconnectionError(error, connectionId)
                throw error
            } else {
                // Other HTTP error
                const error = createSSEDisconnectError.httpError(response.status, connectionId)
                handleDisconnectionError(error, connectionId)
                throw error
            }
        } catch (error) {
            let disconnectError: SSEDisconnectError

            if (error instanceof Error) {
                // Network or fetch error
                disconnectError = createSSEDisconnectError.networkError(
                    `Disconnect network error: ${error.message}`,
                    connectionId,
                    error.cause as string
                )
            } else if (typeof error === 'object' && error !== null && 'type' in error) {
                // If it's already an SSEDisconnectError
                disconnectError = error as SSEDisconnectError
            } else {
                // Unknown error
                disconnectError = createSSEDisconnectError.networkError(
                    'Unknown disconnect error',
                    connectionId
                )
            }

            handleDisconnectionError(disconnectError, connectionId)
            throw disconnectError
        }
    }, [options.accessToken, handleDisconnectionError])

    // Update the ref whenever performDisconnect changes
    disconnectRef.current = performDisconnect

    /**
     * Disconnect a specific connection by ID
     * Single attempt with immediate error reporting
     * @param connectionId - Connection ID to disconnect
     * @returns Promise resolving to disconnect a result
     */
    const disconnect = useCallback(async (connectionId: string): Promise<DisconnectResult> => {
        // Prevent duplicate calls while already disconnecting
        if (state.isDisconnecting) {
            // Already in the middle of a disconnect operation, return early
            throw createSSEDisconnectError.disconnectInProgress(connectionId)
        }

        // Clear any previous error for fresh disconnect operation  
        setState((prev) => ({
            ...prev,
            error: null,
        }))

        return performDisconnect(connectionId)
    }, [performDisconnect, state.isDisconnecting])

    /**
     * Disconnect with automatic retry logic
     * @param connectionId - Connection ID to disconnect
     * @param maxRetries - Maximum number of retry attempts (default: MAX_DISCONNECT_ATTEMPTS)
     * @returns Promise resolving to disconnect a result
     */
    const disconnectWithRetry = useCallback(async (
        connectionId: string,
        maxRetries: number = MAX_DISCONNECT_ATTEMPTS
    ): Promise<DisconnectResult> => {
        let lastError: SSEDisconnectError | null = null

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await disconnect(connectionId)
            } catch (error) {
                lastError = error as SSEDisconnectError

                // If it's not a retryable error, don't continue
                if (!isRetryableError(lastError)) {
                    break
                }

                // Wait before retrying (except on last attempt)
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, DISCONNECT_RETRY_DELAY * attempt))
                }
            }
        }

        // All retries failed
        const finalError = createSSEDisconnectError.maxDisconnectAttempts(maxRetries, connectionId)
        setState((prev) => ({
            ...prev,
            error: finalError,
            isDisconnecting: false,
        }))

        throw finalError
    }, [disconnect])

    /**
     * Clear current error state
     */
    const clearError = useCallback((): void => {
        setState((prev) => ({
            ...prev,
            error: null,
        }))
    }, [])

    // Cleanup timeouts on unmounting
    useEffect(() => {
        // Capture current ref value for cleanup
        const activeTimeouts = activeTimeoutsRef.current

        return () => {
            // Clear all active timeouts to prevent memory leaks
            activeTimeouts.forEach(timeoutId => {
                clearTimeout(timeoutId)
            })
            activeTimeouts.clear()
        }
    }, [])

    return {
        isDisconnecting: state.isDisconnecting,
        disconnectAttempts: state.disconnectAttempts,
        error: state.error,
        lastDisconnectedConnectionId: state.lastDisconnectedConnectionId,
        disconnect,
        disconnectWithRetry,
        clearError,
    }
}