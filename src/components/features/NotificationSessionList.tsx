import React, {useCallback, useEffect, useState} from 'react'
import {Box, Collapse, Divider, IconButton, Typography, useTheme} from '@mui/material'
import {ChatBubbleOutlineOutlined, Check, ContentCopy, DeleteOutline, ExpandLess, ExpandMore} from '@mui/icons-material'
import {ContextNotificationItem} from '.'
import {SessionConfirmationDialog} from '@/components/ui/SessionConfirmationDialog'
import {useClipboard} from '@/hooks/useClipboard'
import type {SessionGroup} from '@/types'

/**
 * Props for NotificationSessionList component
 */
export interface NotificationSessionListProps {
    /** Array of session groups to display */
    sessionGroups: SessionGroup[]
    /** Callback when individual notification is deleted */
    onDeleteNotification: (id: string) => void
    /** Callback when all notifications in a session are deleted */
    onDeleteAllInSession: (sessionId: string) => void
}

/**
 * Component that displays session groups with subtle dividers
 * Shows sessions as organized subgroups within project cards (not full expandable cards)
 * Uses session dividers to avoid overwhelming 4-level nesting
 */
export const NotificationSessionList: React.FC<NotificationSessionListProps> = React.memo(
    ({sessionGroups, onDeleteNotification, onDeleteAllInSession}) => {
        const theme = useTheme()
        const {copyToClipboard, isCopied} = useClipboard()
        const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
        const [pendingSessionId, setPendingSessionId] = useState<string>('')
        const [pendingSessionCount, setPendingSessionCount] = useState<number>(0)
        const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({})


        /**
         * Show confirmation dialog for session deletion
         */
        const handleDeleteSessionClick = useCallback(
            (sessionId: string, sessionCount: number): void => {
                setPendingSessionId(sessionId)
                setPendingSessionCount(sessionCount)
                setIsConfirmDialogOpen(true)
            },
            [],
        )

        /**
         * Handle confirmed session deletion
         */
        const handleConfirmDeleteSession = useCallback((): void => {
            if (pendingSessionId) {
                onDeleteAllInSession(pendingSessionId)
            }
            setIsConfirmDialogOpen(false)
            setPendingSessionId('')
            setPendingSessionCount(0)
        }, [pendingSessionId, onDeleteAllInSession])

        /**
         * Handle dialog close
         */
        const handleDialogClose = useCallback((): void => {
            setIsConfirmDialogOpen(false)
            setPendingSessionId('')
            setPendingSessionCount(0)
        }, [])

        /**
         * Load expanded states from localStorage on mount
         */
        useEffect(() => {
            const loadExpandedStates = () => {
                const expandedStates: Record<string, boolean> = {}
                sessionGroups.forEach((sessionGroup) => {
                    const storageKey = `session-expanded-${sessionGroup.sessionId}`
                    const stored = localStorage.getItem(storageKey)
                    if (stored !== null) {
                        expandedStates[sessionGroup.sessionId] = JSON.parse(stored)
                    }
                })
                setExpandedSessions(expandedStates)
            }
            loadExpandedStates()
        }, [sessionGroups])

        /**
         * Toggle session expand/collapse and save state
         */
        const handleToggleSessionExpanded = useCallback((sessionId: string): void => {
            setExpandedSessions((prev) => {
                const newExpanded = !prev[sessionId]
                const storageKey = `session-expanded-${sessionId}`
                localStorage.setItem(storageKey, JSON.stringify(newExpanded))
                return {
                    ...prev,
                    [sessionId]: newExpanded,
                }
            })
        }, [])

        // Show nothing if no session groups
        if (sessionGroups.length === 0) {
            return null
        }

        return (
            <Box>
                {sessionGroups.map((sessionGroup, index) => (
                    <Box key={sessionGroup.sessionId}>
                        {/* Session Header with subtle styling - clickable for expand/collapse */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                px: 2,
                                py: 1,
                                backgroundColor: theme.palette.mode === 'dark' 
                                    ? `rgba(255, 255, 255, ${0.02 + 0.015 + 0.015 + 0.02})` // +2% from context card (~8% total from dashboard) - slightly darker
                                    : `rgba(0, 0, 0, ${0.02 + 0.015 + 0.015 + 0.02})`, // +2% from context card (~8% total from dashboard) - slightly darker
                                borderBottom: expandedSessions[sessionGroup.sessionId] ? `1px solid ${theme.palette.divider}` : 'none',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s ease-in-out',
                                '&:hover': {
                                    backgroundColor: theme.palette.mode === 'dark' 
                                        ? `rgba(255, 255, 255, ${0.02 + 0.015 + 0.015 + 0.02 + 0.01})` // +1% more on hover (subtle)
                                        : `rgba(0, 0, 0, ${0.02 + 0.015 + 0.015 + 0.02 + 0.01})`, // +1% more on hover (subtle)
                                },
                            }}
                            onClick={() => handleToggleSessionExpanded(sessionGroup.sessionId)}
                        >
                            {/* Conversation Icon - represents conversation/session */}
                            <ChatBubbleOutlineOutlined
                                sx={{
                                    color: 'primary.main',
                                    mr: 1,
                                    fontSize: '1rem',
                                }}
                            />

                            {/* Session ID with full UUID display */}
                            <Box sx={{display: 'flex', alignItems: 'center', flex: 1, minWidth: 0}}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 400,
                                        color: 'text.secondary',
                                        fontSize: '0.875rem',
                                        fontFamily: 'monospace',
                                    }}
                                >
                                    Session ID: {sessionGroup.sessionId}
                                </Typography>

                                {/* Copy Button - replicating ContextNotificationItem pattern */}
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        copyToClipboard(sessionGroup.sessionId, `session-id-${sessionGroup.sessionId}`).catch(() => {})
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
                                    {isCopied(`session-id-${sessionGroup.sessionId}`) ? (
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

                            {/* Right-aligned Control Area - Natural flex alignment with 8px grid */}
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: { xs: 0.5, sm: 1 }, // Responsive gap: 4px on mobile, 8px on desktop
                                ml: 'auto',
                                pr: { xs: 0.5, sm: 1 } // Responsive padding: 4px on mobile, 8px on desktop
                            }}>
                                {/* Count Badge - Session Level (Enhanced Readability) */}
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontWeight: 500,
                                        fontSize: '0.75rem', // Increased from 0.625rem for better readability
                                        color: theme.palette.mode === 'dark' ? '#1a1a1a' : '#3e2723',
                                        backgroundColor: theme.palette.mode === 'dark' ? '#ccaa3f' : '#d7ccc8',
                                        border: theme.palette.mode === 'dark' ? 'none' : `1px solid #a1887f`,
                                        px: 0.75, // Increased padding for better balance
                                        py: 0.25, // Increased vertical padding
                                        borderRadius: 0.5, // 4px border radius
                                        minWidth: 'auto',
                                        whiteSpace: 'nowrap',
                                        lineHeight: 1.2,
                                    }}
                                >
                                    {sessionGroup.count}
                                </Typography>

                                {/* Delete Button - Session Level (Enhanced Touch Target) */}
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeleteSessionClick(sessionGroup.sessionId, sessionGroup.count)
                                    }}
                                    aria-label={`Delete session ${sessionGroup.sessionId}`}
                                    sx={{
                                        color: '#f44336',
                                        width: 28, // Increased from 24px for better touch targets
                                        height: 28,
                                        opacity: 0.8,
                                        transition: 'all 0.2s ease-in-out',
                                        '&:hover': {
                                            opacity: 1,
                                            backgroundColor: '#f44336',
                                            color: 'error.contrastText',
                                        },
                                    }}
                                >
                                    <DeleteOutline sx={{fontSize: '0.75rem'}}/>
                                </IconButton>

                                {/* Expand/Collapse Arrow - Session Level (Enhanced Visual Weight) */}
                                {expandedSessions[sessionGroup.sessionId] ? (
                                    <ExpandLess sx={{
                                        color: 'primary.main', 
                                        fontSize: '1.125rem', // Increased from 1rem for better visual balance
                                        transition: 'transform 0.2s ease-in-out',
                                        opacity: 0.9
                                    }}/>
                                ) : (
                                    <ExpandMore sx={{
                                        color: 'primary.main', 
                                        fontSize: '1.125rem', // Increased from 1rem for better visual balance
                                        transition: 'transform 0.2s ease-in-out',
                                        opacity: 0.9
                                    }}/>
                                )}
                            </Box>
                        </Box>

                        {/* Session Notifications - Collapsible */}
                        <Collapse in={expandedSessions[sessionGroup.sessionId] ?? false} timeout="auto" unmountOnExit>
                            <Box
                                sx={{
                                    backgroundColor: theme.palette.mode === 'dark' 
                                        ? `rgba(255, 255, 255, ${0.02 + 0.015 + 0.015 + 0.02})` // Match session header background
                                        : `rgba(0, 0, 0, ${0.02 + 0.015 + 0.015 + 0.02})`, // Match session header background
                                }}
                            >
                                {sessionGroup.notifications.map((notification) => (
                                    <ContextNotificationItem
                                        key={notification.id}
                                        notification={notification}
                                        onDelete={onDeleteNotification}
                                    />
                                ))}
                            </Box>
                        </Collapse>

                        {/* Divider between sessions (except for last session) */}
                        {index < sessionGroups.length - 1 && (
                            <Divider
                                sx={{
                                    mx: 2,
                                    my: 1,
                                    opacity: 0.3,
                                }}
                            />
                        )}
                    </Box>
                ))}

                {/* Session Confirmation Dialog */}
                <SessionConfirmationDialog
                    open={isConfirmDialogOpen}
                    onClose={handleDialogClose}
                    onConfirm={handleConfirmDeleteSession}
                    sessionId={pendingSessionId}
                    notificationCount={pendingSessionCount}
                />
            </Box>
        )
    },
)

NotificationSessionList.displayName = 'NotificationSessionList'