import React, { useMemo, useCallback } from 'react'
import { Box, Typography, useTheme } from '@mui/material'
import { useSystemNotifications } from '@/hooks'

interface NotificationStatusProps {
  size?: 'small' | 'medium' | 'large'
  showLabel?: boolean
  dotSize?: number
}

export const NotificationStatus: React.FC<NotificationStatusProps> = React.memo(
  ({ size = 'small', showLabel = true, dotSize: customDotSize }) => {
    const { state } = useSystemNotifications()
    const { isSupported, isEnabled, isRequesting, permission } = state

    const dotSize = useMemo(() => {
      if (customDotSize) return customDotSize
      
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
    }, [size, customDotSize])

    const theme = useTheme()

    const getStatusColor = useCallback((): string => {
      // Refined, subtle colors inspired by the reference design
      if (!isSupported) return theme.palette.mode === 'dark' ? '#f87171' : '#ef4444' // Subtle red for is not supported
      if (isEnabled) return theme.palette.mode === 'dark' ? '#60a5fa' : '#3b82f6' // Subtle blue for enabled
      if (permission === 'denied') return theme.palette.mode === 'dark' ? '#f87171' : '#ef4444' // Subtle red for blocked
      return theme.palette.mode === 'dark' ? '#fbbf24' : '#f59e0b' // Subtle amber for disabled
    }, [isSupported, isEnabled, permission, theme.palette])


    const getAriaLabel = useCallback((): string => {
      if (!isSupported) return 'System notifications not supported'
      if (isRequesting) return 'Requesting notification permission'
      if (isEnabled) return 'System notifications enabled'
      if (permission === 'denied') return 'System notifications blocked'
      return 'System notifications disabled'
    }, [isSupported, isRequesting, isEnabled, permission])

    const getStatusLabel = useCallback((): string => {
      // Sentence case labels for better readability
      if (!isSupported) return 'Notifications not supported'
      if (isRequesting) return 'Requesting permission'
      if (isEnabled) return 'Notifications on'
      if (permission === 'denied') return 'Notifications blocked'
      return 'Notifications off'
    }, [isSupported, isRequesting, isEnabled, permission])

    const shouldPulse = !isEnabled && isSupported && permission !== 'denied'

    return (
      <Box
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

NotificationStatus.displayName = 'NotificationStatus'
