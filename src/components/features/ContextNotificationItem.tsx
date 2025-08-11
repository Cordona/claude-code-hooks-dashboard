import React, {useActionState, useCallback, useState} from 'react'
import {Box, Collapse, IconButton, Typography, useMediaQuery, useTheme} from '@mui/material'
import {Check, Close, ContentCopy, ReplyOutlined, ExpandLess, ExpandMore} from '@mui/icons-material'
import {useClipboard} from '@/hooks/useClipboard'
import type {NotificationData} from '@/types'

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
    ({notification, onDelete}) => {
        const theme = useTheme()
        const isMobile = useMediaQuery(theme.breakpoints.down('md'))
        const [isExpanded, setIsExpanded] = useState(false)
        const {copyToClipboard, isCopied} = useClipboard()


        /**
         * Action for deleting notification using React 19 Actions API
         */
        const [deleteState, deleteAction] = useActionState(
            async (_prevState: { isDeleting: boolean }, formData: FormData) => {
                const id = formData.get('notificationId') as string
                if (id) {
                    onDelete(id)
                }
                return {isDeleting: false}
            },
            {isDeleting: false},
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

        /**
         * Render detail field with consistent styling
         */
        const renderDetailField = useCallback((label: string, value: string, options?: {
            monospace?: boolean
            color?: string
            transform?: 'uppercase' | 'none'
            minWidth?: string
        }) => (
            <Box sx={{mb: 1}}>
                <Typography
                    variant="caption"
                    sx={{
                        fontWeight: 600,
                        color: 'text.secondary',
                        display: 'inline-block',
                        minWidth: options?.minWidth || '80px',
                    }}
                >
                    {label}:
                </Typography>
                <Typography
                    variant="body2"
                    sx={{
                        fontFamily: options?.monospace !== false ? 'monospace' : 'inherit',
                        fontSize: '0.75rem',
                        color: options?.color || 'text.secondary',
                        ml: 1,
                        display: 'inline',
                        textTransform: options?.transform || 'none',
                        letterSpacing: options?.transform === 'uppercase' ? '0.025em' : 'normal',
                        wordBreak: 'break-all',
                    }}
                >
                    {value}
                </Typography>
            </Box>
        ), [])

        return (
            <Box>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        py: 1.5,
                        px: 2,
                        borderBottom: hasAdditionalDetails && isExpanded ? 'none' : `1px solid ${theme.palette.divider}`,
                        cursor: hasAdditionalDetails ? 'pointer' : 'default',
                        '&:hover': {
                            backgroundColor: 'action.hover',
                        },
                        '&:hover .delete-button': {
                            opacity: 1,
                        },
                    }}
                    onClick={hasAdditionalDetails ? handleToggleExpanded : undefined}
                >
                    {/* Reply Icon - Better represents Claude responses */}
                    <ReplyOutlined
                        sx={{
                            color: 'primary.main',
                            fontSize: '1rem',
                            mr: { xs: 1, sm: 1.5 }, // Responsive margin: tighter on mobile
                            opacity: 0.9
                        }}
                    />

                    {/* Message - Takes up remaining space */}
                    <Box sx={{flex: 1, minWidth: 0}}>
                        <Typography
                            variant="body1"
                            sx={{
                                fontWeight: 500,
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

                    {/* Consolidated Timestamp - Right-aligned */}
                    {!isMobile && (
                        <Typography
                            variant="body2"
                            sx={{
                                fontFamily: 'monospace',
                                fontSize: { xs: '0.75rem', sm: '0.875rem' }, // Responsive font size
                                fontWeight: 600,
                                color: 'text.secondary',
                                minWidth: { xs: '120px', sm: '140px' }, // Responsive width
                                textAlign: 'right',
                                mr: { xs: 0.5, sm: 1 }, // Responsive margin
                                textShadow:
                                    theme.palette.mode === 'light'
                                        ? '0 1px 2px rgba(0, 0, 0, 0.1)'
                                        : '0 1px 2px rgba(0, 0, 0, 0.3)',
                            }}
                        >
                            {notification.displayDate} {notification.displayTime}
                        </Typography>
                    )}

                    {/* Delete Button - Positioned before expand button for consistency */}
                    <Box component="form" action={deleteAction} sx={{display: 'inline'}}>
                        <input type="hidden" name="notificationId" value={notification.id}/>
                        <IconButton
                            type="submit"
                            size="small"
                            className="delete-button"
                            disabled={deleteState.isDeleting}
                            aria-label={`Delete notification: ${notification.message}`}
                            onClick={(e) => e.stopPropagation()}
                            sx={{
                                opacity: 0,
                                transition: 'all 0.2s ease-in-out',
                                color: '#f44336',
                                width: 20, // Smallest in hierarchy: 32px→28px→24px→20px
                                height: 20,
                                ml: 0.5,
                                '&:hover': {
                                    opacity: 1,
                                    backgroundColor: '#f44336',
                                    color: 'error.contrastText',
                                },
                            }}
                        >
                            <Close sx={{fontSize: '0.625rem'}}/> {/* Tiny icon */}
                        </IconButton>
                    </Box>

                    {/* Expand Button - Only show if there are additional details */}
                    {hasAdditionalDetails && (
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation()
                                handleToggleExpanded()
                            }}
                            aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                            sx={{
                                color: 'primary.main',
                                ml: 0.5,
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    backgroundColor: 'action.hover',
                                    color: 'primary.dark',
                                },
                            }}
                        >
                            {isExpanded ? <ExpandLess fontSize="small"/> : <ExpandMore fontSize="small"/>}
                        </IconButton>
                    )}
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
                            {notification.hookType && renderDetailField(
                                'Hook type', 
                                notification.hookType, 
                                { color: 'primary.main', transform: 'uppercase' }
                            )}

                            {/* Event ID - With copy functionality matching debug menu style */}
                            <Box sx={{mb: 1}}>
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
                                <Box sx={{display: 'inline-flex', alignItems: 'center'}}>
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
                                            copyToClipboard(notification.id, `event-id-${notification.id}`).catch(() => {})
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
                                        {isCopied(`event-id-${notification.id}`) ? (
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
                            {notification.eventType && renderDetailField(
                                'Type', 
                                notification.eventType, 
                                { color: 'primary.main' }
                            )}

                            {/* Source */}
                            {notification.source && renderDetailField('Source', notification.source)}

                            {/* Context Work Directory */}
                            {notification.projectContext && renderDetailField(
                                'Context work directory', 
                                notification.projectContext, 
                                { minWidth: '120px' }
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
