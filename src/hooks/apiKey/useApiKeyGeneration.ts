/**
 * API Key Generation Hook
 *
 * A React Query mutation hook for generating API keys.
 * Follow component-level data fetching patterns.
 */

import {useMutation, useQueryClient} from '@tanstack/react-query';
import {apiKeyClient} from '@/services/apiKey';
import type {ApiKeyError, ApiKeyGenerationRequest, ApiKeyResponse, ApiKeyResult} from '@/types/apiKey';
import {ApiKeyOperationError} from '@/types/apiKey';

// Query key constants for consistency
export const API_KEY_QUERY_KEYS = {
    all: ['apiKeys'] as const,
    lists: () => [...API_KEY_QUERY_KEYS.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
        [...API_KEY_QUERY_KEYS.lists(), filters] as const,
    details: () => [...API_KEY_QUERY_KEYS.all, 'detail'] as const,
    detail: (id: string) => [...API_KEY_QUERY_KEYS.details(), id] as const,
} as const;

// Hook options interface
interface UseApiKeyGenerationOptions {
    onSuccess?: (data: ApiKeyResponse) => void;
    onError?: (error: { error: ApiKeyError; message: string }) => void;
}

// Hook return type
interface UseApiKeyGenerationReturn {
    generateApiKey: (request: ApiKeyGenerationRequest) => Promise<ApiKeyResponse>;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: { error: ApiKeyError; message: string } | null;
    reset: () => void;
}

/**
 * Hook for API key generation with React Query
 *
 * Features:
 * - Optimistic updates and cache invalidation
 * - Error handling with typed errors
 * - Loading states for UI feedback
 * - Integration with the existing auth system
 */
export const useApiKeyGeneration = (
    options: UseApiKeyGenerationOptions = {}
): UseApiKeyGenerationReturn => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (request: ApiKeyGenerationRequest): Promise<ApiKeyResponse> => {
            const result: ApiKeyResult<ApiKeyResponse> = await apiKeyClient.generateApiKey(request);

            if (!result.success) {
                throw new ApiKeyOperationError(result.message, result.error);
            }

            return result.data;
        },

        onSuccess: (data: ApiKeyResponse) => {
            // Invalidate API keys list to refresh the UI
            void queryClient.invalidateQueries({
                queryKey: API_KEY_QUERY_KEYS.lists()
            });

            // Call optional success callback
            options.onSuccess?.(data);
        },

        onError: (error: { error: ApiKeyError; message: string }) => {
            // Call optional error callback
            options.onError?.(error);
        }
    });

    return {
        generateApiKey: mutation.mutateAsync,
        isLoading: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error,
        reset: mutation.reset
    };
};