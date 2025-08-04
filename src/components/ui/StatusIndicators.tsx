import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { Box, useTheme, Typography } from '@mui/material'
import { useSSEConnect, useAuthStatus, useUserInitialization, useSystemNotifications, useAudioNotifications } from '@/hooks'

interface StatusIndicatorsProps {
  size?: 'small' | 'medium' | 'large'
}

// Simple component that renders a dot + label without any hooks
interface StaticStatusProps {
  color: string
  label: string
  dotSize: number
  showLabel?: boolean
  shouldPulse?: boolean
}

const StaticStatus: React.FC<StaticStatusProps> = ({ color, label, dotSize, showLabel = false, shouldPulse = false }) => {
  const theme = useTheme()
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: theme.spacing(1) }}>
      <Box
        sx={{
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          backgroundColor: color,
          opacity: shouldPulse ? 0.7 : 0.9,
          transition: 'all 0.2s ease-in-out',
          animation: shouldPulse ? 'pulse 2s infinite' : 'none',
          boxShadow: `0 0 0 1px ${color}20`,
          '@keyframes pulse': {
            '0%': {
              opacity: 0.7,
              transform: 'scale(1)',
              boxShadow: `0 0 0 1px ${color}20`,
            },
            '50%': {
              opacity: 1,
              transform: 'scale(1.2)',
              boxShadow: `0 0 0 2px ${color}30`,
            },
            '100%': {
              opacity: 0.7,
              transform: 'scale(1)',
              boxShadow: `0 0 0 1px ${color}20`,
            },
          },
        }}
      />
      {showLabel && (
        <Typography variant="body2" sx={{ 
          color: theme.palette.text.secondary, 
          fontSize: '0.8125rem',
          whiteSpace: 'nowrap'
        }}>
          {label}
        </Typography>
      )}
    </Box>
  )
}

export const StatusIndicators: React.FC<StatusIndicatorsProps> = React.memo(
  ({ size = 'medium' }) => {
    const theme = useTheme()
    const [isExpanded, setIsExpanded] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // Call all hooks ONCE at the top level - this is the single source of truth
    const { isAuthenticated, user } = useAuthStatus()
    const { userInitialized, initializingUser, initializationError } = useUserInitialization({
      isAuthenticated,
      accessToken: user?.access_token,
    })
    const { isConnected, isConnecting } = useSSEConnect({
      isAuthenticated,
      userInitialized,
      accessToken: user?.access_token,
    })
    const { state: notificationState } = useSystemNotifications()
    const { isSupported: notifSupported, isEnabled: notifEnabled, isRequesting: notifRequesting, permission } = notificationState
    const { isEnabled: audioEnabled, isSupported: audioSupported, isInitialized: audioInitialized } = useAudioNotifications()

    // Calculate dot sizes: 50% bigger when minimized, normal when expanded
    const baseDotSize = useMemo(() => {
      switch (size) {
        case 'small':
          return 6
        case 'medium':
          return 6
        case 'large':
          return 8
        default:
          return 6
      }
    }, [size])

    const handleMouseEnter = useCallback(() => setIsHovered(true), [])
    const handleMouseLeave = useCallback(() => {
      setIsHovered(false)
      // Auto-collapse when mouse leaves if expanded via click
      setIsExpanded(false)
    }, [])
    
    const handleClick = useCallback(() => setIsExpanded(prev => !prev), [])
    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        setIsExpanded(prev => !prev)
      }
    }, [])

    // Click outside detection
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsExpanded(false)
        }
      }

      if (isExpanded) {
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
      }
      
      return undefined
    }, [isExpanded])

    const shouldShowLabels = isExpanded || isHovered
    
    const minimizedDotSize = Math.round(baseDotSize * 1.5) // 50% bigger
    const expandedDotSize = baseDotSize

    // Calculate visual data from the single source of truth
    const getConnectionStatus = () => {
      const isDark = theme.palette.mode === 'dark'
      const statusColors = {
        dormant: isDark ? '#6b7280' : '#9ca3af',
        initializing: isDark ? '#fbbf24' : '#f59e0b', 
        error: isDark ? '#f87171' : '#ef4444',
        connecting: isDark ? '#60a5fa' : '#3b82f6',
        connected: isDark ? '#4ade80' : '#10b981',
        disconnected: isDark ? '#f87171' : '#ef4444'
      }
      
      if (!isAuthenticated) return { color: statusColors.dormant, label: 'Service dormant' }
      if (initializingUser) return { color: statusColors.initializing, label: 'Service initializing' }
      if (initializationError) return { color: statusColors.error, label: 'Connection failed' }
      if (isConnecting) return { color: statusColors.connecting, label: 'Service connecting' }
      if (isConnected) return { color: statusColors.connected, label: 'Connected to service' }
      return { color: statusColors.disconnected, label: 'Service disconnected' }
    }

    const getNotificationStatus = () => {
      const isDark = theme.palette.mode === 'dark'
      if (!notifSupported) return { color: isDark ? '#f87171' : '#ef4444', label: 'Notifications not supported' }
      if (notifRequesting) return { color: isDark ? '#fbbf24' : '#f59e0b', label: 'Requesting permission' }
      if (notifEnabled) return { color: isDark ? '#60a5fa' : '#3b82f6', label: 'Notifications on' }
      if (permission === 'denied') return { color: isDark ? '#f87171' : '#ef4444', label: 'Notifications blocked' }
      return { color: isDark ? '#fbbf24' : '#f59e0b', label: 'Notifications off' }
    }

    const getAudioStatus = () => {
      const isDark = theme.palette.mode === 'dark'
      if (audioSupported && audioEnabled && audioInitialized) {
        return { color: isDark ? '#a78bfa' : '#8b5cf6', label: 'Sound on' }
      }
      if (audioSupported && audioEnabled && !audioInitialized) {
        return { color: isDark ? '#fbbf24' : '#f59e0b', label: 'Sound waiting' }
      }
      return { color: isDark ? '#6b7280' : '#9ca3af', label: 'Sound off' }
    }

    const connectionStatus = getConnectionStatus()
    const notificationStatus = getNotificationStatus()
    const audioStatus = getAudioStatus()

    return (
      <Box
        ref={containerRef}
        sx={{
          position: 'relative',
          display: 'inline-block',
        }}
      >
        {/* Always visible dots */}
        <Box
          component="button"
          tabIndex={0}
          aria-label={`Status indicators - ${isExpanded ? 'expanded' : 'collapsed'}`}
          aria-expanded={isExpanded}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing(2),
            py: theme.spacing(0.5),
            px: theme.spacing(0.5),
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            borderRadius: 1,
            transition: 'all 0.2s ease-in-out',
            '&:focus': {
              outline: `2px solid ${theme.palette.primary.main}`,
              outlineOffset: 2,
            },
            '&:focus-visible': {
              outline: `2px solid ${theme.palette.primary.main}`,
              outlineOffset: 2,
            },
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          }}
        >
          <StaticStatus 
            color={connectionStatus.color} 
            label={connectionStatus.label}
            dotSize={minimizedDotSize}
            shouldPulse={isAuthenticated && (isConnecting || initializingUser)}
          />
          <StaticStatus 
            color={notificationStatus.color} 
            label={notificationStatus.label}
            dotSize={minimizedDotSize}
            shouldPulse={!notifEnabled && notifSupported && permission !== 'denied'}
          />
          <StaticStatus 
            color={audioStatus.color} 
            label={audioStatus.label}
            dotSize={minimizedDotSize}
            shouldPulse={audioSupported && audioEnabled && !audioInitialized}
          />
        </Box>

        {/* Floating dropdown */}
        {shouldShowLabels && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: '100%',
              mr: theme.spacing(1),
              py: theme.spacing(1),
              px: theme.spacing(1.5),
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
              zIndex: 1000,
              minWidth: 200,
              display: 'flex',
              flexDirection: 'column',
              gap: theme.spacing(1),
            }}
          >
            <StaticStatus 
              color={connectionStatus.color} 
              label={connectionStatus.label}
              dotSize={expandedDotSize}
              showLabel={true}
            />
            <StaticStatus 
              color={notificationStatus.color} 
              label={notificationStatus.label}
              dotSize={expandedDotSize}
              showLabel={true}
            />
            <StaticStatus 
              color={audioStatus.color} 
              label={audioStatus.label}
              dotSize={expandedDotSize}
              showLabel={true}
            />
          </Box>
        )}
      </Box>
    )
  },
)

StatusIndicators.displayName = 'StatusIndicators'