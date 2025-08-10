import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import type {UptimeConfig, UptimeState, UseUptimeReturn} from '@/types'

/**
 * Modern React 19 hook for tracking application uptime
 * Provides real-time uptime tracking with efficient updates and proper cleanup
 */
export const useUptime = (config: UptimeConfig = {}): UseUptimeReturn => {
    const {
        updateInterval = 1000, // Update every second
        autoStart = true,
    } = config

    // State for tracking uptime
    const [state, setState] = useState<UptimeState>(() => ({
        startTime: autoStart ? Date.now() : 0,
        currentTime: autoStart ? Date.now() : 0,
        uptime: 0,
    }))

    // Ref to store interval ID for cleanup
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    // Track if uptime is actively running
    const isTracking = useMemo(() => state.startTime > 0, [state.startTime])

    /**
     * Update current time and calculate uptime
     */
    const updateUptime = useCallback((): void => {
        if (!isTracking) return

        setState((prev) => {
            const currentTime = Date.now()
            const uptime = currentTime - prev.startTime

            return {
                ...prev,
                currentTime,
                uptime,
            }
        })
    }, [isTracking])

    /**
     * Start uptime tracking
     */
    const start = useCallback((): void => {
        const now = Date.now()
        setState({
            startTime: now,
            currentTime: now,
            uptime: 0,
        })
    }, [])

    /**
     * Stop uptime tracking
     */
    const stop = useCallback((): void => {
        setState({
            startTime: 0,
            currentTime: 0,
            uptime: 0,
        })
    }, [])

    /**
     * Reset uptime tracking to zero (restart if it was running)
     */
    const reset = useCallback((): void => {
        const now = Date.now()
        setState((prev) => ({
            startTime: prev.startTime > 0 ? now : 0, // Only restart if it was tracking
            currentTime: prev.startTime > 0 ? now : 0,
            uptime: 0,
        }))
    }, [])

    /**
     * Format milliseconds to HH:MM:SS string with zero padding
     */
    const formatDuration = useCallback((milliseconds: number): string => {
        const totalSeconds = Math.floor(milliseconds / 1000)
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60

        return `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }, [])

    /**
     * Memoized formatted uptime string
     */
    const formattedUptime = useMemo(
        (): string => formatDuration(state.uptime),
        [state.uptime, formatDuration],
    )

    /**
     * Set up interval for uptime updates
     */
    useEffect(() => {
        if (!isTracking) {
            // Clear interval if not tracking
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
            return
        }

        // Start interval for regular updates
        intervalRef.current = setInterval(updateUptime, updateInterval)

        // Cleanup function
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
        }
    }, [isTracking, updateUptime, updateInterval])

    /**
     * Cleanup on unmounting
     */
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [])

    return {
        uptime: state.uptime,
        formattedUptime,
        start,
        stop,
        reset,
        isTracking,
    }
}
