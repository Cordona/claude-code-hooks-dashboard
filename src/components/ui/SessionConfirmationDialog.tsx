import React from 'react'
import {Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, useTheme} from '@mui/material'

interface SessionConfirmationDialogProps {
    open: boolean
    onClose: () => void
    onConfirm: () => void
    sessionId: string
    notificationCount: number
    isLoading?: boolean
}

/**
 * Confirmation dialog for session deletion
 * Based on the existing ConfirmationDialog pattern but specialized for sessions
 */
export const SessionConfirmationDialog: React.FC<SessionConfirmationDialogProps> = React.memo(
    ({
        open,
        onClose,
        onConfirm,
        sessionId,
        notificationCount,
        isLoading = false,
    }) => {
        const theme = useTheme()

        const handleConfirm = (): void => {
            onConfirm()
            onClose()
        }

        const handleKeyDown = (event: React.KeyboardEvent): void => {
            if (event.key === 'Enter' && !isLoading) {
                event.preventDefault()
                handleConfirm()
            }
        }

        return (
            <Dialog
                open={open}
                onClose={onClose}
                onKeyDown={handleKeyDown}
                maxWidth="sm"
                fullWidth={false}
                aria-labelledby="session-confirmation-dialog-title"
                aria-describedby="session-confirmation-dialog-description"
                sx={{
                    '& .MuiDialog-paper': {
                        borderRadius: 2,
                        boxShadow: theme.shadows[8],
                        backgroundColor: 'background.paper',
                        border: `1px solid ${theme.palette.divider}`,
                        minWidth: 400,
                        maxWidth: 480,
                        backgroundImage: 'none',
                    },
                    '& .MuiBackdrop-root': {
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(2px)',
                    },
                }}
            >
                <DialogTitle
                    id="session-confirmation-dialog-title"
                    sx={{
                        pb: 2,
                        pt: 1,
                        fontWeight: 500,
                        fontSize: '1.125rem',
                        color: 'text.primary',
                        fontFamily: theme.typography.fontFamily,
                    }}
                >
                    Delete Session Notifications
                </DialogTitle>

                <DialogContent
                    sx={{
                        pb: 3,
                        pt: 1,
                    }}
                >
                    <Typography
                        id="session-confirmation-dialog-description"
                        variant="body2"
                        sx={{
                            color: 'text.secondary',
                            lineHeight: 1.5,
                            fontFamily: theme.typography.fontFamily,
                        }}
                    >
                        This will permanently delete all{' '}
                        <Box
                            component="span"
                            sx={{
                                fontWeight: 600,
                                color: 'text.primary',
                            }}
                        >
                            {notificationCount}
                        </Box>
                        {' '}notification{notificationCount !== 1 ? 's' : ''} for Session ID:{' '}
                        <Box
                            component="span"
                            sx={{
                                fontFamily: 'monospace',
                                fontSize: '0.875rem',
                                color: 'primary.main',
                                fontWeight: 500,
                                wordBreak: 'break-all',
                            }}
                        >
                            {sessionId}
                        </Box>
                        .
                    </Typography>
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        pb: 3,
                        pt: 2,
                        gap: 1.5,
                        justifyContent: 'flex-end',
                    }}
                >
                    <Button
                        onClick={onClose}
                        disabled={isLoading}
                        variant="outlined"
                        size="medium"
                        sx={{
                            color: 'text.secondary',
                            borderColor: 'divider',
                            backgroundColor: 'transparent',
                            fontFamily: theme.typography.fontFamily,
                            '&:hover': {
                                backgroundColor: 'action.hover',
                                borderColor: 'text.secondary',
                                color: 'text.primary',
                            },
                        }}
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        variant="contained"
                        size="medium"
                        sx={{
                            backgroundColor: '#f44336',
                            color: '#ffffff',
                            fontFamily: theme.typography.fontFamily,
                            '&:hover': {
                                backgroundColor: '#d32f2f',
                            },
                            '&:disabled': {
                                backgroundColor: 'rgba(244, 67, 54, 0.3)',
                                color: 'action.disabled',
                            },
                        }}
                    >
                        {isLoading ? 'Deleting...' : 'Delete All'}
                    </Button>
                </DialogActions>
            </Dialog>
        )
    },
)

SessionConfirmationDialog.displayName = 'SessionConfirmationDialog'