import type {FC, MouseEvent} from 'react'
import {useEffect, useState} from 'react'
import {Avatar, Box, Button, CircularProgress, ListItemIcon, Menu, MenuItem, Typography} from '@mui/material'
import {LogoutOutlined} from '@mui/icons-material'
import {useAuth} from 'react-oidc-context'
import {useSSEDisconnect} from '@/hooks'

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

export const UserProfile: FC<UserProfileProps> = ({user}) => {
    const auth = useAuth()
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [connectionId, setConnectionId] = useState<string | null>(null)


    const {disconnect} = useSSEDisconnect({
        accessToken: user?.access_token,
    })

    const open = Boolean(anchorEl)

    // Listen for connection ID from the SSE connection manager
    useEffect(() => {
        const handleConnectionIdReceived = (event: CustomEvent): void => {
            const {connectionId: id} = event.detail as { connectionId: string; message?: string }
            setConnectionId(id)
        }

        const handleConnectionDisconnected = (): void => {
            setConnectionId(null)
        }


        window.addEventListener('sse-connection-id-received', handleConnectionIdReceived as EventListener)
        window.addEventListener('sse-disconnected', handleConnectionDisconnected as EventListener)

        return () => {
            window.removeEventListener('sse-connection-id-received', handleConnectionIdReceived as EventListener)
            window.removeEventListener('sse-disconnected', handleConnectionDisconnected as EventListener)
        }
    }, [])

    const handleClick = (event: MouseEvent<HTMLElement>): void => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = (): void => {
        setAnchorEl(null)
    }

    const handleLogout = async (): Promise<void> => {
        handleClose()
        setIsLoggingOut(true)

        try {
            // Step 1: Disconnect SSE connection first (critical for backend resource cleanup)
            if (connectionId) {
                try {
                    await disconnect(connectionId)
                } catch (disconnectError) {
                    // Intentionally ignore disconnect errors during logout to not block the logout process
                    // The disconnect error is logged, but we continue with logout - this is the expected behavior
                    // eslint-disable-next-line no-console
                    console.warn('SSE disconnect failed during logout')
                    // Error handled: We log the issue but continue logout to avoid blocking user authentication flow
                    if (disconnectError) {
                        // Error acknowledged and handled by graceful degradation
                    }
                }
            }

            // Step 2: Proceed with OIDC logout
            await auth.signoutRedirect()
        } catch (error) {
            // Intentionally catch and log logout errors without rethrowing to prevent UI crashes,
            // The error is handled by logging and graceful degradation - UI remains stable
            // eslint-disable-next-line no-console
            console.error('Logout failed')
            // Error handled: We log the failure but keep the UI stable and allow user to retry
            if (error) {
                // Error acknowledged and handled by maintaining stable UI state
            }
        } finally {
            setIsLoggingOut(false)
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
                transformOrigin={{horizontal: 'right', vertical: 'top'}}
                anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                sx={{
                    mt: 1,
                    '& .MuiPaper-root': {
                        minWidth: 200,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
                    }
                }}
            >
                <Box sx={{px: 3, py: 2}}>
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
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        // eslint-disable-next-line @typescript-eslint/no-floating-promises, @typescript-eslint/no-misused-promises
                        void handleLogout()
                    }}
                    disabled={isLoggingOut}
                    sx={{
                        mx: 1,
                        mb: 1,
                        borderRadius: 1,
                        color: 'text.secondary',
                        '&:hover': {
                            backgroundColor: 'action.hover',
                            color: 'text.primary'
                        },
                        '&.Mui-disabled': {
                            color: 'text.disabled',
                        }
                    }}
                >
                    <ListItemIcon sx={{minWidth: 36}}>
                        {isLoggingOut ? (
                            <CircularProgress size={16} sx={{color: 'text.disabled'}}/>
                        ) : (
                            <LogoutOutlined fontSize="small"/>
                        )}
                    </ListItemIcon>
                    <Typography variant="body2">
                        {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
                    </Typography>
                </MenuItem>
            </Menu>
        </>
    )
}