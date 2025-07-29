import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from 'react-oidc-context'
import { ThemeProvider, HelpProvider } from '@/contexts'
import { oidcConfig } from '@/config/oidc'
import { useTheme } from '@/hooks'
import {
  Dashboard,
  AuthCallback,
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
      <Router>
        <AuthProvider {...oidcConfig}>
          <HelpProvider>
            <ThemeProvider>
              <AppRoutes />
              <ReactQueryDevtools initialIsOpen={false} />
            </ThemeProvider>
          </HelpProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  )
}

function AppRoutes() {
  const { currentTheme } = useTheme()

  return (
    <MuiThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Routes>
        {/* Public Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* OIDC Authentication Callback */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </MuiThemeProvider>
  )
}

export default App
