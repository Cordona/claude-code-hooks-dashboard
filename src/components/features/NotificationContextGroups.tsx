import React, { useMemo, useCallback, useState, startTransition } from 'react'
import { Box, Typography, Button } from '@mui/material'
import { DeleteSweep } from '@mui/icons-material'
import { NotificationContextCard } from '.'
import { PurgeConfirmationDialog } from '@/components/ui'
import { groupNotificationsByContext, getRandomEmptyStateMessage } from '@/utils'
import type { NotificationData } from '@/types'

/**
 * Props for NotificationContextGroups component
 */
export interface NotificationContextGroupsProps {
  /** Array of notifications to group and display */
  notifications: NotificationData[]
  /** Callback when individual notification is deleted */
  onDeleteNotification: (id: string) => void
  /** Callback when all notifications in a context are deleted */
  onDeleteAllInContext: (contextKey: string) => void
  /** Callback when all notifications should be purged */
  onPurgeAll?: () => void
}

/**
 * Container component that groups notifications by context and renders them as collapsible cards
 * Only shows when there are notifications with project context
 */
export const NotificationContextGroups: React.FC<NotificationContextGroupsProps> = React.memo(
  ({ notifications, onDeleteNotification, onDeleteAllInContext, onPurgeAll }) => {
    const [isPurgeDialogOpen, setIsPurgeDialogOpen] = useState(false)
    const [isPurging, setIsPurging] = useState(false)
    /**
     * Group notifications by context
     */
    const notificationGroups = useMemo(() => {
      return groupNotificationsByContext(notifications)
    }, [notifications])

    /**
     * Get a random empty state message
     */
    const emptyStateMessage = useMemo(() => {
      return getRandomEmptyStateMessage()
    }, [])

    /**
     * Handle delete all for specific context
     */
    const handleDeleteAllInContext = useCallback(
      (contextKey: string): void => {
        onDeleteAllInContext(contextKey)
      },
      [onDeleteAllInContext],
    )

    /**
     * Handle purge button click
     */
    const handlePurgeClick = useCallback(() => {
      startTransition(() => {
        setIsPurgeDialogOpen(true)
      })
    }, [])

    /**
     * Handle purge confirmation
     */
    const handlePurgeConfirm = useCallback(async () => {
      if (!onPurgeAll) return

      try {
        startTransition(() => {
          setIsPurging(true)
        })
        onPurgeAll()
        startTransition(() => {
          setIsPurgeDialogOpen(false)
        })
      } catch (error) {
        // Handle purge errors by logging and maintaining stable UI state
        // eslint-disable-next-line no-console
        console.error('Failed to purge notifications:', error instanceof Error ? error.message : 'Unknown error')
        
        // Error handled: Log error and ensure dialog closes so user can retry
        startTransition(() => {
          setIsPurgeDialogOpen(false)
        })

        // For now, error is handled by logging and keeping the UI stable
      } finally {
        startTransition(() => {
          setIsPurging(false)
        })
      }
    }, [onPurgeAll])

    /**
     * Handle purge dialog cancel
     */
    const handlePurgeCancel = useCallback(() => {
      startTransition(() => {
        setIsPurgeDialogOpen(false)
      })
    }, [])

    // Show empty state when no notifications
    if (notifications.length === 0) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '200px',
            mb: 3,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 400,
              fontSize: '1.125rem',
              color: 'text.secondary',
              textAlign: 'center',
              letterSpacing: '0.01em',
            }}
          >
            {emptyStateMessage}
          </Typography>
        </Box>
      )
    }

    return (
      <Box sx={{ mb: 3 }}>
        {/* Section Title with Purge Button */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 500,
              fontSize: '1.25rem',
              color: 'text.primary',
            }}
          >
            Contexts
          </Typography>

          {/* Purge All Button - only show when there are notifications and purge function is provided */}
          {notifications.length > 0 && onPurgeAll && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<DeleteSweep />}
              onClick={handlePurgeClick}
              disabled={isPurging}
              sx={{
                textTransform: 'none',
                fontWeight: 500,
                minWidth: 'auto',
                px: 2,
              }}
            >
              Purge All ({notifications.length})
            </Button>
          )}
        </Box>

        {/* Context Groups */}
        <Box>
          {notificationGroups.map((group) => (
            <NotificationContextCard
              key={group.contextKey}
              group={group}
              onDeleteNotification={onDeleteNotification}
              onDeleteAllInContext={handleDeleteAllInContext}
            />
          ))}
        </Box>

        {/* Purge Confirmation Dialog */}
        <PurgeConfirmationDialog
          open={isPurgeDialogOpen}
          notificationCount={notifications.length}
          isLoading={isPurging}
          onConfirm={handlePurgeConfirm}
          onCancel={handlePurgeCancel}
        />
      </Box>
    )
  },
)

NotificationContextGroups.displayName = 'NotificationContextGroups'
