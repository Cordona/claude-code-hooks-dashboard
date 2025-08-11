/**
 * Purge Confirmation Dialog Component
 * Enhanced dialog with manual confirmation step for purging all notifications
 */

import React, {useCallback, useState} from 'react'
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    InputAdornment,
    TextField,
    Typography,
    useTheme
} from '@mui/material'
import {DeleteSweep} from '@mui/icons-material'
import type {ProjectGroup} from '@/types'

/**
 * Props for PurgeConfirmationDialog component
 */
export interface PurgeConfirmationDialogProps {
    /** Whether the dialog is open */
    open: boolean
    /** Project groups to be deleted */
    projectGroups: ProjectGroup[]
    /** Whether the purge operation is in progress */
    isLoading?: boolean
    /** Callback when user confirms the purge */
    onConfirm: () => void
    /** Callback when user cancels or closes the dialog */
    onCancel: () => void
}

/**
 * Enhanced confirmation dialog for purging all notifications
 * Includes manual confirmation step and improved visual design
 */
export const PurgeConfirmationDialog: React.FC<PurgeConfirmationDialogProps> = React.memo(
    function PurgeConfirmationDialog({
                                         open,
                                         projectGroups,
                                         isLoading = false,
                                         onConfirm,
                                         onCancel,
                                     }) {
        const theme = useTheme()
        const [confirmationText, setConfirmationText] = useState('')

        // Calculate totals
        const totalNotifications = projectGroups.reduce((sum, group) => sum + group.count, 0)
        const totalContexts = projectGroups.length

        // Check if user has typed the correct confirmation
        const isConfirmationValid = confirmationText.toLowerCase() === 'purge all'
        const hasInput = confirmationText.trim().length > 0
        const showInvalid = hasInput && !isConfirmationValid

        // Handle input change
        const handleConfirmationChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
            setConfirmationText(event.target.value)
        }, [])

        // Handle confirm with validation
        const handleConfirm = useCallback(() => {
            if (isConfirmationValid && !isLoading) {
                onConfirm()
                setConfirmationText('') // Reset for next time
            }
        }, [isConfirmationValid, isLoading, onConfirm])

        // Handle cancel/close
        const handleCancel = useCallback(() => {
            setConfirmationText('') // Reset text
            onCancel()
        }, [onCancel])

        // Handle key press in input
        const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
            if (event.key === 'Enter' && isConfirmationValid && !isLoading) {
                event.preventDefault()
                handleConfirm()
            }
        }, [isConfirmationValid, isLoading, handleConfirm])

        // Get input end adornment based on validation state
        const getInputEndAdornment = useCallback(() => {
            if (isConfirmationValid) {
                return (
                    <InputAdornment position="end">
                        <Box sx={{color: '#4caf50', fontSize: 16}}>✓</Box>
                    </InputAdornment>
                )
            }

            if (showInvalid) {
                return (
                    <InputAdornment position="end">
                        <Box sx={{color: '#f44336', fontSize: 16}}>✗</Box>
                    </InputAdornment>
                )
            }

            return null
        }, [isConfirmationValid, showInvalid])

        return (
            <Dialog
                open={open}
                onClose={handleCancel}
                maxWidth="sm"
                fullWidth={false}
                aria-labelledby="purge-dialog-title"
                aria-describedby="purge-dialog-description"
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
                    id="purge-dialog-title"
                    sx={{
                        pb: 2,
                        fontWeight: 500,
                        fontSize: '1.125rem',
                        color: 'text.primary',
                        fontFamily: theme.typography.fontFamily,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                    }}
                >
                    <Box
                        sx={{
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 24,
                            height: 24,
                            backgroundColor: '#ffc107',
                            transform: 'rotate(45deg)',
                            mr: 1,
                            '&::after': {
                                content: '"!"',
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%) rotate(-45deg)',
                                color: '#000000',
                                fontSize: '18px',
                                fontWeight: '900',
                                lineHeight: 1,
                                textShadow: '0 0 2px rgba(255, 255, 255, 0.8)',
                            },
                        }}
                    />
                    Purge All Notifications
                </DialogTitle>

                <DialogContent
                    sx={{
                        pb: 3,
                        pt: 2,
                    }}
                >
                    <Box id="purge-dialog-description">
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'text.secondary',
                                lineHeight: 1.5,
                                fontFamily: theme.typography.fontFamily,
                                mb: 2,
                            }}
                        >
                            You are about to permanently purge{' '}
                            <Box
                                component="span"
                                sx={{
                                    color: 'text.primary',
                                    fontWeight: 600,
                                }}
                            >
                                {totalNotifications} notification{totalNotifications === 1 ? '' : 's'}
                            </Box>
                            {' '}for{' '}
                            <Box
                                component="span"
                                sx={{
                                    color: 'text.primary',
                                    fontWeight: 600,
                                }}
                            >
                                {totalContexts} context{totalContexts === 1 ? '' : 's'}
                            </Box>
                            .
                        </Typography>

                        {projectGroups.length > 0 && (
                            <Box sx={{mb: 4, mt: 3}}>
                                {projectGroups.map((group) => (
                                    <Typography
                                        key={group.contextKey}
                                        variant="body2"
                                        sx={{
                                            color: 'primary.main',
                                            fontWeight: 500,
                                            fontFamily: theme.typography.fontFamily,
                                            mb: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            '&:before': {
                                                content: '"•"',
                                                color: 'text.disabled',
                                                marginRight: 1.5,
                                                fontSize: '1.2em',
                                            },
                                        }}
                                    >
                                        {group.contextName} ({group.count})
                                    </Typography>
                                ))}
                            </Box>
                        )}

                        <Typography
                            variant="body2"
                            sx={{
                                color: 'text.secondary',
                                fontFamily: theme.typography.fontFamily,
                                mb: 2,
                            }}
                        >
                            Type <strong>Purge all</strong> to confirm:
                        </Typography>

                        <TextField
                            fullWidth
                            size="small"
                            value={confirmationText}
                            onChange={handleConfirmationChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Purge all"
                            disabled={isLoading}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: 'background.default',
                                    fontFamily: 'monospace',
                                    fontSize: '0.875rem',
                                },
                            }}
                            InputProps={{
                                endAdornment: getInputEndAdornment(),
                            }}
                        />
                    </Box>
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        pb: 3,
                        pt: 1,
                        gap: 1.5,
                        justifyContent: 'flex-end',
                    }}
                >
                    <Button
                        onClick={handleCancel}
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
                        disabled={!isConfirmationValid || isLoading}
                        variant="contained"
                        size="medium"
                        startIcon={<DeleteSweep/>}
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
                        {isLoading ? 'Purging...' : 'Purge All'}
                    </Button>
                </DialogActions>
            </Dialog>
        )
    },
)
