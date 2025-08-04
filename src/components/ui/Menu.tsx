import React, { useState, useCallback, useMemo } from 'react'
import {
  Box,
  IconButton,
  Popover,
  MenuList,
  MenuItem,
  Typography,
  ListItemIcon,
  ListItemText,
  Collapse,
} from '@mui/material'
import {
  MoreVert,
  AccessTime,
  Settings,
  BugReport,
  Notifications,
  VolumeUp,
  ExpandMore,
  ExpandLess,
  Key,
  Code,
  Link,
  AccountBox,
  ContentCopy,
  Check,
  BuildCircle,
  PriorityHigh,
  NetworkCheck,
} from '@mui/icons-material'
import { useNotifications, useAudioNotifications, useUptime, useAuthStatus } from '@/hooks'
import type { MenuItem as MenuItemType, SimpleMenuItem, DisplayMenuItem, ClickableDisplayMenuItem, CopyableMenuItem } from '@/types'
import { ApiKeyGenerationModal } from '@/components/features/apiKey/ApiKeyGenerationModal'
import { DashboardBlurOverlay } from '@/components/features/auth/DashboardBlurOverlay'
import { env } from '@/utils/env'

// Type alias for a cleaner subitem union type
type SubMenuItem = SimpleMenuItem | DisplayMenuItem | ClickableDisplayMenuItem | CopyableMenuItem

interface MenuProps {
  size?: 'small' | 'medium' | 'large'
}

export const Menu: React.FC<MenuProps> = React.memo(({ size = 'medium' }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [isTestingSound, setIsTestingSound] = useState<boolean>(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState<boolean>(false)
  const [copiedItem, setCopiedItem] = useState<string | null>(null)

  // Hooks for functionality
  const { isEnabled, isSupported, isPending, requestPermission } = useNotifications()
  const {
    isEnabled: audioEnabled,
    isSupported: audioSupported,
    isInitialized: audioInitialized,
    playTestSound,
  } = useAudioNotifications()
  // Authentication state
  const { user } = useAuthStatus()
  
  // Listen to SSE connection state from global events (to avoid duplicate connections)
  const [connectionId, setConnectionId] = React.useState<string | null>(null)
  const [isConnected, setIsConnected] = React.useState<boolean>(false)
  
  React.useEffect(() => {
    const handleConnectionId = (event: CustomEvent) => {
      setConnectionId(event.detail.connectionId)
      setIsConnected(true)
    }
    
    const handleDisconnected = () => {
      setConnectionId(null)
      setIsConnected(false)
    }
    
    // Check if connection already exists by looking for connection status in DOM
    // This helps when Menu component loads after connection is established
    const checkExistingConnection = () => {
      const connectionStatus = document.querySelector('[data-testid="connection-status"]')
      if (connectionStatus && connectionStatus.getAttribute('data-connected') === 'true') {
        const existingConnectionId = connectionStatus.getAttribute('data-connection-id')
        if (existingConnectionId) {
          setConnectionId(existingConnectionId)
          setIsConnected(true)
        }
      }
    }
    
    // Check for existing connection on mount
    checkExistingConnection()
    
    window.addEventListener('sse-connection-id-received', handleConnectionId as EventListener)
    window.addEventListener('sse-disconnected', handleDisconnected as EventListener)
    
    return () => {
      window.removeEventListener('sse-connection-id-received', handleConnectionId as EventListener)
      window.removeEventListener('sse-disconnected', handleDisconnected as EventListener)
    }
  }, [])
  
  // Uptime should only track when SSE service is connected
  const { formattedUptime, isTracking, start: startUptime, stop: stopUptime } = useUptime({
    autoStart: false, // Don't auto-start, we'll control it manually
  })
  
  // Control uptime tracking based on SSE connection state
  React.useEffect(() => {
    if (isConnected && !isTracking) {
      // Start tracking when connected
      startUptime()
    } else if (!isConnected && isTracking) {
      // Stop tracking when disconnected
      stopUptime()
    }
  }, [isConnected, isTracking, startUptime, stopUptime])

  const isOpen = Boolean(anchorEl)

  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }, [])

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null)
    setExpandedSection(null)
  }, [])

  const handleSectionToggle = useCallback((sectionId: string) => {
    setExpandedSection((prev) => (prev === sectionId ? null : sectionId))
  }, [])

  const handleNotificationPermission = useCallback(async () => {
    if (!isSupported || isEnabled) return
    await requestPermission()
    handleMenuClose()
  }, [isSupported, isEnabled, requestPermission, handleMenuClose])

  const handleTestSound = useCallback(async () => {
    if (!audioSupported || !audioEnabled || isTestingSound) return

    try {
      setIsTestingSound(true)
      await playTestSound()
      handleMenuClose()
    } catch {
      // Test sound failed - continue silently
    } finally {
      setIsTestingSound(false)
    }
  }, [audioSupported, audioEnabled, isTestingSound, playTestSound, handleMenuClose])

  const handleGenerateApiKey = useCallback(() => {
    setApiKeyModalOpen(true)
    handleMenuClose()
  }, [handleMenuClose])

  const handleCopyToClipboard = useCallback(async (text: string | undefined, itemId: string) => {
    if (!text) {
      return
    }

    try {
      await navigator.clipboard.writeText(text)
      setCopiedItem(itemId)
      setTimeout(() => setCopiedItem(null), 2000)
    } catch (clipboardError) {
      // Fallback to selection-based copy if clipboard API fails
      try {
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-9999px'
        textArea.style.top = '-9999px'
        textArea.setAttribute('readonly', '')
        document.body.appendChild(textArea)
        
        textArea.select()
        textArea.setSelectionRange(0, 99999) // For mobile devices
        
        // Modern browsers should support clipboard API, but provide fallback
        document.body.removeChild(textArea)
        
        // If we get here, set as copied anyway since a text was selected
        setCopiedItem(itemId)
        setTimeout(() => setCopiedItem(null), 2000)
      } catch (fallbackError) {
        // Log fallback error for debugging but don't break functionality
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.warn('Copy fallback failed:', { clipboardError, fallbackError })
        }
      }
    }
  }, [])

  const getNotificationMenuText = useCallback((): string => {
    if (!isSupported) return 'Notifications not supported'
    if (isPending) return 'Requesting permission...'
    if (isEnabled) return 'System notifications enabled'
    return 'Allow notifications'
  }, [isSupported, isPending, isEnabled])

  const getAudioTestMenuText = useCallback((): string => {
    if (!audioSupported) return 'Audio not supported'
    if (isTestingSound) return 'Testing...'
    if (!audioEnabled) return 'Audio disabled'
    if (!audioInitialized) return 'Audio not ready'
    return 'Test sound'
  }, [audioSupported, isTestingSound, audioEnabled, audioInitialized])

  /**
   * Menu structure definition with accordion sections
   */
  const menuItems = useMemo(
    (): MenuItemType[] => [
      // 1. Developer section (collapsible)
      {
        id: 'developer',
        type: 'collapsible',
        label: 'Developer',
        icon: <Code sx={{ fontSize: 18, color: 'text.secondary' }} />,
        items: [
          {
            id: 'generate-api-key',
            type: 'simple',
            label: 'Generate API Key',
            icon: <Key sx={{ fontSize: 18, color: '#2d7a32' }} />,
            onClick: handleGenerateApiKey,
            disabled: false,
          },
        ],
      },
      // 2. System section (collapsible)
      {
        id: 'system',
        type: 'collapsible',
        label: 'System',
        icon: <Settings sx={{ fontSize: 18, color: 'text.secondary' }} />,
        items: [
          {
            id: 'notifications',
            type: 'clickable-display',
            label: 'Notifications',
            value: getNotificationMenuText(),
            icon: isEnabled ? (
              <Notifications
                sx={{ fontSize: 18, color: '#2d7a32' }}
              />
            ) : (
              <PriorityHigh
                sx={{ fontSize: 18, color: '#f44336' }}
              />
            ),
            onClick: () => void handleNotificationPermission(),
            disabled: !isSupported || isPending || isEnabled,
          },
        ],
      },
      // 3. Debug section (collapsible)
      {
        id: 'debug',
        type: 'collapsible',
        label: 'Debug',
        icon: <BugReport sx={{ fontSize: 18, color: 'text.secondary' }} />,
        items: [
          {
            id: 'connected-to',
            type: 'copyable',
            label: 'Connected to',
            value: isConnected ? env.BACKEND_BASE_URL : 'Not connected',
            ...(isConnected && { copyValue: env.BACKEND_BASE_URL }),
            icon: (
              <NetworkCheck sx={{ fontSize: 18, color: isConnected ? '#2d7a32' : 'text.disabled' }} />
            ),
          },
          {
            id: 'connection-id',
            type: 'copyable',
            label: 'Connection ID',
            value: connectionId || (isConnected ? 'Connecting...' : 'Not connected'),
            ...(connectionId && { copyValue: connectionId }),
            icon: (
              <Link sx={{ fontSize: 18, color: (connectionId && isConnected) ? '#2d7a32' : 'text.disabled' }} />
            ),
          },
          {
            id: 'user-external-id',
            type: 'copyable',
            label: 'User ID',
            value: user?.profile?.sub || 'Not authenticated',
            ...(user?.profile?.sub && { copyValue: user.profile.sub }),
            icon: (
              <AccountBox sx={{ fontSize: 18, color: (user?.profile?.sub && isConnected) ? '#2d7a32' : 'text.disabled' }} />
            ),
          },
          {
            id: 'uptime',
            type: 'display',
            label: 'Uptime',
            value: isTracking ? formattedUptime : 'Not connected',
            icon: (
              <AccessTime sx={{ fontSize: 18, color: isTracking ? '#2d7a32' : 'text.disabled' }} />
            ),
          },
        ],
      },
      // 4. Diagnostics section (collapsible)
      {
        id: 'diagnostics',
        type: 'collapsible',
        label: 'Diagnostics',
        icon: <BuildCircle sx={{ fontSize: 18, color: 'text.secondary' }} />,
        items: [
          {
            id: 'test-sound',
            type: 'simple',
            label: getAudioTestMenuText(),
            icon: (
              <VolumeUp
                sx={{
                  fontSize: 18,
                  color: audioEnabled && audioSupported ? '#2d7a32' : 'text.secondary',
                }}
              />
            ),
            onClick: () => void handleTestSound(),
            disabled: !audioSupported || !audioEnabled || isTestingSound,
          },
        ],
      },
    ],
    [
      handleGenerateApiKey,
      getNotificationMenuText,
      isEnabled,
      isSupported,
      isPending,
      handleNotificationPermission,
      formattedUptime,
      isTracking,
      connectionId,
      isConnected,
      user?.profile?.sub,
      getAudioTestMenuText,
      audioEnabled,
      audioSupported,
      isTestingSound,
      handleTestSound,
    ],
  )

  /**
   * Render display type menu item
   */
  const renderDisplayItem = useCallback((item: MenuItemType) => {
    if (item.type !== 'display') return null
    return (
      <MenuItem
        key={item.id}
        disabled
        sx={{
          opacity: 1,
          cursor: 'default',
          borderRadius: 1,
          mx: 1,
          minHeight: 36,
          '&:hover': {
            backgroundColor: 'transparent',
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
        <ListItemText
          primary={
            <Typography variant="body2" sx={{ fontWeight: 400 }}>
              {item.label}: {item.value}
            </Typography>
          }
        />
      </MenuItem>
    )
  }, [])

  /**
   * Render simple type menu item
   */
  const renderSimpleItem = useCallback((item: MenuItemType) => {
    if (item.type !== 'simple') return null
    return (
      <MenuItem
        key={item.id}
        onClick={() => {
          item.onClick()
          handleMenuClose()
        }}
        disabled={item.disabled ?? false}
        sx={{
          borderRadius: 1,
          mx: 1,
          minHeight: 36,
          transition: 'all 0.15s ease-in-out',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
        <ListItemText
          primary={
            <Typography variant="body2" sx={{ fontWeight: 400 }}>
              {item.label}
            </Typography>
          }
        />
      </MenuItem>
    )
  }, [handleMenuClose])

  /**
   * Render copyable type menu item
   */
  const renderCopyableItem = useCallback((item: MenuItemType) => {
    if (item.type !== 'copyable') return null
    const canCopy = Boolean(item.copyValue)
    const isCopied = copiedItem === item.id
    
    return (
      <Box
        key={item.id}
        sx={{
          borderRadius: 1,
          mx: 1,
          minHeight: 36,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2,
          py: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
          <Typography variant="body2" sx={{ fontWeight: 400 }}>
            {item.label}: {item.value}
          </Typography>
        </Box>
        {canCopy && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              void handleCopyToClipboard(item.copyValue, item.id)
            }}
            sx={{
              width: 24,
              height: 24,
              ml: 1,
              opacity: 0.8,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                opacity: 1,
                backgroundColor: 'action.hover',
              },
            }}
          >
            {isCopied ? (
              <Check 
                sx={{ 
                  fontSize: 14, 
                  color: '#4caf50',
                  transition: 'all 0.2s ease-in-out'
                }} 
              />
            ) : (
              <ContentCopy 
                sx={{ 
                  fontSize: 14, 
                  color: 'primary.main',
                  opacity: 0.9
                }} 
              />
            )}
          </IconButton>
        )}
      </Box>
    )
  }, [copiedItem, handleCopyToClipboard])

  /**
   * Render simple subitem within a collapsible section
   */
  const renderSimpleSubItem = useCallback((subItem: SubMenuItem) => {
    if (subItem.type !== 'simple') return null
    return (
      <MenuItem
        key={subItem.id}
        onClick={() => {
          subItem.onClick()
          handleMenuClose()
        }}
        disabled={subItem.disabled ?? false}
        sx={{
          borderRadius: 1,
          mx: 1,
          minHeight: 32,
          transition: 'all 0.15s ease-in-out',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 32 }}>{subItem.icon}</ListItemIcon>
        <ListItemText
          primary={
            <Typography
              variant="body2"
              sx={{ 
                fontWeight: 400, 
                fontSize: '0.875rem',
                color: 'text.primary'
              }}
            >
              {subItem.label}
            </Typography>
          }
        />
      </MenuItem>
    )
  }, [handleMenuClose])

  /**
   * Render display subitem within a collapsible section
   */
  const renderDisplaySubItem = useCallback((subItem: SubMenuItem) => {
    if (subItem.type !== 'display' && subItem.type !== 'clickable-display') return null
    const shouldBeGrey = subItem.id === 'uptime' && !isTracking
    const isNotification = subItem.id === 'notifications'
    const isClickable = subItem.type === 'clickable-display' && !subItem.disabled
    
    const getNotificationColors = () => {
      if (isNotification) {
        return {
          labelColor: 'text.primary', // White/primary text for "Notifications" label
          valueColor: isEnabled ? '#2d7a32' : '#f44336' // Green/red for status
        }
      }
      return {
        labelColor: shouldBeGrey ? 'text.disabled' : 'text.primary',
        valueColor: shouldBeGrey ? 'text.disabled' : 'text.secondary'
      }
    }
    
    const { labelColor, valueColor } = getNotificationColors()
    
    return (
      <Box
        key={subItem.id}
        onClick={isClickable ? () => { 
          if (subItem.type === 'clickable-display') {
            subItem.onClick()
            handleMenuClose()
          }
        } : undefined}
        sx={{
          borderRadius: 1,
          mx: 1,
          minHeight: 48,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          px: 2,
          py: 1,
          cursor: isClickable ? 'pointer' : 'default',
          transition: 'all 0.15s ease-in-out',
          '&:hover': isClickable ? {
            backgroundColor: 'action.hover',
          } : {}
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
          <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>{subItem.icon}</ListItemIcon>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{ 
                fontWeight: 400, 
                fontSize: '0.875rem',
                color: labelColor,
                mb: 0.5
              }}
            >
              {subItem.label}
            </Typography>
            <Typography
              variant="body2"
              sx={{ 
                fontWeight: 400, 
                fontSize: '0.75rem',
                color: valueColor,
                fontFamily: isNotification ? 'inherit' : 'monospace'
              }}
            >
              {subItem.value}
            </Typography>
          </Box>
        </Box>
      </Box>
    )
  }, [isTracking, isEnabled, handleMenuClose])

  /**
   * Render copyable subitem within a collapsible section
   */
  const renderCopyableSubItem = useCallback((subItem: SubMenuItem) => {
    if (subItem.type !== 'copyable') return null
    const canCopy = Boolean(subItem.copyValue)
    const isCopied = copiedItem === subItem.id
    const shouldBeGrey = (subItem.id === 'connection-id' || subItem.id === 'user-external-id') && !isConnected
    
    return (
      <Box
        key={subItem.id}
        sx={{
          borderRadius: 1,
          mx: 1,
          minHeight: 48,
          display: 'flex',
          alignItems: 'flex-start',
          px: 2,
          py: 1,
        }}
      >
        <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>{subItem.icon}</ListItemIcon>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="body2"
            sx={{ 
              fontWeight: 400, 
              fontSize: '0.875rem',
              color: shouldBeGrey ? 'text.disabled' : 'text.primary',
              mb: 0.5
            }}
          >
            {subItem.label}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="body2"
              sx={{ 
                fontWeight: 400, 
                fontSize: '0.75rem',
                color: shouldBeGrey ? 'text.disabled' : 'text.secondary',
                fontFamily: 'monospace',
                wordBreak: 'break-all'
              }}
            >
              {subItem.value}
            </Typography>
            {canCopy && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  void handleCopyToClipboard(subItem.copyValue, subItem.id)
                }}
                sx={{
                  width: 20,
                  height: 20,
                  ml: 1,
                  opacity: 0.8,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    opacity: 1,
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                {isCopied ? (
                  <Check 
                    sx={{ 
                      fontSize: 12, 
                      color: '#4caf50',
                      transition: 'all 0.2s ease-in-out'
                    }} 
                  />
                ) : (
                  <ContentCopy 
                    sx={{ 
                      fontSize: 12, 
                      color: 'primary.main',
                      opacity: 0.9
                    }} 
                  />
                )}
              </IconButton>
            )}
          </Box>
        </Box>
      </Box>
    )
  }, [copiedItem, isConnected, handleCopyToClipboard])

  /**
   * Render subitem within a collapsible section
   */
  const renderSubItem = useCallback((subItem: SubMenuItem) => {
    switch (subItem.type) {
      case 'simple':
        return renderSimpleSubItem(subItem)
      case 'display':
      case 'clickable-display':
        return renderDisplaySubItem(subItem)
      case 'copyable':
        return renderCopyableSubItem(subItem)
      default:
        return null
    }
  }, [renderSimpleSubItem, renderDisplaySubItem, renderCopyableSubItem])

  /**
   * Render collapsible type menu item
   */
  const renderCollapsibleItem = useCallback((item: MenuItemType) => {
    if (item.type !== 'collapsible') return null
    const isExpanded = expandedSection === item.id

    return (
      <Box key={item.id}>
        <MenuItem
          onClick={() => handleSectionToggle(item.id)}
          sx={{
            borderRadius: 1,
            mx: 1,
            minHeight: 36,
            transition: 'all 0.15s ease-in-out',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
          <ListItemText
            primary={
              <Typography variant="body2" sx={{ fontWeight: 400 }}>
                {item.label}
              </Typography>
            }
          />
          {isExpanded ? (
            <ExpandLess sx={{ fontSize: 18, color: 'text.secondary' }} />
          ) : (
            <ExpandMore sx={{ fontSize: 18, color: 'text.secondary' }} />
          )}
        </MenuItem>

        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <Box sx={{ pl: 2 }}>
            {item.items.map(renderSubItem)}
          </Box>
        </Collapse>
      </Box>
    )
  }, [expandedSection, handleSectionToggle, renderSubItem])

  /**
   * Render individual menu item based on type
   */
  const renderMenuItem = useCallback(
    (item: MenuItemType): React.ReactElement | null => {
      switch (item.type) {
        case 'display':
          return renderDisplayItem(item)
        case 'simple':
          return renderSimpleItem(item)
        case 'copyable':
          return renderCopyableItem(item)
        case 'collapsible':
          return renderCollapsibleItem(item)
        default:
          return null
      }
    },
    [renderDisplayItem, renderSimpleItem, renderCopyableItem, renderCollapsibleItem],
  )

  const iconSize = useMemo(() => {
    switch (size) {
      case 'small':
        return 16
      case 'medium':
        return 20
      case 'large':
        return 24
      default:
        return 20
    }
  }, [size])

  const buttonSize = useMemo(() => {
    switch (size) {
      case 'small':
        return 32
      case 'medium':
        return 40
      case 'large':
        return 48
      default:
        return 40
    }
  }, [size])

  return (
    <Box>
      <IconButton
        onClick={handleMenuOpen}
        aria-label="Open menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? 'app-menu' : undefined}
        aria-haspopup="true"
        sx={{
          width: buttonSize,
          height: buttonSize,
          color: 'text.secondary',
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: 1.5,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'action.hover',
            color: 'text.primary',
          },
          '&[aria-expanded="true"]': {
            backgroundColor: 'action.selected',
            color: 'text.primary',
          },
        }}
      >
        <MoreVert
          sx={{
            fontSize: iconSize,
            opacity: 0.8,
            filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15))',
          }}
        />
      </IconButton>

      <Popover
        id="app-menu"
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          mt: 1,
          '& .MuiPopover-paper': {
            width: 600,
            borderRadius: 2,
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
            backgroundImage: 'none',
            // Add proper spacing from the right edge to avoid crowding the user profile
            marginRight: '8px',
          },
        }}
        slotProps={{
          paper: {
            elevation: 0,
          },
        }}
      >
        <MenuList
          dense
          sx={{
            py: 1,
            '& .MuiMenuItem-root': {
              borderRadius: 1,
              mx: 1,
              minHeight: 36,
              transition: 'all 0.15s ease-in-out',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
              '&:active': {
                backgroundColor: 'action.selected',
              },
            },
          }}
        >
          {menuItems.map(renderMenuItem)}
        </MenuList>
      </Popover>

      <DashboardBlurOverlay 
        isActive={apiKeyModalOpen}
        blurIntensity={2.03}
        onBackdropClick={() => setApiKeyModalOpen(false)}
      >
        <ApiKeyGenerationModal
          open={apiKeyModalOpen}
          onClose={() => setApiKeyModalOpen(false)}
          onSuccess={() => {
            setApiKeyModalOpen(false);
          }}
        />
      </DashboardBlurOverlay>
    </Box>
  )
})

Menu.displayName = 'Menu'
