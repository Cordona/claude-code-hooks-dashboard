import React, { useMemo, useCallback } from 'react'
import { Box, Tooltip, useTheme } from '@mui/material'
import { useAudioNotifications } from '@/hooks'

interface AudioStatusProps {
  size?: 'small' | 'medium' | 'large'
}

export const AudioStatus: React.FC<AudioStatusProps> = React.memo(({ size = 'small' }) => {
  const { isEnabled, isSupported, isInitialized } = useAudioNotifications()

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
    // Audio Ready - Light Purple (distinguishable from red)
    if (isSupported && isEnabled && isInitialized) {
      return theme.palette.mode === 'dark' ? '#b794f6' : '#9f7aea'
    }
    // Audio Waiting - Amber
    if (isSupported && isEnabled && !isInitialized) {
      return theme.palette.warning.main
    }
    // Audio Disabled or Not Supported - Gray
    return theme.palette.action.disabled
  }, [isSupported, isEnabled, isInitialized, theme])

  const getStatusText = useCallback((): string => {
    if (!isSupported) return 'Audio not supported by browser'
    if (!isEnabled) return 'Audio notifications disabled'
    if (!isInitialized) return 'Audio ready (click anywhere to activate)'
    return 'Audio notifications ready'
  }, [isSupported, isEnabled, isInitialized])

  const getAriaLabel = useCallback((): string => {
    if (!isSupported) return 'Audio not supported'
    if (!isEnabled) return 'Audio disabled'
    if (!isInitialized) return 'Audio waiting for interaction'
    return 'Audio ready'
  }, [isSupported, isEnabled, isInitialized])

  const shouldPulse = useCallback((): boolean => {
    // Pulse when waiting for user interaction
    return isSupported && isEnabled && !isInitialized
  }, [isSupported, isEnabled, isInitialized])

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
          opacity: shouldPulse() ? 0.8 : 1,
          transition: 'all 0.3s ease-in-out',
          cursor: 'default',
          animation: shouldPulse() ? 'pulse 1.5s infinite' : 'none',
          '@keyframes pulse': {
            '0%': {
              opacity: 0.8,
              transform: 'scale(1)',
            },
            '50%': {
              opacity: 1,
              transform: 'scale(1.1)',
            },
            '100%': {
              opacity: 0.8,
              transform: 'scale(1)',
            },
          },
        }}
      />
    </Tooltip>
  )
})

AudioStatus.displayName = 'AudioStatus'
