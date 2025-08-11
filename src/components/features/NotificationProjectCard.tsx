import React, {startTransition, useCallback, useEffect, useState} from 'react'
import {Box, Collapse, IconButton, Paper, Typography, useTheme} from '@mui/material'
import {DeleteOutline, ExpandLess, ExpandMore, FolderOutlined} from '@mui/icons-material'
import {NotificationSessionList} from '.'
import {ConfirmationDialog} from '@/components/ui'
import type {ProjectGroup} from '@/types'

/**
 * Props for NotificationProjectCard component
 */
export interface NotificationProjectCardProps {
    /** Project group data */
    projectGroup: ProjectGroup
    /** Callback when individual notification is deleted */
    onDeleteNotification: (id: string) => void
    /** Callback when all notifications in this project are deleted */
    onDeleteAllInContext: (contextKey: string) => void
    /** Callback when all notifications in a session are deleted */
    onDeleteAllInSession: (sessionId: string) => void
}

/**
 * Collapsible card for notifications grouped by project context
 * Shows project name, count, and expandable list of session groups
 * Maintains exact dimensions from original NotificationContextCard
 */
export const NotificationProjectCard: React.FC<NotificationProjectCardProps> = React.memo(
    ({projectGroup, onDeleteNotification, onDeleteAllInContext, onDeleteAllInSession}) => {
        const theme = useTheme()
        const [isExpanded, setIsExpanded] = useState<boolean>(false)
        const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false)

        /**
         * Load expanded state from localStorage
         */
        useEffect(() => {
            const storageKey = `project-expanded-${projectGroup.contextKey}`
            const stored = localStorage.getItem(storageKey)
            if (stored !== null) {
                startTransition(() => {
                    setIsExpanded(JSON.parse(stored))
                })
            }
        }, [projectGroup.contextKey])

        /**
         * Toggle expand/collapse and save state
         */
        const handleToggleExpanded = useCallback((): void => {
            const newExpanded = !isExpanded
            startTransition(() => {
                setIsExpanded(newExpanded)
            })
            const storageKey = `project-expanded-${projectGroup.contextKey}`
            localStorage.setItem(storageKey, JSON.stringify(newExpanded))
        }, [isExpanded, projectGroup.contextKey])

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
         * Confirm delete all for this project
         */
        const handleConfirmDeleteAll = useCallback((): void => {
            onDeleteAllInContext(projectGroup.contextKey)
            startTransition(() => {
                setIsConfirmDialogOpen(false)
            })
        }, [projectGroup.contextKey, onDeleteAllInContext])

        return (
            <Paper
                elevation={0}
                sx={{
                    backgroundColor: theme.palette.mode === 'dark'
                        ? `rgba(255, 255, 255, ${0.02 + 0.015 + 0.015})` // +1.5% from host card (~5% total from dashboard)
                        : `rgba(0, 0, 0, ${0.02 + 0.015 + 0.015})`, // +1.5% from host card (~5% total from dashboard)
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: `1px solid ${theme.palette.divider}`,
                    mb: 2,
                }}
            >
                {/* Header - exact same dimensions as original NotificationContextCard */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        px: 2,
                        py: 1.5,
                        borderBottom: isExpanded ? `1px solid ${theme.palette.divider}` : 'none',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease-in-out',
                        '&:hover': {
                            backgroundColor: 'action.hover',
                        },
                    }}
                    onClick={handleToggleExpanded}
                >
                    {/* Folder Icon - exact same as original */}
                    <FolderOutlined
                        sx={{
                            color: 'primary.main',
                            mr: 1.5,
                            fontSize: '1.25rem',
                        }}
                    />

                    {/* Project Name - exact same as original */}
                    <Typography
                        variant="body1"
                        sx={{
                            fontWeight: 500,
                            color: 'text.primary',
                            flex: 1,
                            fontSize: '0.95rem',
                        }}
                    >
                        {projectGroup.contextName}
                    </Typography>

                    {/* Right-aligned Control Area - Natural flex alignment with 8px grid */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: { xs: 0.5, sm: 1 }, // Responsive gap: 4px on mobile, 8px on desktop
                        ml: 'auto',
                        pr: { xs: 1.5, sm: 2 } // Responsive padding: 12px on mobile, 16px on desktop
                    }}>
                        {/* Count Badge - Project Level (Enhanced Readability) */}
                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: 500,
                                fontSize: '0.75rem', // Increased from 0.6875rem for better readability
                                color: theme.palette.mode === 'dark' ? '#1a1a1a' : '#3e2723',
                                backgroundColor: theme.palette.mode === 'dark' ? '#ccaa3f' : '#d7ccc8',
                                border: theme.palette.mode === 'dark' ? 'none' : `1px solid #a1887f`,
                                px: 0.875, // Slightly increased padding for better balance
                                py: 0.3, // Slightly increased vertical padding
                                borderRadius: 0.5, // 4px border radius
                                minWidth: 'auto',
                                whiteSpace: 'nowrap',
                                lineHeight: 1.2,
                            }}
                        >
                            {projectGroup.count}
                        </Typography>

                        {/* Delete Button - Project Level (Enhanced Touch Target) */}
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteAllClick()
                            }}
                            aria-label={`Purge all notifications for ${projectGroup.contextName}`}
                            sx={{
                                color: '#f44336',
                                width: 32, // Increased from 28px for better touch targets
                                height: 32,
                                opacity: 0.8,
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    opacity: 1,
                                    backgroundColor: '#f44336',
                                    color: 'error.contrastText',
                                },
                            }}
                        >
                            <DeleteOutline sx={{fontSize: '0.875rem'}}/>
                        </IconButton>

                        {/* Expand/Collapse Arrow - Project Level (Enhanced Visual Weight) */}
                        {isExpanded ? (
                            <ExpandLess sx={{
                                color: 'primary.main', 
                                fontSize: '1.375rem', // Increased from 1.25rem for better visual balance
                                transition: 'transform 0.2s ease-in-out',
                                opacity: 0.9
                            }}/>
                        ) : (
                            <ExpandMore sx={{
                                color: 'primary.main', 
                                fontSize: '1.375rem', // Increased from 1.25rem for better visual balance
                                transition: 'transform 0.2s ease-in-out',
                                opacity: 0.9
                            }}/>
                        )}
                    </Box>
                </Box>

                {/* Collapsible Content */}
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Box sx={{pl: 3}}> {/* Indent sessions within contexts (pl: 3 = additional left padding for deeper nesting) */}
                        <NotificationSessionList
                            sessionGroups={projectGroup.sessionGroups}
                            onDeleteNotification={onDeleteNotification}
                            onDeleteAllInSession={onDeleteAllInSession}
                        />
                    </Box>
                </Collapse>

                {/* Confirmation Dialog - exact same as original */}
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
                            {projectGroup.contextName}
                        </Box>
                        .
                    </Typography>
                </ConfirmationDialog>
            </Paper>
        )
    },
)

NotificationProjectCard.displayName = 'NotificationProjectCard'