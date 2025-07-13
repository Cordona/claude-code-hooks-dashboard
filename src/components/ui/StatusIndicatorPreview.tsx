import React from 'react'
import { Box, Typography, useTheme } from '@mui/material'

interface StatusIndicatorPreviewProps {
  type: 'connection' | 'notification' | 'audio'
  status:
    | 'enabled'
    | 'disabled'
    | 'connected'
    | 'disconnected'
    | 'ready'
    | 'waiting'
    | 'not-supported'
  label: string
  size?: number
}

export const StatusIndicatorPreview: React.FC<StatusIndicatorPreviewProps> = React.memo(
  ({ type, status, label, size = 8 }) => {
    const theme = useTheme()

    const getStatusColor = (): string => {
      if (type === 'connection') {
        return status === 'connected' ? theme.palette.success.main : theme.palette.error.main
      } else if (type === 'notification') {
        return status === 'enabled' ? theme.palette.info.main : theme.palette.warning.main
      } else if (type === 'audio') {
        if (status === 'ready') return theme.palette.mode === 'dark' ? '#b794f6' : '#9f7aea'
        if (status === 'waiting') return theme.palette.warning.main
        return theme.palette.action.disabled
      }
      return theme.palette.text.secondary
    }

    const shouldPulse = status === 'disconnected' || status === 'disabled' || status === 'waiting'

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
