import { useCallback, useEffect, useState, useRef } from 'react'
import type { UserInitializationError } from '@/types'
import { createUserInitializationError } from '@/types'
import { getUserInitializeEndpoint } from '@/utils'

interface UserInitializationState {
    readonly userInitialized: boolean
    readonly initializingUser: boolean
    readonly initializationError: UserInitializationError | null
    readonly initializationAttempts: number
}

interface UseUserInitializationOptions {
    isAuthenticated: boolean
    accessToken?: string | undefined
}

interface UseUserInitializationReturn {
    readonly userInitialized: boolean
    readonly initializingUser: boolean
    readonly initializationError: UserInitializationError | null
    readonly initializationAttempts: number
    readonly retryInitialization: () => void
}

const MAX_INITIALIZATION_ATTEMPTS = 5
const INITIALIZATION_RETRY_DELAY = 2000

/**
 * Hook for managing user initialization in the backend system
 * 
 * Handles the POST request to register/initialize an authenticated user in the backend.
 * Provides automatic retry logic with exponential backoff and proper error handling
 * using discriminated union types for type-safe error management.
 * 
 * @param options - Configuration options for user initialization
 * @param options.isAuthenticated - Whether the user is currently authenticated
 * @param options.accessToken - JWT access token for API authentication
 * 
 * @returns User initialization state and control functions
 * @returns userInitialized - Whether user has been successfully initialized
 * @returns initializingUser - Whether initialization is currently in progress
 * @returns initializationError - Structured error information if initialization failed
 * @returns initializationAttempts - Number of initialization attempts made
 * @returns retryInitialization - Function to manually retry initialization
 * 
 * @example
 * ```typescript
 * const { userInitialized, initializingUser, retryInitialization } = useUserInitialization({
 *   isAuthenticated: true,
 *   accessToken: 'jwt-token-here'
 * })
 * 
 * if (initializingUser) {
 *   return <LoadingSpinner />
 * }
 * 
 * if (!userInitialized) {
 *   return <button onClick={retryInitialization}>Retry Initialization</button>
 * }
 * ```
 */
export const useUserInitialization = (options: UseUserInitializationOptions): UseUserInitializationReturn => {
    const [state, setState] = useState<UserInitializationState>({
        userInitialized: false,
        initializingUser: false,
        initializationError: null,
        initializationAttempts: 0,
    })

    // Ref to avoid circular dependencies in retry logic
    const initializeUserRef = useRef<(() => Promise<void>) | null>(null)

    /**
     * Schedule a retry attempt after a delay
     */
    const scheduleRetryAttempt = useCallback((): void => {
        setTimeout(() => {
            // Use a ref to avoid circular dependencies
            if (initializeUserRef.current) {
                initializeUserRef.current().catch(() => {
                    // Error handling is managed within the function
                })
            }
        }, INITIALIZATION_RETRY_DELAY)
    }, [])

    /**
     * Handle initialization errors with retry logic
     * @param error - The initialization error to handle
     */
    const handleInitializationError = useCallback((error: UserInitializationError): void => {
        setState((prev) => {
            // If we haven't reached max attempts, schedule a retry
            if (prev.initializationAttempts < MAX_INITIALIZATION_ATTEMPTS) {
                scheduleRetryAttempt()
            }

            return {
                ...prev,
                initializingUser: false,
                initializationError: prev.initializationAttempts >= MAX_INITIALIZATION_ATTEMPTS
                    ? createUserInitializationError.maxAttemptsReached(prev.initializationAttempts)
                    : error,
            }
        })
    }, [scheduleRetryAttempt])

    /**
     * Internal function to initialize user in backend system
     * Handles API call, retry logic, and error state management
     */
    const initializeUser = useCallback(async (): Promise<void> => {
        if (!options.accessToken) {
            setState((prev) => ({
                ...prev,
                initializationError: createUserInitializationError.noAccessToken(),
                initializingUser: false,
            }))
            return
        }

        setState((prev) => {
            // Check if we've exceeded max attempts
            if (prev.initializationAttempts >= MAX_INITIALIZATION_ATTEMPTS) {
                return {
                    ...prev,
                    initializationError: createUserInitializationError.maxAttemptsReached(MAX_INITIALIZATION_ATTEMPTS),
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
            const response = await fetch(getUserInitializeEndpoint(), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${options.accessToken}`,
                    'Content-Type': 'application/json',
                },
            })

            let initError: UserInitializationError | null = null
            
            if (response.status === 204) {
                setState((prev) => ({
                    ...prev,
                    userInitialized: true,
                    initializingUser: false,
                    initializationError: null,
                    initializationAttempts: 0, // Reset on success
                }))
                return // Success, exit early
            } else {
                initError = createUserInitializationError.httpError(response.status)
            }
            
            // Handle the error case
            if (initError) {
                handleInitializationError(initError)
            }
        } catch (error) {
            let initError: UserInitializationError
            
            if (error instanceof Error) {
                initError = createUserInitializationError.networkError(error.message, error.cause as string)
            } else if (typeof error === 'object' && error !== null && 'type' in error) {
                // If it's already a UserInitializationError
                initError = error as UserInitializationError
            } else {
                initError = createUserInitializationError.networkError('User initialization failed')
            }
            
            handleInitializationError(initError)
        }
    }, [options.accessToken, handleInitializationError])

    // Update the ref whenever initializeUser changes
    initializeUserRef.current = initializeUser

    /**
     * Manually retry user initialization
     * Resets error state and attempt counter before retrying
     */
    const retryInitialization = useCallback((): void => {
        setState((prev) => ({
            ...prev,
            initializationError: null,
            initializationAttempts: 0, // Reset attempts for manual retry
        }))
        initializeUser().catch(() => {
            // Error handling is managed within initializeUser function
        })
    }, [initializeUser])

    // Initialize user when authenticated
    useEffect(() => {
        if (options.isAuthenticated && options.accessToken && !state.userInitialized && !state.initializingUser && state.initializationAttempts === 0) {
            initializeUser().catch(() => {
                // Error handling is managed within initializeUser function
            })
        }
    }, [options.isAuthenticated, options.accessToken, state.userInitialized, state.initializingUser, state.initializationAttempts, initializeUser])

    return {
        userInitialized: state.userInitialized,
        initializingUser: state.initializingUser,
        initializationError: state.initializationError,
        initializationAttempts: state.initializationAttempts,
        retryInitialization,
    }
}