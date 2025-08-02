import React, { useState, useCallback, useEffect, startTransition } from 'react'
import { Box, Typography, IconButton, Collapse, useTheme, Paper } from '@mui/material'
import { ExpandMore, ExpandLess, FolderOutlined, DeleteOutline } from '@mui/icons-material'
import { ContextNotificationItem } from '.'
import { ConfirmationDialog } from '@/components/ui'
import type { NotificationGroup } from '@/utils'

/**
 * Props for NotificationContextCard component
 */
export interface NotificationContextCardProps {
  /** Notification group data */
  group: NotificationGroup
  /** Callback when individual notification is deleted */
  onDeleteNotification: (id: string) => void
  /** Callback when all notifications in this context are deleted */
  onDeleteAllInContext: (contextKey: string) => void
}

/**
 * Collapsible card for notifications grouped by project context
 * Shows context name, count, and expandable list of notifications
 */
export const NotificationContextCard: React.FC<NotificationContextCardProps> = React.memo(
  ({ group, onDeleteNotification, onDeleteAllInContext }) => {
    const theme = useTheme()
    const [isExpanded, setIsExpanded] = useState<boolean>(false)
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false)

    /**
     * Load expanded state from localStorage
     */
    useEffect(() => {
      const storageKey = `context-expanded-${group.contextKey}`
      const stored = localStorage.getItem(storageKey)
      if (stored !== null) {
        startTransition(() => {
          setIsExpanded(JSON.parse(stored))
        })
      }
    }, [group.contextKey])

    /**
     * Toggle expand/collapse and save state
     */
    const handleToggleExpanded = useCallback((): void => {
      const newExpanded = !isExpanded
      startTransition(() => {
        setIsExpanded(newExpanded)
      })
      const storageKey = `context-expanded-${group.contextKey}`
      localStorage.setItem(storageKey, JSON.stringify(newExpanded))
    }, [isExpanded, group.contextKey])

    /**
     * Show confirmation dialog for delete all
     */
    const handleDeleteAllClick = useCallback((): void => {
      startTransition(() => {
        setIsConfirmDialogOpen(true)
      })
    }, [])

    /**
     * Close confirmation dialog
     */
    const handleDialogClose = useCallback((): void => {
      startTransition(() => {
        setIsConfirmDialogOpen(false)
      })
    }, [])

    /**
     * Confirm delete all for this context
     */
    const handleConfirmDeleteAll = useCallback((): void => {
      onDeleteAllInContext(group.contextKey)
      startTransition(() => {
        setIsConfirmDialogOpen(false)
      })
    }, [group.contextKey, onDeleteAllInContext])

    return (
      <Paper
        elevation={0}
        sx={{
          backgroundColor: 'background.paper',
          borderRadius: 2,
          overflow: 'hidden',
          border: `1px solid ${theme.palette.divider}`,
          mb: 2,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 2,
            py: 1.5,
            borderBottom: isExpanded ? `1px solid ${theme.palette.divider}` : 'none',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
          onClick={handleToggleExpanded}
        >
          {/* Folder Icon */}
          <FolderOutlined
            sx={{
              color: 'primary.main',
              mr: 1.5,
              fontSize: '1.25rem',
            }}
          />

          {/* Context Name */}
          <Typography
            variant="body1"
            sx={{
              fontWeight: 500,
              color: 'text.primary',
              flex: 1,
              fontSize: '0.95rem',
            }}
          >
            {group.contextName}
          </Typography>

          {/* Notification Count */}
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              fontSize: '0.875rem',
              color: theme.palette.mode === 'dark' ? '#1a1a1a' : '#3e2723',
              backgroundColor: theme.palette.mode === 'dark' ? '#ccaa3f' : '#d7ccc8',
              border: theme.palette.mode === 'dark' ? 'none' : `1px solid #a1887f`,
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              mr: 2,
            }}
          >
            {group.count} total
          </Typography>

          {/* Delete All Button */}
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteAllClick()
            }}
            aria-label={`Purge all notifications for ${group.contextName}`}
            sx={{
              color: '#f44336',
              mr: 1,
              '&:hover': {
                backgroundColor: '#f44336',
                color: 'error.contrastText',
              },
            }}
          >
            <DeleteOutline fontSize="small" />
          </IconButton>

          {/* Expand/Collapse Icon */}
          {isExpanded ? (
            <ExpandLess sx={{ color: 'text.secondary' }} />
          ) : (
            <ExpandMore sx={{ color: 'text.secondary' }} />
          )}
        </Box>

        {/* Collapsible Content */}
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <Box>
            {group.notifications.map((notification) => (
              <ContextNotificationItem
                key={notification.id}
                notification={notification}
                onDelete={onDeleteNotification}
              />
            ))}
          </Box>
        </Collapse>

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          open={isConfirmDialogOpen}
          onClose={handleDialogClose}
          onConfirm={handleConfirmDeleteAll}
          title="Delete All Notifications"
          confirmText="Delete All"
          cancelText="Cancel"
          isDestructive={true}
        >
          <Typography
            id="confirmation-dialog-description"
            variant="body2"
            sx={{
              color: 'text.secondary',
              lineHeight: 1.5,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            This will permanently purge all notifications for{' '}
            <Box
              component="span"
              sx={{
                color: 'primary.main',
                fontWeight: 600,
              }}
            >
              {group.contextName}
            </Box>
            .
          </Typography>
        </ConfirmationDialog>
      </Paper>
    )
  },
)

NotificationContextCard.displayName = 'NotificationContextCard'
