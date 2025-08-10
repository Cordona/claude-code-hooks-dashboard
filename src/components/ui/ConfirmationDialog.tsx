import React from 'react'
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, useTheme,} from '@mui/material'

interface ConfirmationDialogProps {
    open: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message?: string
    children?: React.ReactNode
    confirmText?: string
    cancelText?: string
    isDestructive?: boolean
    isLoading?: boolean
}

/**
 * Clean, minimalistic confirmation dialog component
 * Follows theme aesthetic with card-like styling and proper accessibility
 */
export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = React.memo(
    ({
         open,
         onClose,
         onConfirm,
         title,
         message,
         children,
         confirmText = 'Confirm',
         cancelText = 'Cancel',
         isDestructive = false,
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
                aria-labelledby="confirmation-dialog-title"
                aria-describedby="confirmation-dialog-description"
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
                    id="confirmation-dialog-title"
                    sx={{
                        pb: 2,
                        pt: 1,
                        fontWeight: 500,
                        fontSize: '1.125rem',
                        color: 'text.primary',
                        fontFamily: theme.typography.fontFamily,
                    }}
                >
                    {title}
                </DialogTitle>

                <DialogContent
                    sx={{
                        pb: 3,
                        pt: 1,
                    }}
                >
                    {children || (
                        <Typography
                            id="confirmation-dialog-description"
                            variant="body2"
                            sx={{
                                color: 'text.secondary',
                                lineHeight: 1.5,
                                fontFamily: theme.typography.fontFamily,
                            }}
                        >
                            {message}
                        </Typography>
                    )}
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
                        {cancelText}
                    </Button>

                    <Button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        variant="contained"
                        size="medium"
                        sx={{
                            backgroundColor: isDestructive ? '#f44336' : 'primary.main',
                            color: '#ffffff',
                            fontFamily: theme.typography.fontFamily,
                            '&:hover': {
                                backgroundColor: isDestructive ? '#d32f2f' : 'primary.dark',
                            },
                            '&:disabled': {
                                backgroundColor: isDestructive
                                    ? 'rgba(244, 67, 54, 0.3)'
                                    : 'action.disabledBackground',
                                color: 'action.disabled',
                            },
                        }}
                    >
                        {isLoading ? 'Processing...' : confirmText}
                    </Button>
                </DialogActions>
            </Dialog>
        )
    },
)

ConfirmationDialog.displayName = 'ConfirmationDialog'
