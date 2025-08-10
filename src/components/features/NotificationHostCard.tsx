import React, {startTransition, useCallback, useEffect, useState} from 'react'
import {Box, Collapse, IconButton, Paper, Typography, useTheme} from '@mui/material'
import {DeleteOutline, ExpandLess, ExpandMore, ComputerOutlined} from '@mui/icons-material'
import {NotificationProjectGroups} from '.'
import {ConfirmationDialog} from '@/components/ui'
import type {HostGroup} from '@/types'

/**
 * Props for NotificationHostCard component
 */
export interface NotificationHostCardProps {
    /** Host group data */
    hostGroup: HostGroup
    /** Callback when individual notification is deleted */
    onDeleteNotification: (id: string) => void
    /** Callback when all notifications in a context are deleted */
    onDeleteAllInContext: (contextKey: string) => void
    /** Callback when all notifications in this host are deleted */
    onDeleteAllInHost: (hostname: string) => void
    /** Callback when all notifications in a session are deleted */
    onDeleteAllInSession: (sessionId: string) => void
}

/**
 * Collapsible card for notifications grouped by hostname
 * Shows hostname, count, and expandable list of project groups
 * Proportionally larger than project cards for clear visual hierarchy
 */
export const NotificationHostCard: React.FC<NotificationHostCardProps> = React.memo(
    ({hostGroup, onDeleteNotification, onDeleteAllInContext, onDeleteAllInHost, onDeleteAllInSession}) => {
        const theme = useTheme()
        const [isExpanded, setIsExpanded] = useState<boolean>(false)
        const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false)

        /**
         * Load expanded state from localStorage
         */
        useEffect(() => {
            const storageKey = `host-expanded-${hostGroup.hostname}`
            const stored = localStorage.getItem(storageKey)
            if (stored !== null) {
                startTransition(() => {
                    setIsExpanded(JSON.parse(stored))
                })
            }
        }, [hostGroup.hostname])

        /**
         * Toggle expand/collapse and save state
         */
        const handleToggleExpanded = useCallback((): void => {
            const newExpanded = !isExpanded
            startTransition(() => {
                setIsExpanded(newExpanded)
            })
            const storageKey = `host-expanded-${hostGroup.hostname}`
            localStorage.setItem(storageKey, JSON.stringify(newExpanded))
        }, [isExpanded, hostGroup.hostname])

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
         * Confirm delete all for this host
         */
        const handleConfirmDeleteAll = useCallback((): void => {
            onDeleteAllInHost(hostGroup.hostname)
            startTransition(() => {
                setIsConfirmDialogOpen(false)
            })
        }, [hostGroup.hostname, onDeleteAllInHost])

        return (
            <Paper
                elevation={2}
                sx={{
                    backgroundColor: theme.palette.mode === 'dark'
                        ? `rgba(255, 255, 255, ${0.02 + 0.015})` // +1.5% from dashboard background (subtle)
                        : `rgba(0, 0, 0, ${0.02 + 0.015})`, // +1.5% from dashboard background (subtle)
                    borderRadius: 3, // Larger than project cards (borderRadius: 2)
                    overflow: 'hidden',
                    border: `1px solid ${theme.palette.divider}`,
                    mb: 3, // Larger margin than project cards (mb: 2)
                }}
            >
                {/* Header - 25% larger than project cards */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        px: 3, // Larger than project cards (px: 2)
                        py: 2, // Larger than project cards (py: 1.5)
                        borderBottom: isExpanded ? `1px solid ${theme.palette.divider}` : 'none',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease-in-out',
                        '&:hover': {
                            backgroundColor: 'action.hover',
                        },
                    }}
                    onClick={handleToggleExpanded}
                >
                    {/* Computer Icon - outlined style like folder icon */}
                    <ComputerOutlined
                        sx={{
                            color: 'primary.main',
                            mr: 2, // Larger margin than project cards (mr: 1.5)
                            fontSize: '1.5rem', // Larger than project cards (1.25rem)
                        }}
                    />

                    {/* Hostname - larger typography than project cards */}
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 500,
                            color: 'text.primary',
                            flex: 1,
                            fontSize: '1.125rem', // Larger than project cards (0.95rem)
                        }}
                    >
                        {hostGroup.hostname}
                    </Typography>

                    {/* Right-aligned Control Area - Natural flex alignment with 8px grid */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: { xs: 0.5, sm: 1 }, // Responsive gap: 4px on mobile, 8px on desktop
                        ml: 'auto',
                        pr: { xs: 2, sm: 3 } // Responsive padding: 16px on mobile, 24px on desktop
                    }}>
                        {/* Count Badge - Host Level (Largest) */}
                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: 500,
                                fontSize: '0.75rem', // Host level - largest font
                                color: theme.palette.mode === 'dark' ? '#1a1a1a' : '#3e2723',
                                backgroundColor: theme.palette.mode === 'dark' ? '#ccaa3f' : '#d7ccc8',
                                border: theme.palette.mode === 'dark' ? 'none' : `1px solid #a1887f`,
                                px: 1, // 8px horizontal padding
                                py: 0.25, // 2px vertical padding
                                borderRadius: 0.5, // 4px border radius
                                minWidth: 'auto',
                                whiteSpace: 'nowrap',
                                lineHeight: 1.2,
                            }}
                        >
                            {hostGroup.count}
                        </Typography>

                        {/* Delete Button - Host Level (32px) */}
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteAllClick()
                            }}
                            aria-label={`Purge all notifications for ${hostGroup.hostname}`}
                            sx={{
                                color: '#f44336',
                                width: 32, // Host level - largest size
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
                            <DeleteOutline sx={{fontSize: '1rem'}}/>
                        </IconButton>

                        {/* Expand/Collapse Arrow - Host Level (1.5rem) */}
                        {isExpanded ? (
                            <ExpandLess sx={{
                                color: 'primary.main', 
                                fontSize: '1.5rem',
                                transition: 'transform 0.2s ease-in-out',
                                opacity: 0.9
                            }}/>
                        ) : (
                            <ExpandMore sx={{
                                color: 'primary.main', 
                                fontSize: '1.5rem',
                                transition: 'transform 0.2s ease-in-out',
                                opacity: 0.9
                            }}/>
                        )}
                    </Box>
                </Box>

                {/* Collapsible Content */}
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Box sx={{p: 2, pl: 4}}> {/* Indent contexts within hosts (pl: 4 = left padding for indentation) */}
                        <NotificationProjectGroups
                            projectGroups={hostGroup.projectGroups}
                            onDeleteNotification={onDeleteNotification}
                            onDeleteAllInContext={onDeleteAllInContext}
                            onDeleteAllInSession={onDeleteAllInSession}
                        />
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
                            {hostGroup.hostname}
                        </Box>
                        .
                    </Typography>
                </ConfirmationDialog>
            </Paper>
        )
    },
)

NotificationHostCard.displayName = 'NotificationHostCard'