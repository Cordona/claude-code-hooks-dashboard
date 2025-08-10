import React, {useCallback, useMemo} from 'react'
import {Box, Typography, useTheme} from '@mui/material'
import {useAudioNotifications} from '@/hooks'

interface AudioStatusProps {
    size?: 'small' | 'medium' | 'large'
    showLabel?: boolean
    dotSize?: number
}

export const AudioStatus: React.FC<AudioStatusProps> = React.memo(({
                                                                       size = 'small',
                                                                       showLabel = true,
                                                                       dotSize: customDotSize
                                                                   }) => {
    const {isEnabled, isSupported, isInitialized} = useAudioNotifications()

    const dotSize = useMemo(() => {
        if (customDotSize) return customDotSize

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
    }, [size, customDotSize])

    const theme = useTheme()

    const getStatusColor = useCallback((): string => {
        // Refined, subtle colors inspired by the reference design
        if (isSupported && isEnabled && isInitialized) {
            return theme.palette.mode === 'dark' ? '#a78bfa' : '#8b5cf6' // Subtle purple for ready
        }
        if (isSupported && isEnabled && !isInitialized) {
            return theme.palette.mode === 'dark' ? '#fbbf24' : '#f59e0b' // Subtle amber for waiting
        }
        // Audio Disabled or Not Supported - Subtle Gray
        return theme.palette.mode === 'dark' ? '#6b7280' : '#9ca3af'
    }, [isSupported, isEnabled, isInitialized, theme])


    const getAriaLabel = useCallback((): string => {
        if (!isSupported) return 'Audio not supported'
        if (!isEnabled) return 'Audio disabled'
        if (!isInitialized) return 'Audio waiting for interaction'
        return 'Audio ready'
    }, [isSupported, isEnabled, isInitialized])

    const getStatusLabel = useCallback((): string => {
        // Sentence case labels for better readability
        if (!isSupported) return 'Sound not supported'
        if (!isEnabled) return 'Sound off'
        if (!isInitialized) return 'Sound waiting'
        return 'Sound on'
    }, [isSupported, isEnabled, isInitialized])

    const shouldPulse = useCallback((): boolean => {
        // Pulse when waiting for user interaction
        return isSupported && isEnabled && !isInitialized
    }, [isSupported, isEnabled, isInitialized])

    const pulseActive = shouldPulse()

    return (
        <Box
            component="output"
            aria-live="polite"
            aria-label={getAriaLabel()}
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing(1),
                py: theme.spacing(0.25),
                cursor: 'default',
            }}
        >
            <Box
                sx={{
                    width: dotSize,
                    height: dotSize,
                    borderRadius: '50%',
                    backgroundColor: getStatusColor(),
                    opacity: pulseActive ? 0.7 : 0.9,
                    transition: 'all 0.2s ease-in-out',
                    animation: pulseActive ? 'pulse 2s infinite' : 'none',
                    boxShadow: `0 0 0 1px ${getStatusColor()}20`,
                    '@keyframes pulse': {
                        '0%': {
                            opacity: 0.7,
                            transform: 'scale(1)',
                            boxShadow: `0 0 0 1px ${getStatusColor()}20`,
                        },
                        '50%': {
                            opacity: 1,
                            transform: 'scale(1.2)',
                            boxShadow: `0 0 0 2px ${getStatusColor()}30`,
                        },
                        '100%': {
                            opacity: 0.7,
                            transform: 'scale(1)',
                            boxShadow: `0 0 0 1px ${getStatusColor()}20`,
                        },
                    },
                }}
            />
            {showLabel && (
                <Typography
                    variant="body2"
                    sx={{
                        color: theme.palette.mode === 'dark' ? theme.palette.grey[400] : theme.palette.grey[600],
                        fontSize: '0.8125rem',
                        fontWeight: 400,
                        userSelect: 'none',
                        letterSpacing: '0.01em',
                    }}
                >
                    {getStatusLabel()}
                </Typography>
            )}
        </Box>
    )
})

AudioStatus.displayName = 'AudioStatus'
