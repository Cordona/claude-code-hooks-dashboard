import React, { useActionState } from 'react'
import { Box, Typography, IconButton, useTheme, useMediaQuery } from '@mui/material'
import { Close } from '@mui/icons-material'
import type { NotificationData } from '@/types'

/**
 * Props for ContextNotificationItem component
 */
export interface ContextNotificationItemProps {
  /** Notification data to display */
  notification: NotificationData
  /** Callback when notification is deleted */
  onDelete: (id: string) => void
}

/**
 * Simplified notification item for display within context groups
 * Shows time, message, and deletes action in a clean row format
 */
export const ContextNotificationItem: React.FC<ContextNotificationItemProps> = React.memo(
  ({ notification, onDelete }) => {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))

    /**
     * Action for deleting notification using React 19 Actions API
     */
    const [deleteState, deleteAction] = useActionState(
      async (_prevState: { isDeleting: boolean }, formData: FormData) => {
        const id = formData.get('notificationId') as string
        if (id) {
          onDelete(id)
        }
        return { isDeleting: false }
      },
      { isDeleting: false },
    )

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          py: 1.5,
          px: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          '&:last-child': {
            borderBottom: 'none',
          },
          '&:hover': {
            backgroundColor: 'action.hover',
          },
          '&:hover .delete-button': {
            opacity: 1,
          },
        }}
      >
        {/* Time - Hidden on mobile */}
        {!isMobile && (
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'text.secondary',
              minWidth: '60px',
              mr: 2,
              textShadow: theme.palette.mode === 'light' 
                ? '0 1px 2px rgba(0, 0, 0, 0.1)' 
                : '0 1px 2px rgba(0, 0, 0, 0.3)',
            }}
          >
            {notification.displayTime}
          </Typography>
        )}

        {/* Message - Takes up remaining space */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 400,
              lineHeight: 1.4,
              color: 'text.primary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: '0.875rem',
            }}
          >
            {notification.message}
          </Typography>
          {/* Show date on mobile instead of time */}
          {isMobile && (
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.75rem',
                mt: 0.25,
                textShadow: theme.palette.mode === 'light' 
                  ? '0 1px 2px rgba(0, 0, 0, 0.1)' 
                  : '0 1px 2px rgba(0, 0, 0, 0.3)',
              }}
            >
              {notification.displayTime} • {notification.displayDate}
            </Typography>
          )}
        </Box>

        {/* Date - Hidden on mobile */}
        {!isMobile && (
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'text.secondary',
              minWidth: '96px',
              textAlign: 'right',
              mr: 2,
              textShadow: theme.palette.mode === 'light' 
                ? '0 1px 2px rgba(0, 0, 0, 0.1)' 
                : '0 1px 2px rgba(0, 0, 0, 0.3)',
            }}
          >
            {notification.displayDate}
          </Typography>
        )}

        {/* Delete Button */}
        <Box component="form" action={deleteAction} sx={{ display: 'inline' }}>
          <input type="hidden" name="notificationId" value={notification.id} />
          <IconButton
            type="submit"
            size="small"
            className="delete-button"
            disabled={deleteState.isDeleting}
            aria-label={`Delete notification: ${notification.message}`}
            sx={{
              opacity: 0,
              transition: 'all 0.2s ease-in-out',
              color: '#f44336',
              ml: 1,
              '&:hover': {
                backgroundColor: '#f44336',
                color: 'error.contrastText',
              },
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    )
  },
)

ContextNotificationItem.displayName = 'ContextNotificationItem'
