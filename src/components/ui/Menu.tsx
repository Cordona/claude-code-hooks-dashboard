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
} from '@mui/icons-material'
import { useNotifications, useAudioNotifications, useUptime } from '@/hooks'
import type { MenuItem as MenuItemType } from '@/types'

interface MenuProps {
  size?: 'small' | 'medium' | 'large'
}

export const Menu: React.FC<MenuProps> = React.memo(({ size = 'medium' }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [isTestingSound, setIsTestingSound] = useState<boolean>(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  // Hooks for functionality
  const { isEnabled, isSupported, isPending, requestPermission } = useNotifications()
  const {
    isEnabled: audioEnabled,
    isSupported: audioSupported,
    isInitialized: audioInitialized,
    playTestSound,
  } = useAudioNotifications()
  const { formattedUptime, isTracking } = useUptime()

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
    if (!isSupported) return
    await requestPermission()
    handleMenuClose()
  }, [isSupported, requestPermission, handleMenuClose])

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
      // 1. System section (collapsible)
      {
        id: 'system',
        type: 'collapsible',
        label: 'System',
        icon: <Settings sx={{ fontSize: 18, color: 'text.secondary' }} />,
        items: [
          {
            id: 'uptime',
            type: 'display',
            label: 'Uptime',
            value: formattedUptime,
            icon: (
              <AccessTime sx={{ fontSize: 18, color: isTracking ? '#2d7a32' : 'text.secondary' }} />
            ),
          },
          {
            id: 'notifications',
            type: 'simple',
            label: getNotificationMenuText(),
            icon: (
              <Notifications
                sx={{ fontSize: 18, color: isEnabled ? '#2d7a32' : 'text.secondary' }}
              />
            ),
            onClick: () => void handleNotificationPermission(),
            disabled: !isSupported || isEnabled || isPending,
          },
        ],
      },
      // 2. Diagnostics section (collapsible)
      {
        id: 'diagnostics',
        type: 'collapsible',
        label: 'Diagnostics',
        icon: <BugReport sx={{ fontSize: 18, color: 'text.secondary' }} />,
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
      formattedUptime,
      isTracking,
      getNotificationMenuText,
      isEnabled,
      isSupported,
      isPending,
      handleNotificationPermission,
      getAudioTestMenuText,
      audioEnabled,
      audioSupported,
      isTestingSound,
      handleTestSound,
    ],
  )

  /**
   * Render individual menu item based on type
   */
  const renderMenuItem = useCallback(
    (item: MenuItemType): React.ReactElement | null => {
      if (item.type === 'display') {
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
      }

      if (item.type === 'simple') {
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
      }

      if (item.type === 'collapsible') {
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
                {item.items.map((subItem) => {
                  if (subItem.type === 'simple') {
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
                              sx={{ fontWeight: 400, fontSize: '0.875rem' }}
                            >
                              {subItem.label}
                            </Typography>
                          }
                        />
                      </MenuItem>
                    )
                  }

                  if (subItem.type === 'display') {
                    return (
                      <MenuItem
                        key={subItem.id}
                        disabled
                        sx={{
                          borderRadius: 1,
                          mx: 1,
                          minHeight: 32,
                          opacity: 1,
                          cursor: 'default',
                          '&:hover': {
                            backgroundColor: 'transparent',
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 32 }}>{subItem.icon}</ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 400, fontSize: '0.875rem' }}
                            >
                              {subItem.label}: {subItem.value}
                            </Typography>
                          }
                        />
                      </MenuItem>
                    )
                  }

                  return null
                })}
              </Box>
            </Collapse>
          </Box>
        )
      }

      return null
    },
    [expandedSection, handleSectionToggle, handleMenuClose],
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
            minWidth: 200,
            borderRadius: 2,
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: (theme) => theme.shadows[8],
            backgroundImage: 'none',
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
    </Box>
  )
})

Menu.displayName = 'Menu'
