import {useCallback, useEffect, useOptimistic, useState, useTransition} from 'react'

interface NotificationState {
    isEnabled: boolean
    isRequesting: boolean
    isSupported: boolean
}

interface UseNotificationsReturn {
    isEnabled: boolean
    isRequesting: boolean
    isSupported: boolean
    isPending: boolean
    requestPermission: () => Promise<void>
}

export const useNotifications = (): UseNotificationsReturn => {
    const [state, setState] = useState<NotificationState>({
        isEnabled: false,
        isRequesting: false,
        isSupported: typeof window !== 'undefined' && 'Notification' in window,
    })

    const [isPending, startTransition] = useTransition()

    const [optimisticState, setOptimisticState] = useOptimistic(
        state,
        (currentState, optimisticUpdate: Partial<NotificationState>) => ({
            ...currentState,
            ...optimisticUpdate,
        }),
    )

    const checkPermission = useCallback((): void => {
        if (!state.isSupported) return

        const permission = Notification.permission
        // Check and update notification permission state
        setState((prev) => ({
            ...prev,
            isEnabled: permission === 'granted',
            isRequesting: false, // Reset requesting state on permission check
        }))
    }, [state.isSupported])

    const requestPermission = useCallback(async (): Promise<void> => {
        if (!state.isSupported || state.isEnabled) return

        startTransition(async () => {
            // Optimistically show requesting state within transition
            setOptimisticState({isRequesting: true})

            setState((prev) => ({
                ...prev,
                isRequesting: true,
            }))

            try {
                const permission = await Notification.requestPermission()
                setState((prev) => ({
                    ...prev,
                    isEnabled: permission === 'granted',
                    isRequesting: false,
                }))
            } catch (error: unknown) {
                // Notification permission request failed - reset requesting state
                // Error is handled silently to maintain smooth user experience
                // In production, this would be reported to error tracking service
                if (process.env.NODE_ENV === 'development') {
                    // eslint-disable-next-line no-console
                    console.warn('Notification permission request failed:', error)
                }
                setState((prev) => ({
                    ...prev,
                    isRequesting: false,
                }))
            }
        })
    }, [state.isSupported, state.isEnabled, setOptimisticState, startTransition])

    // Check permission on mount and periodically
    useEffect(() => {
        if (!state.isSupported) return

        checkPermission()

        // Check permission every 1000 ms (same as backend implementation)
        const interval = setInterval(checkPermission, 1000)

        return () => clearInterval(interval)
    }, [checkPermission, state.isSupported])

    return {
        isEnabled: optimisticState.isEnabled,
        isRequesting: optimisticState.isRequesting,
        isSupported: optimisticState.isSupported,
        isPending,
        requestPermission,
    }
}
