import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { Box, CssBaseline } from '@mui/material'
import { ThemeProvider, HelpProvider } from '@/contexts'
import {
  useTheme,
  useAudioNotifications,
  useNotificationData,
  useSystemNotifications,
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelpProvider>
        <ThemeProvider>
          <AppContent />
          <ReactQueryDevtools initialIsOpen={false} />
        </ThemeProvider>
      </HelpProvider>
    </QueryClientProvider>
  )
}

function AppContent() {
  const { currentTheme } = useTheme()
  const { notifications, deleteNotification, deleteAllInContext } = useNotificationData()

  // Initialize audio and system notifications
  // Note: SSE connection is handled by ConnectionStatus component
  useAudioNotifications()
  useSystemNotifications()

  return (
    <MuiThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: 'background.default',
          position: 'relative',
        }}
      >
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
          <ThemeSwitcher />
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <ConnectionStatus size="medium" />
            <NotificationStatus size="medium" />
            <AudioStatus size="medium" />
            <HelpTooltip size="medium" />
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

          {/* Notifications */}
          <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
            <ErrorBoundary>
              {/* Context Groups */}
              <NotificationContextGroups
                notifications={notifications}
                onDeleteNotification={deleteNotification}
                onDeleteAllInContext={deleteAllInContext}
              />
            </ErrorBoundary>
          </Box>
        </Box>
      </Box>
    </MuiThemeProvider>
  )
}

export default App
