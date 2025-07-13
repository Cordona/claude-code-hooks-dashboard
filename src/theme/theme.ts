import type { ThemeOptions } from '@mui/material/styles'
import { createTheme } from '@mui/material/styles'

// Status colors used across both themes
const statusColors = {
  connected: '#4caf50', // 🟢 Service connected
  disconnected: '#f44336', // 🔴 Service disconnected
  enabled: '#2196f3', // 🔵 Notifications enabled
  disabled: '#ff9800', // 🟡 Notifications disabled
}

// Base theme configuration
const baseThemeOptions: ThemeOptions = {
  typography: {
    fontFamily: '"Fira Code", "JetBrains Mono", "SF Mono", "Monaco", "Consolas", monospace',
    h4: {
      fontSize: '1.5rem',
      fontWeight: 400,
      letterSpacing: '0.01em',
    },
    subtitle1: {
      fontSize: '0.8125rem',
      fontWeight: 400,
      letterSpacing: '0.02em',
    },
    h6: {
      fontSize: '0.9375rem',
      fontWeight: 500,
      letterSpacing: '0.01em',
    },
    body1: {
      fontSize: '0.8125rem',
      fontWeight: 400,
      letterSpacing: '0.01em',
    },
    body2: {
      fontSize: '0.75rem',
      fontWeight: 400,
      letterSpacing: '0.02em',
    },
    caption: {
      fontSize: '0.6875rem',
      fontWeight: 400,
      letterSpacing: '0.02em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      letterSpacing: '0.01em',
      fontSize: '0.8125rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '6px 12px',
          fontWeight: 500,
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          borderCollapse: 'separate',
          borderSpacing: 0,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid',
          padding: '12px 16px',
        },
      },
    },
  },
}

// Light theme
export const lightTheme = createTheme({
  ...baseThemeOptions,
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
      light: '#60a5fa',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    background: {
      default: '#d0d0d0',
      paper: '#d6d6d6',
    },
    text: {
      primary: '#785f46',
      secondary: '#8d6b44',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
    action: {
      hover: 'rgba(0, 0, 0, 0.08)',
      selected: 'rgba(0, 0, 0, 0.16)',
    },
    ...statusColors,
  },
  components: {
    ...baseThemeOptions.components,
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
          backgroundColor: '#d6d6d6',
          border: '1px solid rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(0, 0, 0, 0.16)',
          padding: '12px 16px',
        },
      },
    },
  },
})

// Dark theme
export const darkTheme = createTheme({
  ...baseThemeOptions,
  palette: {
    mode: 'dark',
    primary: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0a0a0a',
      paper: '#111111',
    },
    text: {
      primary: '#fafafa',
      secondary: '#a3a3a3',
    },
    divider: 'rgba(255, 255, 255, 0.06)',
    action: {
      hover: 'rgba(255, 255, 255, 0.04)',
      selected: 'rgba(255, 255, 255, 0.08)',
    },
    ...statusColors,
  },
  components: {
    ...baseThemeOptions.components,
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
          backgroundColor: '#111111',
          border: '1px solid rgba(255, 255, 255, 0.04)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          padding: '12px 16px',
        },
      },
    },
  },
})

// Export for backwards compatibility
export const theme = lightTheme
