import React, {useCallback} from 'react'
import {Box, Typography} from '@mui/material'
import {NotificationProjectCard} from '.'
import type {ProjectGroup} from '@/types'

/**
 * Props for NotificationProjectGroups component
 */
export interface NotificationProjectGroupsProps {
    /** Array of project groups to display */
    projectGroups: ProjectGroup[]
    /** Callback when individual notification is deleted */
    onDeleteNotification: (id: string) => void
    /** Callback when all notifications in a context are deleted */
    onDeleteAllInContext: (contextKey: string) => void
    /** Callback when all notifications in a session are deleted */
    onDeleteAllInSession: (sessionId: string) => void
}

/**
 * Container component that renders project cards within a host
 * Handles the project-level grouping within the host > project > session hierarchy
 */
export const NotificationProjectGroups: React.FC<NotificationProjectGroupsProps> = React.memo(
    ({projectGroups, onDeleteNotification, onDeleteAllInContext, onDeleteAllInSession}) => {
        /**
         * Handle delete all for specific project context
         */
        const handleDeleteAllInContext = useCallback(
            (contextKey: string): void => {
                onDeleteAllInContext(contextKey)
            },
            [onDeleteAllInContext],
        )

        // Show nothing if no project groups
        if (projectGroups.length === 0) {
            return (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '100px',
                        py: 2,
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'text.secondary',
                            fontSize: '0.875rem',
                            textAlign: 'center',
                            fontStyle: 'italic',
                        }}
                    >
                        No contexts found
                    </Typography>
                </Box>
            )
        }

        return (
            <Box>
                {/* Contexts Section Title */}
                <Typography
                    variant="subtitle1"
                    sx={{
                        fontWeight: 500,
                        fontSize: '1rem',
                        color: 'text.primary',
                        mb: 1.5,
                        opacity: 0.8,
                    }}
                >
                    Contexts
                </Typography>

                {/* Project Cards */}
                <Box>
                    {projectGroups.map((projectGroup) => (
                        <NotificationProjectCard
                            key={projectGroup.contextKey}
                            projectGroup={projectGroup}
                            onDeleteNotification={onDeleteNotification}
                            onDeleteAllInContext={handleDeleteAllInContext}
                            onDeleteAllInSession={onDeleteAllInSession}
                        />
                    ))}
                </Box>
            </Box>
        )
    },
)

NotificationProjectGroups.displayName = 'NotificationProjectGroups'