/**
 * API Key Management Types
 * 
 * TypeScript interfaces matching backend API responses exactly.
 * Backend endpoint: /api/v1/claude-code/user/api-key/generate
 */

// Backend response from API key generation
export interface ApiKeyResponse {
  /** The actual API key - shown only once for security */
  readonly apiKey: string;
  
  /** Unique identifier for the key */
  readonly keyId: string;
  
  /** Key prefix for identification (e.g., "chk_qGmHAc...") */
  readonly keyPrefix: string;
  
  /** When the key was created (Unix timestamp in seconds) */
  readonly createdAt: number;
  
  /** When the key was last used (Unix timestamp in seconds, null if never used) */
  readonly lastUsedAt: number | null;
  
  /** Whether the key is currently active */
  readonly isActive: boolean;
  
  /** Human-readable name for the key */
  readonly name: string;
  
  /** Array of permissions (e.g., ["hooks:write"]) */
  readonly permissions: readonly string[];
  
  /** When the key expires (Unix timestamp in seconds, null if no expiration) */
  readonly expiresAt: number | null;
}

// Error response structure for 404 and other API errors
export interface ApiKeyErrorResponse {
  /** HTTP status code */
  readonly statusCode: number;
  
  /** Exception class name */
  readonly exceptionName: string;
  
  /** Human-readable error message */
  readonly message: string;
  
  /** When the error occurred (ISO timestamp) */
  readonly timestamp: string;
}

// Request payload for API key generation
export interface ApiKeyGenerationRequest {
  /** Human-readable name for the key */
  readonly name: string;
  
  /** Array of requested permissions */
  readonly permissions: readonly string[];
  
  /** Optional expiration date (ISO timestamp) */
  readonly expiresAt: string | null;
}

// Error types for API key operations
export type ApiKeyError = 
  | 'user_not_found'
  | 'unauthorized'
  | 'invalid_permissions'
  | 'generation_failed'
  | 'network_error'
  | 'unknown_error';

// Result type for API operations (Result pattern from guidelines)
export type ApiKeyResult<T> = 
  | { success: true; data: T }
  | { success: false; error: ApiKeyError; message: string };


// Utility type for partial API key updates
export type ApiKeyUpdate = Partial<Pick<ApiKeyResponse, 'name' | 'isActive' | 'expiresAt'>>;

// API Key Error class for proper error throwing
export class ApiKeyOperationError extends Error {
  constructor(
    message: string,
    public readonly errorType: ApiKeyError
  ) {
    super(message);
    this.name = 'ApiKeyOperationError';
  }
}


