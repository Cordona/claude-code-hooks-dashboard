import { useState } from 'react'
import type { FC, MouseEvent } from 'react'
import { 
  Avatar, 
  Button, 
  Box, 
  Typography, 
  Menu, 
  MenuItem, 
  ListItemIcon
} from '@mui/material'
import { LogoutOutlined } from '@mui/icons-material'
import { useAuth } from 'react-oidc-context'

// TypeScript interfaces for OIDC user structure following TypeScript 5.7+ patterns
interface ProfileClaims {
  readonly name?: string
  readonly preferred_username?: string
  readonly given_name?: string
  readonly family_name?: string
  readonly nickname?: string
  readonly email?: string  
  readonly sub?: string
  readonly [key: string]: unknown
}

export interface OIDCUser {
  readonly id_token?: string
  readonly access_token?: string
  readonly refresh_token?: string
  readonly profile?: ProfileClaims
  readonly [key: string]: unknown
}

interface UserProfileProps {
  readonly user: OIDCUser
}

export const UserProfile: FC<UserProfileProps> = ({ user }) => {
  const auth = useAuth()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  
  const open = Boolean(anchorEl)

  const handleClick = (event: MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = (): void => {
    setAnchorEl(null)
  }

  const handleLogout = async (): Promise<void> => {
    handleClose()
    try {
      await auth.signoutRedirect()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Logout failed:', error)
    }
  }

  if (!user) return null

  // Extract user info from JWT claims via profile property
  const profile = user.profile || {}
  const displayName = profile.name ?? 
                      profile.preferred_username ?? 
                      profile.given_name ?? 
                      profile.nickname ?? 
                      profile.sub ?? 
                      (profile.email ? profile.email.split('@')[0] : null) ?? 
                      'User'
  const email = profile.email ?? ''

  return (
    <>
      <Button
        onClick={handleClick}
        sx={{
          minWidth: 'auto',
          padding: 0,
          borderRadius: '50%',
          '&:hover': {
            backgroundColor: 'transparent',
            transform: 'scale(1.05)',
          },
          transition: 'transform 0.2s ease-in-out',
        }}
      >
        <Avatar
          sx={{
            width: 26,
            height: 26,
            fontSize: '0.75rem',
            bgcolor: 'primary.main',
            fontWeight: 600,
            cursor: 'pointer',
            border: '2px solid transparent',
            '&:hover': {
              borderColor: 'primary.light',
            },
            transition: 'border-color 0.2s ease-in-out',
          }}
        >
          {displayName.charAt(0).toUpperCase()}
        </Avatar>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        sx={{ 
          mt: 1,
          '& .MuiPaper-root': {
            minWidth: 200,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <Box sx={{ px: 3, py: 2 }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 600,
              mb: 0.5,
              color: 'text.primary'
            }}
          >
            {displayName}
          </Typography>
          {email && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.85rem'
              }}
            >
              {email}
            </Typography>
          )}
        </Box>
        <MenuItem 
          onClick={handleLogout}
          sx={{
            mx: 1,
            mb: 1,
            borderRadius: 1,
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'action.hover',
              color: 'text.primary'
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            <LogoutOutlined fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Sign Out</Typography>
        </MenuItem>
      </Menu>
    </>
  )
}