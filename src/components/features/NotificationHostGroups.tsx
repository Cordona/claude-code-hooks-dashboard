import React, {useCallback, useMemo} from 'react'
import {Box, Typography} from '@mui/material'
import {NotificationHostCard} from '.'
import {getRandomEmptyStateMessage, groupNotificationsByHostProjectSession} from '@/utils'
import type {NotificationData} from '@/types'

/**
 * Props for NotificationHostGroups component
 */
export interface NotificationHostGroupsProps {
    /** Array of notifications to group and display */
    notifications: NotificationData[]
    /** Callback when individual notification is deleted */
    onDeleteNotification: (id: string) => void
    /** Callback when all notifications in a context are deleted */
    onDeleteAllInContext: (contextKey: string) => void
    /** Callback when all notifications in a host are deleted */
    onDeleteAllInHost: (hostname: string) => void
    /** Callback when all notifications in a session are deleted */
    onDeleteAllInSession: (sessionId: string) => void
}

/**
 * Container component that groups notifications by hostname and renders them as collapsible host cards
 * Top-level component in the three-tier hierarchy: Host > Project > Session
 */
export const NotificationHostGroups: React.FC<NotificationHostGroupsProps> = React.memo(
    ({
        notifications,
        onDeleteNotification,
        onDeleteAllInContext,
        onDeleteAllInHost,
        onDeleteAllInSession,
    }) => {

        /**
         * Group notifications by host > project > session hierarchy
         */
        const hostGroups = useMemo(() => {
            return groupNotificationsByHostProjectSession(notifications)
        }, [notifications])

        /**
         * Get a random empty state message
         */
        const emptyStateMessage = useMemo(() => {
            return getRandomEmptyStateMessage()
        }, [])

        /**
         * Handle delete all for specific host
         */
        const handleDeleteAllInHost = useCallback(
            (hostname: string): void => {
                onDeleteAllInHost(hostname)
            },
            [onDeleteAllInHost],
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
            <Box sx={{mb: 3}}>
                {/* Section Title */}
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
                        Hosts
                    </Typography>
                </Box>

                {/* Host Groups */}
                <Box>
                    {hostGroups.map((hostGroup) => (
                        <NotificationHostCard
                            key={hostGroup.hostname}
                            hostGroup={hostGroup}
                            onDeleteNotification={onDeleteNotification}
                            onDeleteAllInContext={onDeleteAllInContext}
                            onDeleteAllInHost={handleDeleteAllInHost}
                            onDeleteAllInSession={onDeleteAllInSession}
                        />
                    ))}
                </Box>

            </Box>
        )
    },
)

NotificationHostGroups.displayName = 'NotificationHostGroups'