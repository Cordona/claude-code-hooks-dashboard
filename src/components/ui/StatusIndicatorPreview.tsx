import React from 'react'
import { Box, Typography, useTheme } from '@mui/material'

interface StatusIndicatorPreviewProps {
  type: 'connection' | 'notification' | 'audio'
  status:
    | 'enabled'
    | 'disabled'
    | 'blocked'
    | 'connected'
    | 'connecting'
    | 'disconnected'
    | 'dormant'
    | 'ready'
    | 'waiting'
    | 'not-supported'
  label: string
  size?: number
}

export const StatusIndicatorPreview: React.FC<StatusIndicatorPreviewProps> = React.memo(
  ({ type, status, label, size = 8 }) => {
    const theme = useTheme()

    const getConnectionColor = (): string => {
      if (status === 'connected') return theme.palette.success.main
      if (status === 'connecting') return '#2196f3' // Blue for connecting
      if (status === 'dormant') return '#9e9e9e' // Gray for dormant/authentication required
      return theme.palette.error.main // disconnected
    }

    const getNotificationColor = (): string => {
      if (status === 'enabled') return theme.palette.info.main
      if (status === 'blocked') return theme.palette.error.main
      return theme.palette.warning.main // disabled
    }

    const getAudioColor = (): string => {
      if (status === 'ready') return theme.palette.mode === 'dark' ? '#b794f6' : '#9f7aea'
      if (status === 'waiting') return theme.palette.warning.main
      return theme.palette.action.disabled
    }

    const getStatusColor = (): string => {
      if (type === 'connection') return getConnectionColor()
      if (type === 'notification') return getNotificationColor()
      if (type === 'audio') return getAudioColor()
      return theme.palette.text.secondary
    }

    const shouldPulse = status === 'disconnected' || status === 'disabled' || status === 'blocked' || status === 'waiting' || status === 'connecting'

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing(1.5),
          py: theme.spacing(0.5),
        }}
      >
        <Box
          sx={{
            width: size,
            height: size,
            borderRadius: '50%',
            backgroundColor: getStatusColor(),
            opacity: shouldPulse ? 0.8 : 1,
            animation: shouldPulse ? 'pulse 1.5s infinite' : 'none',
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
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.primary,
            fontSize: '0.875rem',
            fontWeight: 400,
          }}
        >
          {label}
        </Typography>
      </Box>
    )
  },
)

StatusIndicatorPreview.displayName = 'StatusIndicatorPreview'
