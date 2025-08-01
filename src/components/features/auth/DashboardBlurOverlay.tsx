import React, { useEffect, useRef, useState } from 'react'
import { Box, Portal, Paper, Typography, IconButton, Button } from '@mui/material'
import { Close, Login } from '@mui/icons-material'
import { useAuth } from 'react-oidc-context'

interface DashboardBlurOverlayProps {
  isActive: boolean
  blurIntensity?: number
  children?: React.ReactNode
  onBackdropClick?: () => void
}

export const DashboardBlurOverlay: React.FC<DashboardBlurOverlayProps> = ({
  isActive,
  blurIntensity = 2.03,
  children,
  onBackdropClick,
}) => {
  const dashboardRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    // Target only the dashboard content, not the modal overlay
    const dashboardElement =
      document.getElementById('dashboard-content') ||
      document.querySelector('[data-testid="dashboard-content"]')

    dashboardRef.current = dashboardElement

    if (dashboardElement) {
      if (isActive) {
        // Apply blur to dashboard content only if blurIntensity > 0
        if (blurIntensity > 0) {
          dashboardElement.style.filter = `blur(${blurIntensity}px)`
          dashboardElement.style.transition = 'filter 0.3s ease-in-out'
          dashboardElement.style.pointerEvents = 'none'
        } else {
          dashboardElement.style.filter = 'none'
          // Don't disable pointer events if no blur - let background stay fully interactive visually
        }

        // Prevent scrolling on the content
        document.body.style.overflow = 'hidden'
      } else {
        // Remove blur from dashboard content
        dashboardElement.style.filter = 'none'
        dashboardElement.style.pointerEvents = 'auto'

        // Restore scrolling
        document.body.style.overflow = 'auto'
      }
    }

    // Cleanup function
    return () => {
      if (dashboardElement) {
        dashboardElement.style.filter = 'none'
        dashboardElement.style.pointerEvents = 'auto'
        document.body.style.overflow = 'auto'
      }
    }
  }, [isActive, blurIntensity])

  // Only render overlay if active
  if (!isActive) return null

  return (
    <Portal>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'transparent',
          backdropFilter: 'none',
          zIndex: 1200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          animation: 'fadeIn 0.3s ease-out',
          '@keyframes fadeIn': {
            from: { opacity: 0 },
            to: { opacity: 1 },
          },
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget && onBackdropClick) {
            onBackdropClick()
          }
        }}
      >
        {children}
      </Box>
    </Portal>
  )
}


// Simple work-in-progress auth overlay
export interface BlurredAuthOverlayProps {
  open: boolean
  onClose: () => void
  onMinimize?: () => void
  blurIntensity?: number
}

export const BlurredUsernameSelection: React.FC<BlurredAuthOverlayProps> = ({
  open,
  onClose,
  onMinimize,
  blurIntensity = 2.03,
}) => {
  const auth = useAuth()
  const [loginError, setLoginError] = useState<string | null>(null)

  const handleLogin = async () => {
    try {
      setLoginError(null) // Clear any previous errors
      await auth.signinRedirect()
    } catch (error) {
      // Handle login errors by setting error state and logging
      const errorMessage = error instanceof Error ? error.message : 'Unknown login error'
      setLoginError(`Login failed: ${errorMessage}`)
      
      // eslint-disable-next-line no-console
      console.error('Login failed')
      
      // Error is now handled by updating component state
      // This allows UI to show error feedback and enables retry
    }
  }

  return (
    <DashboardBlurOverlay isActive={open} blurIntensity={blurIntensity} onBackdropClick={onClose}>
      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1500,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 5,
            borderRadius: 2,
            minWidth: 360,
            maxWidth: 400,
            textAlign: 'center',
            position: 'relative',
            background: 'background.paper',
            border: (theme) => 
              theme.palette.mode === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.12)'
                : '1px solid rgba(0, 0, 0, 0.12)',
          }}
        >
          {/* Close/Minimize Button */}
          {onMinimize && (
            <IconButton
              onClick={onMinimize}
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                color: 'text.secondary',
                '&:hover': {
                  color: 'error.main',
                  backgroundColor: 'action.hover',
                },
              }}
              size="small"
            >
              <Close />
            </IconButton>
          )}

          <Typography variant="h5" sx={{ mb: 4 }}>
            👋 Hey there!
          </Typography>
          
          {loginError && (
            <Typography 
              variant="body2" 
              color="error" 
              sx={{ mb: 2, p: 1, bgcolor: 'error.light', borderRadius: 1, opacity: 0.7 }}
            >
              {loginError}
            </Typography>
          )}
          
          <Button
            variant="contained"
            size="medium"
            onClick={handleLogin}
            startIcon={<Login />}
            disabled={auth.isLoading}
            sx={{
              px: 3,
              py: 1,
              fontSize: '0.95rem',
              fontWeight: 500,
              borderRadius: 2,
              textTransform: 'none',
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              boxShadow: 1,
              '&:hover': {
                backgroundColor: 'primary.dark',
                boxShadow: 2,
                transform: 'translateY(-1px)',
              },
              '&:disabled': {
                backgroundColor: 'action.disabledBackground',
                color: 'action.disabled',
                boxShadow: 'none',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {auth.isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
          
        </Paper>
      </Box>
    </DashboardBlurOverlay>
  )
}
