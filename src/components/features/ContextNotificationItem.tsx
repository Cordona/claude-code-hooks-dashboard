import React, { useState, useActionState, useCallback } from 'react'
import { Box, Typography, IconButton, useTheme, useMediaQuery, Collapse } from '@mui/material'
import { Close, ExpandMore, ExpandLess, ContentCopy, Check } from '@mui/icons-material'
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
    const [isExpanded, setIsExpanded] = useState(false)
    const [copiedItemId, setCopiedItemId] = useState<string | null>(null)

    /**
     * Copy text to clipboard with visual feedback (matching debug menu style)
     */
    const handleCopyToClipboard = useCallback(async (text: string, itemId: string) => {
      try {
        await navigator.clipboard.writeText(text)
        setCopiedItemId(itemId)
        setTimeout(() => setCopiedItemId(null), 2000)
        
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.log(`📋 ${itemId} copied to clipboard:`, text)
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('Failed to copy to clipboard:', error)
        }
      }
    }, [])

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

    /**
     * Toggle expanded state
     */
    const handleToggleExpanded = () => {
      setIsExpanded(!isExpanded)
    }

    /**
     * Check if notification has additional details to show
     */
    const hasAdditionalDetails = Boolean(
      notification.hookType ||
      notification.eventType || 
      notification.metadata || 
      notification.source ||
      notification.projectContext
    )

    return (
      <Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            py: 1.5,
            px: 2,
            borderBottom: hasAdditionalDetails && isExpanded ? 'none' : `1px solid ${theme.palette.divider}`,
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
              textShadow:
                theme.palette.mode === 'light'
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
                textShadow:
                  theme.palette.mode === 'light'
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
              textShadow:
                theme.palette.mode === 'light'
                  ? '0 1px 2px rgba(0, 0, 0, 0.1)'
                  : '0 1px 2px rgba(0, 0, 0, 0.3)',
            }}
          >
            {notification.displayDate}
          </Typography>
        )}

        {/* Expand Button - Only show if there are additional details */}
        {hasAdditionalDetails && (
          <IconButton
            size="small"
            onClick={handleToggleExpanded}
            aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
            sx={{
              color: 'primary.main',
              ml: 1,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: 'action.hover',
                color: 'primary.dark',
              },
            }}
          >
            {isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
          </IconButton>
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

        {/* Collapsible Event Details */}
        {hasAdditionalDetails && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box
              sx={{
                px: 2,
                py: 1.5,
                backgroundColor: 'action.hover',
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  mb: 1,
                  display: 'block',
                }}
              >
                Event Details
              </Typography>

              {/* Hook Type - Primary classification (comes first) */}
              {notification.hookType && (
                <Box sx={{ mb: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: 'text.secondary',
                      display: 'inline-block',
                      minWidth: '80px',
                    }}
                  >
                    Hook type:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'primary.main',
                      ml: 1,
                      display: 'inline',
                      textTransform: 'uppercase',
                      letterSpacing: '0.025em',
                    }}
                  >
                    {notification.hookType}
                  </Typography>
                </Box>
              )}

              {/* Event ID - With copy functionality matching debug menu style */}
              <Box sx={{ mb: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: 'text.secondary',
                    display: 'inline-block',
                    minWidth: '80px',
                  }}
                >
                  Event ID:
                </Typography>
                <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      color: 'text.secondary',
                      ml: 1,
                      wordBreak: 'break-all',
                    }}
                  >
                    {notification.id}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      void handleCopyToClipboard(notification.id, `event-id-${notification.id}`)
                    }}
                    sx={{
                      width: 20,
                      height: 20,
                      ml: 0.5,
                      opacity: 0.8,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        opacity: 1,
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    {copiedItemId === `event-id-${notification.id}` ? (
                      <Check 
                        sx={{ 
                          fontSize: 12, 
                          color: '#4caf50',
                          transition: 'all 0.2s ease-in-out'
                        }} 
                      />
                    ) : (
                      <ContentCopy 
                        sx={{ 
                          fontSize: 12, 
                          color: 'primary.main',
                          opacity: 0.9
                        }} 
                      />
                    )}
                  </IconButton>
                </Box>
              </Box>

              {/* Event Type */}
              {notification.eventType && (
                <Box sx={{ mb: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: 'text.secondary',
                      display: 'inline-block',
                      minWidth: '80px',
                    }}
                  >
                    Type:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      color: 'primary.main',
                      ml: 1,
                      display: 'inline',
                    }}
                  >
                    {notification.eventType}
                  </Typography>
                </Box>
              )}

              {/* Source */}
              {notification.source && (
                <Box sx={{ mb: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: 'text.secondary',
                      display: 'inline-block',
                      minWidth: '80px',
                    }}
                  >
                    Source:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      color: 'text.secondary',
                      ml: 1,
                      display: 'inline',
                    }}
                  >
                    {notification.source}
                  </Typography>
                </Box>
              )}

              {/* Context Work Directory */}
              {notification.projectContext && (
                <Box sx={{ mb: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: 'text.secondary',
                      display: 'inline-block',
                      minWidth: '120px',
                    }}
                  >
                    Context work directory:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      color: 'text.secondary',
                      ml: 1,
                      display: 'inline',
                      wordBreak: 'break-all',
                    }}
                  >
                    {notification.projectContext}
                  </Typography>
                </Box>
              )}

              {/* Metadata */}
              {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: 'text.secondary',
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    Metadata:
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.7rem',
                      color: 'text.secondary',
                      backgroundColor: 'background.paper',
                      p: 1,
                      borderRadius: 1,
                      overflow: 'auto',
                      maxHeight: '100px',
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    {JSON.stringify(notification.metadata, null, 2)}
                  </Box>
                </Box>
              )}
            </Box>
          </Collapse>
        )}
      </Box>
    )
  },
)

ContextNotificationItem.displayName = 'ContextNotificationItem'
