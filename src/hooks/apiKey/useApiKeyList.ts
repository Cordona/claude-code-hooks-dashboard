/**
 * API Key List Hook
 * 
 * React Query hook for fetching and managing API key lists.
 * Follow component-level data fetching patterns.
 */

import { useQuery } from '@tanstack/react-query';
import { apiKeyClient } from '@/services/apiKey';
import { API_KEY_QUERY_KEYS } from './useApiKeyGeneration';
import type {
  ApiKeyResponse,
  ApiKeyResult,
  ApiKeyError
} from '@/types/apiKey';
import { ApiKeyOperationError } from '@/types/apiKey';

// Hook options interface
interface UseApiKeyListOptions {
  enabled?: boolean;
  refetchInterval?: number;
  staleTime?: number;
}

// Hook return type
interface UseApiKeyListReturn {
  apiKeys: ApiKeyResponse[];
  isLoading: boolean;
  isError: boolean;
  error: { error: ApiKeyError; message: string } | null;
  refetch: () => Promise<unknown>;
  isRefetching: boolean;
}

/**
 * Hook for fetching API a key list with React Query
 * 
 * Features:
 * - Automatic caching and background refetching
 * - Error handling with typed errors
 * - Loading states for UI feedback
 * - Configurable refresh intervals
 */
export const useApiKeyList = (
  options: UseApiKeyListOptions = {}
): UseApiKeyListReturn => {
  const {
    enabled = true,
    refetchInterval = 30000, // 30 seconds
    staleTime = 5 * 60 * 1000 // 5 minutes
  } = options;

  const query = useQuery({
    queryKey: API_KEY_QUERY_KEYS.lists(),
    
    queryFn: async (): Promise<ApiKeyResponse[]> => {
      const result: ApiKeyResult<ApiKeyResponse[]> = await apiKeyClient.listApiKeys();
      
      if (!result.success) {
        throw new ApiKeyOperationError(result.message, result.error);
      }
      
      return result.data;
    },
    
    enabled,
    refetchInterval,
    staleTime
  });

  return {
    apiKeys: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as { error: ApiKeyError; message: string } | null,
    refetch: query.refetch,
    isRefetching: query.isRefetching
  };
};