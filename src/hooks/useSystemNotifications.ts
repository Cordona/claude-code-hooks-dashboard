import { useState, useCallback, useEffect, useOptimistic, useTransition } from 'react'
import type {
  SystemNotificationState,
  SystemNotificationPermission,
  SystemNotificationOptions,
  UseSystemNotificationsReturn,
  ClaudeHookEvent,
} from '@/types'
import { formatContextDisplayName } from '@/utils'

/**
 * Modern React 19 hook for managing browser system notifications
 * Integrates with the OS notification center across all platforms (macOS, Windows, Linux)
 */
export const useSystemNotifications = (): UseSystemNotificationsReturn => {
  // Check if the browser supports notifications
  const isSupported = typeof window !== 'undefined' && 'Notification' in window

  // Core notification state
  const [state, setState] = useState<SystemNotificationState>({
    isSupported,
    permission: isSupported ? (Notification.permission as SystemNotificationPermission) : 'denied',
    isRequesting: false,
    isEnabled: isSupported && Notification.permission === 'granted',
  })

  // React 19 hooks for performance
  const [isPending, startTransition] = useTransition()

  // Optimistic state for smooth UI updates during permission requests
  const [optimisticState, setOptimisticState] = useOptimistic(
    state,
    (
      currentState: SystemNotificationState,
      optimisticUpdate: Partial<SystemNotificationState>,
    ) => ({
      ...currentState,
      ...optimisticUpdate,
    }),
  )

  // Development logger utility
  const logError = useCallback((message: string, error: unknown): void => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error(`useSystemNotifications: ${message}`, error)
    }
  }, [])

  // Format project context path for display using the same logic as UI components
  const formatProjectContext = useCallback((projectPath?: string): string => {
    if (!projectPath) return ''
    return formatContextDisplayName(projectPath)
  }, [])

  /**
   * Check the current notification permission status
   */
  const checkPermission = useCallback((): void => {
    if (!isSupported) return

    const currentPermission = Notification.permission as SystemNotificationPermission
    startTransition(() => {
      setState((prev) => ({
        ...prev,
        permission: currentPermission,
        isEnabled: currentPermission === 'granted',
        isRequesting: false, // Reset requesting state on permission check
      }))
    })
  }, [isSupported, startTransition])

  /**
   * Show welcome notification after permission granted
   */
  const showWelcomeNotification = useCallback(async (): Promise<void> => {
    if (!isSupported || state.permission !== 'granted') return

    try {
      const notification = new Notification('🤖 Hooks Observability Dashboard', {
        body: 'System notifications enabled!\nYou will now receive Claude Code events in your notification center.',
        tag: 'claude-welcome',
        requireInteraction: false,
        silent: false,
      })

      // Focus window when notification clicked
      notification.onclick = () => {
        window.focus()
        notification.close()
      }

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close()
      }, 5000)
    } catch (error: unknown) {
      logError('Failed to show welcome notification', error)
    }
  }, [isSupported, state.permission, logError])

  /**
   * Request notification permission from user
   */
  const requestPermission = useCallback(async (): Promise<void> => {
    if (!isSupported || state.permission === 'granted') return

    startTransition(async () => {
      // Optimistically show requesting state
      setOptimisticState({ isRequesting: true })

      setState((prev) => ({
        ...prev,
        isRequesting: true,
      }))

      try {
        const permission = (await Notification.requestPermission()) as SystemNotificationPermission

        setState((prev) => ({
          ...prev,
          permission,
          isEnabled: permission === 'granted',
          isRequesting: false,
        }))

        // Show welcome notification if permission granted
        if (permission === 'granted') {
          await showWelcomeNotification()
        }
      } catch (error: unknown) {
        logError('Permission request failed', error)
        setState((prev) => ({
          ...prev,
          isRequesting: false,
        }))
      }
    })
  }, [
    isSupported,
    state.permission,
    setOptimisticState,
    startTransition,
    logError,
    showWelcomeNotification,
  ])

  /**
   * Show a system notification with Claude branding
   */
  const showNotification = useCallback(
    async (options: Omit<SystemNotificationOptions, 'tag'>): Promise<void> => {
      if (!isSupported || state.permission !== 'granted') return

      try {
        const notification = new Notification(options.title, {
          body: options.body,
          tag: `claude-${Date.now()}`, // Unique tag to prevent duplicates
          requireInteraction: options.requireInteraction ?? false,
          silent: options.silent ?? false,
          data: options.data,
        })

        // Focus window when notification clicked
        notification.onclick = () => {
          window.focus()
          notification.close()
        }

        // Handle notification errors
        notification.onerror = (error) => {
          logError('Notification display failed', error)
        }

        // Auto-close after 8 seconds (slightly longer than welcome)
        setTimeout(() => {
          notification.close()
        }, 8000)
      } catch (error: unknown) {
        logError('Failed to create notification', error)
      }
    },
    [isSupported, state.permission, logError],
  )

  /**
   * Create system notification from Claude hook event
   */
  const showNotificationFromEvent = useCallback(
    async (event: ClaudeHookEvent): Promise<void> => {
      if (!isSupported || state.permission !== 'granted') return

      const formattedPath = formatProjectContext(event.contextWorkDirectory)

      // Format message with clear labels like requested
      let body = `Message: ${event.reason}`
      if (formattedPath) {
        body += `\nContext: ${formattedPath}`
      }

      await showNotification({
        title: '🤖 Hooks Observability Dashboard',
        body,
        data: event,
      })
    },
    [isSupported, state.permission, formatProjectContext, showNotification],
  )

  /**
   * Test system notifications with a sample notification
   */
  const testNotification = useCallback(async (): Promise<void> => {
    if (!isSupported) return

    if (state.permission !== 'granted') {
      await requestPermission()
      return
    }

    await showNotification({
      title: '🤖 Hooks Observability Dashboard',
      body: 'Message: Test notification\nContext: ~/example/project/path',
    })
  }, [isSupported, state.permission, requestPermission, showNotification])

  /**
   * Listen for SSE events and automatically create system notifications
   */
  useEffect(() => {
    const handleClaudeHookEvent = (event: CustomEvent): void => {
      const hookEvent = event.detail as ClaudeHookEvent

      if (hookEvent?.id && hookEvent?.reason && hookEvent?.timestamp) {
        void showNotificationFromEvent(hookEvent)
      }
    }

    // Listen for SSE events dispatched by useSSEConnect
    window.addEventListener('claude-hook-received', handleClaudeHookEvent as EventListener)

    return () => {
      window.removeEventListener('claude-hook-received', handleClaudeHookEvent as EventListener)
    }
  }, [showNotificationFromEvent])

  /**
   * Check permission on mount and periodically
   */
  useEffect(() => {
    if (!isSupported) return

    checkPermission()

    // Check permission every 1000 ms (same as legacy implementation)
    const interval = setInterval(checkPermission, 1000)

    return () => clearInterval(interval)
  }, [checkPermission, isSupported])

  return {
    state: optimisticState,
    isPending,
    requestPermission,
    showNotification,
    testNotification,
    checkPermission,
  }
}
