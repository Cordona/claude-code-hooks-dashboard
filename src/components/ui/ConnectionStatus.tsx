import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { Box, Tooltip } from '@mui/material'
import { useSSEConnect, useAuthStatus, useUserInitialization } from '@/hooks'

interface ConnectionStatusProps {
  size?: 'small' | 'medium' | 'large'
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = React.memo(
  ({ size = 'small' }) => {
    const { isAuthenticated, user } = useAuthStatus()
    const { userInitialized, initializingUser, initializationError } = useUserInitialization({
      isAuthenticated,
      accessToken: user?.access_token,
    })
    const { isConnected, isConnecting, error } = useSSEConnect({
      isAuthenticated,
      userInitialized,
      accessToken: user?.access_token,
    })
    

    const dotSize = useMemo(() => {
      switch (size) {
        case 'small':
          return 8
        case 'medium':
          return 12
        case 'large':
          return 16
        default:
          return 8
      }
    }, [size])

    const getStatusColor = (): string => {
      // If not authenticated, show neutral state
      if (!isAuthenticated) return '#9e9e9e' // Gray for dormant
      
      if (initializingUser) return '#ff9800' // Orange for initialization
      if (initializationError) return '#f44336' // Red for initialization error
      if (isConnecting) return '#2196f3' // Blue for connecting
      if (isConnected) return '#4caf50' // Green for connected
      return '#f44336' // Red for disconnected
    }

    const getStatusText = (): string => {
      // If not authenticated, show dormant state
      if (!isAuthenticated) return 'Authentication required'
      
      if (initializingUser) return 'Initializing your account...'
      if (initializationError) return `Initialization failed: ${initializationError.message}`
      if (isConnecting) return 'Connecting to service...'
      if (isConnected) {
        return 'Connected to service'
      }
      if (error) return `Connection error: ${error.message}`
      return 'Disconnected from service'
    }

    const getAriaLabel = (): string => {
      // If not authenticated, show dormant state
      if (!isAuthenticated) return 'Authentication required'
      
      if (initializingUser) return 'Initializing account'
      if (initializationError) return 'Initialization failed'
      if (isConnecting) return 'Service connecting'
      if (isConnected) return 'Service connected'
      return 'Service disconnected'
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title={getStatusText()} arrow placement="bottom">
          <Box
            component="output"
            aria-live="polite"
            aria-label={getAriaLabel()}
            sx={{
              width: dotSize,
              height: dotSize,
              borderRadius: '50%',
              backgroundColor: getStatusColor(),
              opacity: (isAuthenticated && (isConnecting || initializingUser)) ? 0.6 : 1,
              transition: 'all 0.3s ease-in-out',
              cursor: 'default',
              animation: (isAuthenticated && (isConnecting || initializingUser)) ? 'pulse 1.5s infinite' : 'none',
              '@keyframes pulse': {
                '0%': {
                  opacity: 0.6,
                  transform: 'scale(1)',
                },
                '50%': {
                  opacity: 1,
                  transform: 'scale(1.1)',
                },
                '100%': {
                  opacity: 0.6,
                  transform: 'scale(1)',
                },
              },
            }}
          />
        </Tooltip>
      </Box>
    )
  },
)

ConnectionStatus.displayName = 'ConnectionStatus'

ConnectionStatus.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
}