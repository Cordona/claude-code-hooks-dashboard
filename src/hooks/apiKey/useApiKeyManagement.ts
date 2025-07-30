/**
 * API Key Management Hook
 * 
 * React Query mutations for API key management operations.
 * Handles revocation, updates, and other management tasks.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiKeyClient } from '@/services/apiKey';
import { API_KEY_QUERY_KEYS } from './useApiKeyGeneration';
import type {
  ApiKeyResponse,
  ApiKeyResult,
  ApiKeyUpdate
} from '@/types/apiKey';
import { ApiKeyOperationError } from '@/types/apiKey';

// Hook options interface
interface UseApiKeyManagementOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

// Hook return type
interface UseApiKeyManagementReturn {
  revokeApiKey: (keyId: string) => Promise<void>;
  updateApiKey: (keyId: string, updates: ApiKeyUpdate) => Promise<ApiKeyResponse>;
  isRevoking: boolean;
  isUpdating: boolean;
  isError: boolean;
  error: Error | null;
  reset: () => void;
}

/**
 * Hook for API key management operations
 * 
 * Features:
 * - Key revocation with cache invalidation
 * - Key metadata updates
 * - Error handling with typed errors
 * - Loading states for each operation
 */
export const useApiKeyManagement = (
  options: UseApiKeyManagementOptions = {}
): UseApiKeyManagementReturn => {
  const queryClient = useQueryClient();

  const revokeMutation = useMutation({
    mutationFn: async (keyId: string): Promise<void> => {
      const result: ApiKeyResult<void> = await apiKeyClient.revokeApiKey(keyId);
      
      if (!result.success) {
        throw new ApiKeyOperationError(result.message, result.error);
      }
    },
    
    onSuccess: () => {
      // Invalidate API keys list to refresh the UI
      void queryClient.invalidateQueries({
        queryKey: API_KEY_QUERY_KEYS.lists()
      });
      
      options.onSuccess?.();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ keyId, updates }: { keyId: string; updates: ApiKeyUpdate }): Promise<ApiKeyResponse> => {
      const result: ApiKeyResult<ApiKeyResponse> = await apiKeyClient.updateApiKey(keyId, updates);
      
      if (!result.success) {
        throw new ApiKeyOperationError(result.message, result.error);
      }
      
      return result.data;
    },
    
    onSuccess: () => {
      // Invalidate API keys list to refresh the UI
      void queryClient.invalidateQueries({
        queryKey: API_KEY_QUERY_KEYS.lists()
      });
      
      options.onSuccess?.();
    }
  });

  return {
    revokeApiKey: revokeMutation.mutateAsync,
    updateApiKey: async (keyId: string, updates: ApiKeyUpdate) => {
      return updateMutation.mutateAsync({ keyId, updates });
    },
    isRevoking: revokeMutation.isPending,
    isUpdating: updateMutation.isPending,
    isError: revokeMutation.isError || updateMutation.isError,
    error: revokeMutation.error || updateMutation.error,
    reset: () => {
      revokeMutation.reset();
      updateMutation.reset();
    }
  };
};