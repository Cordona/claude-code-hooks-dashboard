import React, { useMemo, useCallback } from 'react'
import { Box, Tooltip, useTheme } from '@mui/material'
import { useSystemNotifications } from '@/hooks'

interface NotificationStatusProps {
  size?: 'small' | 'medium' | 'large'
}

export const NotificationStatus: React.FC<NotificationStatusProps> = React.memo(
  ({ size = 'small' }) => {
    const { state } = useSystemNotifications()
    const { isSupported, isEnabled, isRequesting, permission } = state

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

    const theme = useTheme()

    const getStatusColor = useCallback((): string => {
      if (!isSupported) return theme.palette.error.main
      if (isEnabled) return theme.palette.info.main // Nice blue like the original
      if (permission === 'denied') return theme.palette.error.main
      return theme.palette.warning.main
    }, [isSupported, isEnabled, permission, theme.palette])

    const getStatusText = useCallback((): string => {
      if (!isSupported) return 'System notifications not supported in this browser'
      if (isRequesting) return 'Requesting notification permission...'
      if (isEnabled) return 'System notifications enabled'
      if (permission === 'denied') return 'System notifications blocked - Check browser settings'
      return 'System notifications disabled'
    }, [isSupported, isRequesting, isEnabled, permission])

    const getAriaLabel = useCallback((): string => {
      if (!isSupported) return 'System notifications not supported'
      if (isRequesting) return 'Requesting notification permission'
      if (isEnabled) return 'System notifications enabled'
      if (permission === 'denied') return 'System notifications blocked'
      return 'System notifications disabled'
    }, [isSupported, isRequesting, isEnabled, permission])

    // Remove all click functionality - status indicator is now display-only

    return (
      <Tooltip title={getStatusText()} arrow placement="bottom">
        <Box
          aria-live="polite"
          aria-label={getAriaLabel()}
          sx={{
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            backgroundColor: getStatusColor(),
            opacity: !isEnabled && isSupported ? 0.6 : 1,
            transition: 'all 0.3s ease-in-out',
            animation:
              !isEnabled && isSupported && permission !== 'denied' ? 'pulse 1.5s infinite' : 'none',
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

NotificationStatus.displayName = 'NotificationStatus'
