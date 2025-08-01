/**
 * Connection and User Initialization Error Types
 * Discriminated unions for type-safe error handling
 */

/**
 * User initialization error types
 */
export type UserInitializationError =
  | {
      readonly type: 'NO_ACCESS_TOKEN'
      readonly message: 'No access token available'
    }
  | {
      readonly type: 'MAX_ATTEMPTS_REACHED'
      readonly message: string
      readonly attempts: number
    }
  | {
      readonly type: 'HTTP_ERROR'
      readonly message: string
      readonly status: number
    }
  | {
      readonly type: 'NETWORK_ERROR'
      readonly message: string
      readonly cause?: string
    }

/**
 * SSE Connection error types
 */
export type SSEConnectionError =
  | {
      readonly type: 'AUTHENTICATION_REQUIRED'
      readonly message: 'Authentication required'
    }
  | {
      readonly type: 'USER_INITIALIZATION_REQUIRED'
      readonly message: 'User initialization required'
    }
  | {
      readonly type: 'AUTHENTICATION_FAILED'
      readonly message: 'Authentication failed'
      readonly status?: number
    }
  | {
      readonly type: 'CONNECTION_FAILED'
      readonly message: string
      readonly cause?: string
    }
  | {
      readonly type: 'MAX_RECONNECT_ATTEMPTS'
      readonly message: 'Max reconnection attempts reached'
      readonly attempts: number
    }
  | {
      readonly type: 'NO_RESPONSE_BODY'
      readonly message: 'No response body'
    }

/**
 * SSE Disconnect error types
 */
export type SSEDisconnectError =
  | {
      readonly type: 'NO_CONNECTION_ID'
      readonly message: 'No connection ID available for disconnect'
    }
  | {
      readonly type: 'NO_ACCESS_TOKEN'
      readonly message: 'No access token available for disconnect'
    }
  | {
      readonly type: 'DISCONNECT_IN_PROGRESS'
      readonly message: 'Disconnect already in progress'
      readonly connectionId: string
    }
  | {
      readonly type: 'CONNECTION_NOT_FOUND'
      readonly message: 'Connection not found - may already be disconnected'
      readonly connectionId: string
    }
  | {
      readonly type: 'FORBIDDEN_DISCONNECT'
      readonly message: 'Cannot disconnect connection that does not belong to you'
      readonly connectionId: string
    }
  | {
      readonly type: 'AUTHENTICATION_EXPIRED'
      readonly message: 'Authentication expired during disconnect'
      readonly connectionId: string
    }
  | {
      readonly type: 'NETWORK_ERROR'
      readonly message: string
      readonly connectionId?: string
      readonly cause?: string
    }
  | {
      readonly type: 'HTTP_ERROR'
      readonly message: string
      readonly status: number
      readonly connectionId: string
    }
  | {
      readonly type: 'MAX_DISCONNECT_ATTEMPTS'
      readonly message: 'Max disconnect attempts reached'
      readonly attempts: number
      readonly connectionId: string
    }






/**
 * Helper function to create user initialization errors
 */
export const createUserInitializationError = {
  noAccessToken: (): UserInitializationError => ({
    type: 'NO_ACCESS_TOKEN',
    message: 'No access token available',
  }),
  maxAttemptsReached: (attempts: number): UserInitializationError => ({
    type: 'MAX_ATTEMPTS_REACHED',
    message: `User initialization failed after ${attempts} attempts`,
    attempts,
  }),
  httpError: (status: number): UserInitializationError => ({
    type: 'HTTP_ERROR',
    message: `User initialization failed with status ${status}`,
    status,
  }),
  networkError: (message: string, cause?: string): UserInitializationError => ({
    type: 'NETWORK_ERROR',
    message,
    ...(cause && { cause }),
  }),
} as const

/**
 * Helper function to create SSE connection errors
 */
export const createSSEConnectionError = {
  authenticationRequired: (): SSEConnectionError => ({
    type: 'AUTHENTICATION_REQUIRED',
    message: 'Authentication required',
  }),
  userInitializationRequired: (): SSEConnectionError => ({
    type: 'USER_INITIALIZATION_REQUIRED',
    message: 'User initialization required',
  }),
  authenticationFailed: (status?: number): SSEConnectionError => ({
    type: 'AUTHENTICATION_FAILED',
    message: 'Authentication failed',
    ...(status && { status }),
  }),
  connectionFailed: (message: string, cause?: string): SSEConnectionError => ({
    type: 'CONNECTION_FAILED',
    message,
    ...(cause && { cause }),
  }),
  maxReconnectAttempts: (attempts: number): SSEConnectionError => ({
    type: 'MAX_RECONNECT_ATTEMPTS',
    message: 'Max reconnection attempts reached',
    attempts,
  }),
  noResponseBody: (): SSEConnectionError => ({
    type: 'NO_RESPONSE_BODY',
    message: 'No response body',
  }),
} as const

/**
 * Helper function to create SSE disconnect errors
 */
export const createSSEDisconnectError = {
  noConnectionId: (): SSEDisconnectError => ({
    type: 'NO_CONNECTION_ID',
    message: 'No connection ID available for disconnect',
  }),
  noAccessToken: (): SSEDisconnectError => ({
    type: 'NO_ACCESS_TOKEN',
    message: 'No access token available for disconnect',
  }),
  disconnectInProgress: (connectionId: string): SSEDisconnectError => ({
    type: 'DISCONNECT_IN_PROGRESS',
    message: 'Disconnect already in progress',
    connectionId,
  }),
  forbiddenDisconnect: (connectionId: string): SSEDisconnectError => ({
    type: 'FORBIDDEN_DISCONNECT',
    message: 'Cannot disconnect connection that does not belong to you',
    connectionId,
  }),
  authenticationExpired: (connectionId: string): SSEDisconnectError => ({
    type: 'AUTHENTICATION_EXPIRED',
    message: 'Authentication expired during disconnect',
    connectionId,
  }),
  networkError: (message: string, connectionId?: string, cause?: string): SSEDisconnectError => ({
    type: 'NETWORK_ERROR',
    message,
    ...(connectionId && { connectionId }),
    ...(cause && { cause }),
  }),
  httpError: (status: number, connectionId: string): SSEDisconnectError => ({
    type: 'HTTP_ERROR',
    message: `HTTP ${status} error during disconnect`,
    status,
    connectionId,
  }),
  maxDisconnectAttempts: (attempts: number, connectionId: string): SSEDisconnectError => ({
    type: 'MAX_DISCONNECT_ATTEMPTS',
    message: 'Max disconnect attempts reached',
    attempts,
    connectionId,
  }),
} as const

