import { useState } from 'react'
import type { FC } from 'react'
import { Box, IconButton, Slide } from '@mui/material'
import {
  useAudioNotifications,
  useNotificationData,
  useSystemNotifications,
  useAuthStatus,
} from '@/hooks'
import {
  ConnectionStatus,
  AudioStatus,
  Menu,
  NotificationStatus,
  ThemeSwitcher,
  HelpTooltip,
  NotificationContextGroups,
  ErrorBoundary,
} from '@/components'
import { 
  UserProfile, 
  AuthGuard, 
  BlurredUsernameSelection 
} from './auth'
import type { OIDCUser } from './auth'

/**
 * The main Dashboard Component
 * Handles the primary dashboard interface with authentication state
 */
export const Dashboard: FC = () => {
  const { notifications, deleteNotification, deleteAllInContext, deleteAllNotifications } =
    useNotificationData()
  const { isAuthenticated, user } = useAuthStatus()
  const [showUsernameSelection, setShowUsernameSelection] = useState(false)
  const [isAuthMinimized, setIsAuthMinimized] = useState(false)

  // Initialize audio and system notifications
  // Note: SSE connection is established by ConnectionStatus component
  useAudioNotifications()
  useSystemNotifications()

  // Show username selection if not authenticated
  const shouldShowAuth = !isAuthenticated && !showUsernameSelection && !isAuthMinimized

  const handleAuthClose = (): void => {
    setShowUsernameSelection(false)
    setIsAuthMinimized(false)
  }

  const handleAuthMinimize = (): void => {
    setShowUsernameSelection(false)
    setIsAuthMinimized(true)
  }

  const handleAuthRestore = (): void => {
    setIsAuthMinimized(false)
    setShowUsernameSelection(true)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        position: 'relative',
      }}
    >
      {/* Main Dashboard Content */}
      <Box id="dashboard-content" data-testid="dashboard-content">
        {/* Top Navigation */}
        <Box
          sx={{
            position: 'absolute',
            top: 24,
            left: 24,
            right: 24,
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <ThemeSwitcher />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <ConnectionStatus size="medium" />
            <NotificationStatus size="medium" />
            <AudioStatus size="medium" />
            <HelpTooltip size="medium" />
            
            {/* User Profile or Auth Button */}
            {isAuthenticated && user ? (
              <UserProfile user={user as unknown as OIDCUser} />
            ) : (
              <>
                {/* Minimized Auth Button */}
            <Slide
              direction="left"
              in={isAuthMinimized && !isAuthenticated}
              timeout={{
                enter: 300,
                exit: 200,
              }}
              mountOnEnter
              unmountOnExit
            >
              <IconButton
                onClick={handleAuthRestore}
                sx={{
                  backgroundColor: 'action.hover',
                  color: 'text.secondary',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    backgroundColor: 'action.selected',
                    borderColor: 'text.disabled',
                    color: 'text.primary',
                  },
                  fontSize: '0.75rem',
                  minWidth: 60,
                  height: 32,
                  borderRadius: 1,
                  transition: 'all 0.2s ease-in-out',
                  fontWeight: 500,
                }}
                size="small"
              >
                Sign In
              </IconButton>
            </Slide>
              </>
            )}
            <Menu size="medium" />
          </Box>
        </Box>

        {/* Main Content */}
        <Box sx={{ padding: 4, paddingTop: 12 }}>
          {/* Dashboard Header */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Box
              component="h1"
              sx={{
                fontSize: '1.75rem',
                fontWeight: 400,
                color: 'text.primary',
                mb: 1,
                letterSpacing: '0.01em',
              }}
            >
              Claude Code Hooks
            </Box>
            <Box
              component="p"
              sx={{
                fontSize: '1rem',
                color: 'text.secondary',
                fontWeight: 400,
                letterSpacing: '0.02em',
              }}
            >
              Observability Dashboard
            </Box>
          </Box>

          {/* Notifications - Main Content Area that will be blurred */}
          <Box
            id="dashboard-main-content"
            data-testid="dashboard-main-content"
            sx={{ maxWidth: '1200px', mx: 'auto' }}
          >
            <AuthGuard>
              <ErrorBoundary>
                {/* Context Groups */}
                <NotificationContextGroups
                  notifications={notifications}
                  onDeleteNotification={deleteNotification}
                  onDeleteAllInContext={deleteAllInContext}
                  onPurgeAll={deleteAllNotifications}
                />
              </ErrorBoundary>
            </AuthGuard>
          </Box>
        </Box>
      </Box>

      {/* Authentication Overlay */}
      <BlurredUsernameSelection
        open={showUsernameSelection || shouldShowAuth}
        onClose={handleAuthClose}
        onMinimize={handleAuthMinimize}
        blurIntensity={2.03}
      />
    </Box>
  )
}