import React, { useCallback, useRef, useEffect } from 'react'
import { Box, Typography, Paper, Popover, IconButton, useTheme, Divider } from '@mui/material'
import { useHelp } from '@/hooks/useHelp'
import { StatusIndicatorPreview } from '.'

interface HelpTooltipProps {
  size?: 'small' | 'medium' | 'large'
}

export const HelpTooltip: React.FC<HelpTooltipProps> = React.memo(({ size = 'medium' }) => {
  const theme = useTheme()
  const { isHelpOpen, toggleHelp, closeHelp } = useHelp()
  const anchorRef = useRef<HTMLButtonElement>(null)

  const getIconSize = (): number => {
    switch (size) {
      case 'small':
        return 16
      case 'medium':
        return 20
      case 'large':
        return 24
      default:
        return 20
    }
  }

  const getButtonSize = (): number => {
    switch (size) {
      case 'small':
        return 32
      case 'medium':
        return 40
      case 'large':
        return 48
      default:
        return 40
    }
  }

  const handleToggle = useCallback((): void => {
    toggleHelp()
  }, [toggleHelp])

  const handleClose = useCallback((): void => {
    closeHelp()
  }, [closeHelp])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (isHelpOpen && anchorRef.current && !anchorRef.current.contains(event.target as Node)) {
        const target = event.target as Element
        // Check if click is inside the popover
        if (!target.closest('[role="tooltip"]')) {
          closeHelp()
        }
      }
    }

    if (isHelpOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }

    return undefined
  }, [isHelpOpen, closeHelp])

  return (
    <>
      <IconButton
        ref={anchorRef}
        onClick={handleToggle}
        aria-label="Help - Status indicator information"
        aria-expanded={isHelpOpen}
        aria-controls={isHelpOpen ? 'help-tooltip' : undefined}
        aria-haspopup="true"
        size={size}
        sx={{
          width: getButtonSize(),
          height: getButtonSize(),
          color: 'text.secondary',
          backgroundColor: 'transparent !important',
          border: 'none !important',
          borderRadius: '0 !important',
          padding: 0,
          minWidth: 'auto',
          margin: 0,
          transition: 'all 0.2s ease-in-out',
          boxShadow: 'none !important',
          outline: 'none !important',
          '&:hover': {
            backgroundColor: 'transparent !important',
            color: 'text.primary',
            boxShadow: 'none !important',
          },
          '&[aria-expanded="true"]': {
            backgroundColor: 'transparent !important',
            color: 'text.primary',
            boxShadow: 'none !important',
          },
          '&.MuiIconButton-root': {
            backgroundColor: 'transparent !important',
            margin: 0,
            boxShadow: 'none !important',
          },
          '&:focus': {
            backgroundColor: 'transparent !important',
            boxShadow: 'none !important',
            outline: 'none !important',
          },
        }}
      >
        <Typography
          sx={{
            fontSize: getIconSize() * 0.85,
            fontWeight: 400,
            color: 'inherit',
            lineHeight: 1,
            userSelect: 'none',
            textShadow: theme.palette.mode === 'light' 
              ? '0 1px 2px rgba(0, 0, 0, 0.1)' 
              : '0 1px 2px rgba(0, 0, 0, 0.3)',
          }}
        >
          ?
        </Typography>
      </IconButton>

      <Popover
        id="help-tooltip"
        open={isHelpOpen}
        anchorEl={anchorRef.current}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          mt: 1,
          '& .MuiPopover-paper': {
            borderRadius: 2,
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: (theme) => theme.shadows[8],
            backgroundImage: 'none',
          },
        }}
        slotProps={{
          paper: {
            elevation: 0,
            role: 'tooltip',
            'aria-live': 'polite',
            'aria-label': 'Status indicators help information',
          },
        }}
      >
        <Paper
          sx={{
            minWidth: 280,
            maxWidth: 320,
            p: theme.spacing(2),
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'text.primary',
              mb: theme.spacing(1.5),
            }}
          >
            Status indicators
          </Typography>

          <Box sx={{ mb: theme.spacing(2) }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'text.secondary',
                mb: theme.spacing(1),
              }}
            >
              Connection status
            </Typography>
            <StatusIndicatorPreview
              type="connection"
              status="connected"
              label="Service connected"
              size={10}
            />
            <StatusIndicatorPreview
              type="connection"
              status="disconnected"
              label="Service disconnected"
              size={10}
            />
          </Box>

          <Divider sx={{ my: theme.spacing(1.5) }} />

          <Box sx={{ mb: theme.spacing(2) }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'text.secondary',
                mb: theme.spacing(1),
              }}
            >
              Notification status
            </Typography>
            <StatusIndicatorPreview
              type="notification"
              status="enabled"
              label="System notifications enabled"
              size={10}
            />
            <StatusIndicatorPreview
              type="notification"
              status="disabled"
              label="System notifications disabled"
              size={10}
            />
          </Box>

          <Divider sx={{ my: theme.spacing(1.5) }} />

          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'text.secondary',
                mb: theme.spacing(1),
              }}
            >
              Audio status
            </Typography>
            <StatusIndicatorPreview
              type="audio"
              status="ready"
              label="Audio notifications ready"
              size={10}
            />
            <StatusIndicatorPreview
              type="audio"
              status="waiting"
              label="Audio waiting (click anywhere)"
              size={10}
            />
            <StatusIndicatorPreview
              type="audio"
              status="disabled"
              label="Audio notifications disabled"
              size={10}
            />
            <StatusIndicatorPreview
              type="audio"
              status="not-supported"
              label="Audio not supported"
              size={10}
            />
          </Box>
        </Paper>
      </Popover>
    </>
  )
})

HelpTooltip.displayName = 'HelpTooltip'
