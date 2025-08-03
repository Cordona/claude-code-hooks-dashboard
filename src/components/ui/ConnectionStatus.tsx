import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { Box, Typography, useTheme } from '@mui/material'
import { useSSEConnect, useAuthStatus, useUserInitialization } from '@/hooks'

interface ConnectionStatusProps {
  size?: 'small' | 'medium' | 'large'
  showLabel?: boolean
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = React.memo(
  ({ size = 'small', showLabel = true }) => {
    const theme = useTheme()
    const { isAuthenticated, user } = useAuthStatus()
    const { userInitialized, initializingUser, initializationError } = useUserInitialization({
      isAuthenticated,
      accessToken: user?.access_token,
    })
    const { isConnected, isConnecting } = useSSEConnect({
      isAuthenticated,
      userInitialized,
      accessToken: user?.access_token,
    })
    

    const dotSize = useMemo(() => {
      switch (size) {
        case 'small':
          return 6
        case 'medium':
          return 6
        case 'large':
          return 8
        default:
          return 6
      }
    }, [size])

    const getStatusColor = (): string => {
      const isDark = theme.palette.mode === 'dark'
      
      // Status color mapping to reduce cognitive complexity
      const statusColors = {
        dormant: isDark ? '#6b7280' : '#9ca3af',
        initializing: isDark ? '#fbbf24' : '#f59e0b', 
        error: isDark ? '#f87171' : '#ef4444',
        connecting: isDark ? '#60a5fa' : '#3b82f6',
        connected: isDark ? '#4ade80' : '#10b981',
        disconnected: isDark ? '#f87171' : '#ef4444'
      }
      
      if (!isAuthenticated) return statusColors.dormant
      if (initializingUser) return statusColors.initializing
      if (initializationError) return statusColors.error
      if (isConnecting) return statusColors.connecting
      if (isConnected) return statusColors.connected
      return statusColors.disconnected
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

    const getStatusLabel = (): string => {
      // Sentence case labels for better readability
      if (!isAuthenticated) return 'Service dormant'
      
      if (initializingUser) return 'Service initializing'
      if (initializationError) return 'Connection failed'
      if (isConnecting) return 'Service connecting'
      if (isConnected) return 'Connected to service'
      return 'Service disconnected'
    }

    const shouldPulse = isAuthenticated && (isConnecting || initializingUser)

    return (
      <Box
        component="output"
        aria-live="polite"
        aria-label={getAriaLabel()}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing(1),
          py: theme.spacing(0.25),
          cursor: 'default',
        }}
      >
          <Box
            sx={{
              width: dotSize,
              height: dotSize,
              borderRadius: '50%',
              backgroundColor: getStatusColor(),
              opacity: shouldPulse ? 0.7 : 0.9,
              transition: 'all 0.2s ease-in-out',
              animation: shouldPulse ? 'pulse 2s infinite' : 'none',
              boxShadow: `0 0 0 1px ${getStatusColor()}20`,
              '@keyframes pulse': {
                '0%': {
                  opacity: 0.7,
                  transform: 'scale(1)',
                  boxShadow: `0 0 0 1px ${getStatusColor()}20`,
                },
                '50%': {
                  opacity: 1,
                  transform: 'scale(1.2)',
                  boxShadow: `0 0 0 2px ${getStatusColor()}30`,
                },
                '100%': {
                  opacity: 0.7,
                  transform: 'scale(1)',
                  boxShadow: `0 0 0 1px ${getStatusColor()}20`,
                },
              },
            }}
          />
          {showLabel && (
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.mode === 'dark' ? theme.palette.grey[400] : theme.palette.grey[600],
                fontSize: '0.8125rem',
                fontWeight: 400,
                userSelect: 'none',
                letterSpacing: '0.01em',
              }}
            >
              {getStatusLabel()}
            </Typography>
          )}
      </Box>
    )
  },
)

ConnectionStatus.displayName = 'ConnectionStatus'

ConnectionStatus.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  showLabel: PropTypes.bool,
}