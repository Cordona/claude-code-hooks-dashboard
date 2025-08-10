import type {FC} from 'react'
import {useEffect} from 'react'
import {Box, Typography} from '@mui/material'
import {useAuth} from 'react-oidc-context'

/**
 * OIDC Authentication Callback Component
 * Handles the OAuth2/OIDC callback flow after successful authentication
 */
export const AuthCallback: FC = () => {
    const auth = useAuth()

    useEffect(() => {
        // The react-oidc-context library automatically handles the callback
        // We just need to show a loading state while it processes
        if (auth.user) {
            // Authentication successful, redirect to dashboard
            window.location.href = '/dashboard'
        }
    }, [auth.user])

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'background.default',
            }}
        >
            <Box sx={{textAlign: 'center'}}>
                <Typography variant="h5" sx={{mb: 2, color: 'text.primary'}}>
                    🔐 Completing Authentication
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{mb: 3}}>
                    Please wait while we process your login...
                </Typography>
                <Box sx={{display: 'flex', justifyContent: 'center'}}>
                    <div>Loading...</div>
                </Box>
            </Box>
        </Box>
    )
}