/**
 * API Key Service Client
 * 
 * HTTP client for API key management operations.
 * Integrates with an existing auth system and follows React Query patterns.
 */

import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type {
  ApiKeyResponse,
  ApiKeyErrorResponse,
  ApiKeyGenerationRequest,
  ApiKeyResult,
  ApiKeyError
} from '@/types/apiKey';
import { ApiKeyOperationError } from '@/types/apiKey';

// API client configuration
class ApiKeyClient {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_BACKEND_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for JWT authentication
    this.client.interceptors.request.use(
      (config) => {
        // Get JWT token from an existing auth system
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error instanceof Error ? error : new Error(String(error)))
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle 404 "User not found" specifically
        if (error.response?.status === 404) {
          return Promise.reject(new ApiKeyOperationError(
            'User not initialized. Please complete user setup first.',
            'user_not_found' as ApiKeyError
          ));
        }

        // Handle other HTTP errors
        if (error.response?.data && this.isApiKeyErrorResponse(error.response.data)) {
          return Promise.reject(new ApiKeyOperationError(
            error.response.data.message,
            this.mapHttpErrorToApiKeyError(error.response.status)
          ));
        }

        // Handle network errors
        if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
          return Promise.reject(new ApiKeyOperationError(
            'Network connection failed. Please check your connection and try again.',
            'network_error' as ApiKeyError
          ));
        }

        return Promise.reject(new ApiKeyOperationError(
          'An unexpected error occurred.',
          'unknown_error' as ApiKeyError
        ));
      }
    );
  }

  /**
   * Generate a new API key
   */
  async generateApiKey(request: ApiKeyGenerationRequest): Promise<ApiKeyResult<ApiKeyResponse>> {
    try {
      const response: AxiosResponse<ApiKeyResponse> = await this.client.post(
        import.meta.env.VITE_API_KEY_GENERATE_PATH ?? '/api/v1/claude-code/user/api-key/generate',
        request
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error: unknown) {
      if (error instanceof ApiKeyOperationError) {
        return {
          success: false,
          error: error.errorType,
          message: error.message
        };
      }
      return {
        success: false,
        error: 'unknown_error',
        message: error instanceof Error ? error.message : 'Failed to generate API key'
      };
    }
  }

  /**
   * List user's API keys (without sensitive api_key field)
   */
  async listApiKeys(): Promise<ApiKeyResult<ApiKeyResponse[]>> {
    try {
      const response: AxiosResponse<ApiKeyResponse[]> = await this.client.get(
        import.meta.env.VITE_API_KEY_LIST_PATH ?? '/api/v1/claude-code/user/api-keys'
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error: unknown) {
      if (error instanceof ApiKeyOperationError) {
        return {
          success: false,
          error: error.errorType,
          message: error.message
        };
      }
      return {
        success: false,
        error: 'unknown_error',
        message: error instanceof Error ? error.message : 'Failed to fetch API keys'
      };
    }
  }

  /**
   * Revoke an API key
   */
  async revokeApiKey(keyId: string): Promise<ApiKeyResult<void>> {
    try {
      const basePath = import.meta.env.VITE_API_KEY_MANAGE_PATH ?? '/api/v1/claude-code/user/api-key';
      await this.client.delete(`${basePath}/${keyId}`);

      return {
        success: true,
        data: undefined
      };
    } catch (error: unknown) {
      if (error instanceof ApiKeyOperationError) {
        return {
          success: false,
          error: error.errorType,
          message: error.message
        };
      }
      return {
        success: false,
        error: 'unknown_error',
        message: error instanceof Error ? error.message : 'Failed to revoke API key'
      };
    }
  }

  /**
   * Update API key metadata (name, status, etc.)
   */
  async updateApiKey(
    keyId: string, 
    updates: Partial<Pick<ApiKeyResponse, 'name' | 'isActive'>>
  ): Promise<ApiKeyResult<ApiKeyResponse>> {
    try {
      const basePath = import.meta.env.VITE_API_KEY_MANAGE_PATH ?? '/api/v1/claude-code/user/api-key';
      const response: AxiosResponse<ApiKeyResponse> = await this.client.patch(
        `${basePath}/${keyId}`,
        updates
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error: unknown) {
      if (error instanceof ApiKeyOperationError) {
        return {
          success: false,
          error: error.errorType,
          message: error.message
        };
      }
      return {
        success: false,
        error: 'unknown_error',
        message: error instanceof Error ? error.message : 'Failed to update API key'
      };
    }
  }

  // Private helper methods

  /**
   * Get JWT token from existing auth system
   * Integration with the Keycloak OIDC auth system
   */
  private getAuthToken(): string | null {
    // Access token from browser storage (set by react-oidc-context)
    try {
      const oidcStorage = sessionStorage.getItem(`oidc.user:${import.meta.env.VITE_KEYCLOAK_BASE_URL}/realms/${import.meta.env.VITE_KEYCLOAK_REALM}:${import.meta.env.VITE_KEYCLOAK_CLIENT_ID}`);
      if (oidcStorage) {
        const userData = JSON.parse(oidcStorage);
        return userData.access_token ?? null;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Type guard for API key error responses
   */
  private isApiKeyErrorResponse(value: unknown): value is ApiKeyErrorResponse {
    return (
      typeof value === 'object' &&
      value !== null &&
      'statusCode' in value &&
      'exceptionName' in value &&
      'message' in value &&
      'timestamp' in value
    );
  }

  /**
   * Map HTTP status codes to API key error types
   */
  private mapHttpErrorToApiKeyError(statusCode: number): ApiKeyError {
    switch (statusCode) {
      case 401:
        return 'unauthorized';
      case 403:
        return 'invalid_permissions';
      case 404:
        return 'user_not_found';
      case 422:
        return 'generation_failed';
      default:
        return 'unknown_error';
    }
  }
}

// Export singleton instance
export const apiKeyClient = new ApiKeyClient();