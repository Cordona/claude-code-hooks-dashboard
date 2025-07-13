import React, { useMemo, useCallback } from 'react'
import { Box, Typography } from '@mui/material'
import { NotificationContextCard } from '.'
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
}

/**
 * Container component that groups notifications by context and renders them as collapsible cards
 * Only shows when there are notifications with project context
 */
export const NotificationContextGroups: React.FC<NotificationContextGroupsProps> = React.memo(
  ({ notifications, onDeleteNotification, onDeleteAllInContext }) => {
    /**
     * Group notifications by context
     */
    const notificationGroups = useMemo(() => {
      return groupNotificationsByContext(notifications)
    }, [notifications])

    /**
     * Get random empty state message
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
        {/* Section Title */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 500,
            fontSize: '1.25rem',
            color: 'text.primary',
            mb: 2,
          }}
        >
          Contexts
        </Typography>

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
      </Box>
    )
  },
)

NotificationContextGroups.displayName = 'NotificationContextGroups'
