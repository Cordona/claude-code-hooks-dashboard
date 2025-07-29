/**
 * Purge Confirmation Dialog Component
 * Shows warning dialog for destructive purge all notifications action
 */

import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material'
import { Warning, DeleteSweep } from '@mui/icons-material'

/**
 * Props for PurgeConfirmationDialog component
 */
export interface PurgeConfirmationDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Number of notifications to be deleted */
  notificationCount: number
  /** Whether the purge operation is in progress */
  isLoading?: boolean
  /** Callback when user confirms the purge */
  onConfirm: () => void
  /** Callback when user cancels or closes the dialog */
  onCancel: () => void
}

/**
 * Confirmation dialog for purging all notifications
 * Shows clear warning about destructive and irreversible action
 */
export const PurgeConfirmationDialog: React.FC<PurgeConfirmationDialogProps> = React.memo(
  function PurgeConfirmationDialog({
    open,
    notificationCount,
    isLoading = false,
    onConfirm,
    onCancel,
  }) {
    return (
      <Dialog
        open={open}
        onClose={onCancel}
        maxWidth="sm"
        fullWidth
        aria-labelledby="purge-dialog-title"
        aria-describedby="purge-dialog-description"
      >
        <DialogTitle
          id="purge-dialog-title"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            pb: 1,
          }}
        >
          <Warning sx={{ color: 'error.main', fontSize: 24 }} />
          <Typography variant="h6" component="span">
            Purge All Notifications
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Box id="purge-dialog-description">
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                This is a destructive and irreversible action
              </Typography>
            </Alert>

            <Typography variant="body1" sx={{ mb: 2 }}>
              You are about to permanently delete{' '}
              <strong>
                {notificationCount} notification{notificationCount === 1 ? '' : 's'}
              </strong>.
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              This action cannot be undone. All notification data will be permanently removed from:
            </Typography>

            <Box component="ul" sx={{ mt: 1, mb: 2, pl: 3 }}>
              <Typography component="li" variant="body2" color="text.secondary">
                Your current session
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                Local storage
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                All notification contexts
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary">
              Are you sure you want to continue?
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onCancel} variant="outlined" disabled={isLoading} sx={{ minWidth: 100 }}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            variant="contained"
            color="error"
            disabled={isLoading}
            startIcon={<DeleteSweep />}
            sx={{ minWidth: 120 }}
          >
            {isLoading ? 'Purging...' : 'Purge All'}
          </Button>
        </DialogActions>
      </Dialog>
    )
  },
)
