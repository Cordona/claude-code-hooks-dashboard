import type { ReactNode, FC } from 'react'
import { Box, Typography } from '@mui/material'
import { useAuth } from 'react-oidc-context'

interface AuthGuardProps {
  readonly children: ReactNode
  readonly fallback?: ReactNode
}

/**
 * AuthGuard Component
 * Provides authentication state checking and loading states
 * Following SRP: Single responsibility of handling auth state
 */
export const AuthGuard: FC<AuthGuardProps> = ({ 
  children, 
  fallback 
}) => {
  const auth = useAuth()

  // Show loading state during authentication
  if (auth.isLoading) {
    return fallback || (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          🔐 Checking authentication...
        </Typography>
      </Box>
    )
  }

  // Always render parent components are handling children - authentication state
  // This component just provides loading state management
  return <>{children}</>
}