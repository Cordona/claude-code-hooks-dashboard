import {useAuth} from 'react-oidc-context'

/**
 * Hook to get authentication status
 * Provides a clean interface for auth state checking
 */
export const useAuthStatus = () => {
    const auth = useAuth()

    return {
        isAuthenticated: !!auth.user && !auth.isLoading,
        isLoading: auth.isLoading,
        user: auth.user,
    } as const
}