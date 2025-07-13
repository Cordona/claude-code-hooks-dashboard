import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { Box, Tooltip } from '@mui/material'
import { useSSEConnection } from '@/hooks'

interface ConnectionStatusProps {
  size?: 'small' | 'medium' | 'large'
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = React.memo(
  ({ size = 'small' }) => {
    const { isConnected, isConnecting, error } = useSSEConnection()

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
      if (isConnecting) return '#d32f2f' // Dark red
      if (isConnected) return '#4caf50' // Brighter green (20% brighter)
      return '#f44336' // Red
    }

    const getStatusText = (): string => {
      if (isConnecting) return 'Connecting to service...'
      if (isConnected) return 'Connected to service'
      if (error) return `Disconnected: ${error}`
      return 'Disconnected from service'
    }

    const getAriaLabel = (): string => {
      if (isConnecting) return 'Service connecting'
      if (isConnected) return 'Service connected'
      return 'Service disconnected'
    }

    return (
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
            opacity: isConnecting ? 0.6 : 1,
            transition: 'all 0.3s ease-in-out',
            cursor: 'default',
            animation: isConnecting ? 'pulse 1.5s infinite' : 'none',
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
    )
  },
)

ConnectionStatus.displayName = 'ConnectionStatus'

ConnectionStatus.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
}
