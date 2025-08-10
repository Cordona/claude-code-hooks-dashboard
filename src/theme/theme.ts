import type {ThemeOptions} from '@mui/material/styles'
import {createTheme} from '@mui/material/styles'

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

// Light theme - High contrast and readable
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
            default: '#f8f9fa',
            paper: '#ffffff',
        },
        text: {
            primary: '#1a1a1a',
            secondary: '#4a5568',
        },
        divider: 'rgba(0, 0, 0, 0.16)',
        action: {
            hover: 'rgba(0, 0, 0, 0.04)',
            selected: 'rgba(0, 0, 0, 0.08)',
            disabled: 'rgba(0, 0, 0, 0.26)',
            disabledBackground: 'rgba(0, 0, 0, 0.12)',
        },
        ...statusColors,
    },
    components: {
        ...baseThemeOptions.components,
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(0, 0, 0, 0.12)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundColor: '#ffffff',
                    backgroundImage: 'none',
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
        MuiDialog: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#ffffff',
                    backgroundImage: 'none',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        backgroundColor: '#ffffff',
                        '& fieldset': {
                            borderColor: 'rgba(0, 0, 0, 0.23)',
                        },
                        '&:hover fieldset': {
                            borderColor: 'rgba(0, 0, 0, 0.4)',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#2563eb',
                        },
                    },
                },
            },
        },
    },
})

// Dark theme - Claude Code inspired
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
            default: '#1a1a1a',
            paper: '#2d2d2d',
        },
        text: {
            primary: '#fafafa',
            secondary: '#9ca3af',
        },
        divider: 'rgba(255, 255, 255, 0.08)',
        action: {
            hover: 'rgba(255, 255, 255, 0.06)',
            selected: 'rgba(255, 255, 255, 0.12)',
            disabled: 'rgba(255, 255, 255, 0.26)',
            disabledBackground: 'rgba(255, 255, 255, 0.12)',
        },
        ...statusColors,
    },
    components: {
        ...baseThemeOptions.components,
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
                    backgroundColor: '#2d2d2d',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundColor: '#2d2d2d',
                    backgroundImage: 'none',
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '12px 16px',
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#2d2d2d',
                    backgroundImage: 'none',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.12)',
                        },
                        '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.16)',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#3b82f6',
                        },
                    },
                },
            },
        },
    },
})

// Export for backwards compatibility
export const theme = lightTheme
