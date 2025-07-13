import React, { Component } from 'react'
import type { ReactNode } from 'react'
import { Box, Typography, Button, Alert } from '@mui/material'
import { Refresh } from '@mui/icons-material'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * React Error Boundary component for graceful error handling
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    })

    // Report error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // In production, this would report to error tracking service
      // eslint-disable-next-line no-console
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    } else {
      // In development, log detailed error information
      // eslint-disable-next-line no-console
      console.group('🚨 ErrorBoundary caught an error')
      // eslint-disable-next-line no-console
      console.error('Error:', error)
      // eslint-disable-next-line no-console
      console.error('Error Info:', errorInfo)
      // eslint-disable-next-line no-console
      console.error('Component Stack:', errorInfo.componentStack)
      // eslint-disable-next-line no-console
      console.groupEnd()
    }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false })
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 200,
            p: 3,
            textAlign: 'center',
          }}
        >
          <Alert severity="error" sx={{ mb: 3, width: '100%', maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {this.state.error?.message ?? 'An unexpected error occurred'}
            </Typography>
          </Alert>

          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={this.handleRetry}
            sx={{ mt: 2 }}
          >
            Try Again
          </Button>

          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <Box
              component="details"
              sx={{
                mt: 3,
                p: 2,
                bgcolor: 'grey.100',
                borderRadius: 1,
                width: '100%',
                maxWidth: 800,
                overflow: 'auto',
              }}
            >
              <Typography
                component="summary"
                variant="body2"
                sx={{ cursor: 'pointer', fontWeight: 600 }}
              >
                Error Details (Development Only)
              </Typography>
              <Typography
                component="pre"
                variant="caption"
                sx={{
                  mt: 1,
                  fontSize: '0.75rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {this.state.error?.stack}
                {'\n\nComponent Stack:'}
                {this.state.errorInfo.componentStack}
              </Typography>
            </Box>
          )}
        </Box>
      )
    }

    return this.props.children
  }
}
