import { useState, useCallback, useRef, useEffect, useOptimistic, useTransition } from 'react'
import type { NotificationData, ClaudeHookEvent } from '@/types'

/**
 * Hook for managing notification data and interactions
 * Handles adding, removing, and formatting notification data
 */
export const useNotificationData = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const maxNotifications = useRef<number>(100)
  const [isPending, startTransition] = useTransition()

  // Development logger utility
  const logError = useCallback((message: string, error: unknown): void => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error(message, error)
    }
  }, [])

  // Optimistic state for smooth UI updates during deletions
  const [optimisticNotifications, setOptimisticNotifications] = useOptimistic(
    notifications,
    (
      currentNotifications: NotificationData[],
      action: { type: 'delete' | 'deleteAll' | 'deleteContext'; id?: string; contextKey?: string },
    ) => {
      switch (action.type) {
        case 'delete':
          return currentNotifications.filter((notification) => notification.id !== action.id)
        case 'deleteAll':
          return []
        case 'deleteContext':
          return currentNotifications.filter((notification) => {
            const notificationContext = notification.projectContext ?? 'ungrouped'
            return notificationContext !== action.contextKey
          })
        default:
          return currentNotifications
      }
    },
  )

  /**
   * Format timestamp to display time (HH:MM)
   */
  const formatTime = useCallback((timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }, [])

  /**
   * Format timestamp to display date (DD/MM/YYYY)
   */
  const formatDate = useCallback((timestamp: string): string => {
    return new Date(timestamp).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }, [])

  /**
   * Add new notification from SSE event
   */
  const addNotification = useCallback(
    (event: ClaudeHookEvent): void => {
      const notificationData: NotificationData = {
        id: event.id,
        message: event.reason, // Map reason to message for display
        timestamp: event.timestamp,
        addedAt: new Date().toISOString(),
        displayTime: formatTime(event.timestamp),
        displayDate: formatDate(event.timestamp),
        ...(event.contextWorkDirectory && { projectContext: event.contextWorkDirectory }),
        ...(event.hookType && { hookType: event.hookType }),
        ...(event.type && { eventType: event.type }),
        ...(event.metadata && { metadata: event.metadata }),
        ...(event.source && { source: event.source }),
      }

      setNotifications((prev) => {
        const newNotifications = [notificationData, ...prev]

        // Keep only the most recent notifications
        if (newNotifications.length > maxNotifications.current) {
          return newNotifications.slice(0, maxNotifications.current)
        }

        return newNotifications
      })

      setError(null)
    },
    [formatTime, formatDate],
  )

  /**
   * Delete individual notification by ID with optimistic updates
   */
  const deleteNotification = useCallback(
    (id: string): void => {
      // Optimistically update the UI immediately
      startTransition(() => {
        setOptimisticNotifications({ type: 'delete', id })
      })

      // Perform actual deletion in transition
      const filterNotifications = (prev: NotificationData[]) =>
        prev.filter((notification) => notification.id !== id)

      startTransition(() => {
        setNotifications(filterNotifications)
      })
    },
    [setOptimisticNotifications, startTransition],
  )

  /**
   * Delete all notifications with optimistic updates
   */
  const deleteAllNotifications = useCallback((): void => {
    // Optimistically update the UI immediately
    startTransition(() => {
      setOptimisticNotifications({ type: 'deleteAll' })
    })

    // Perform actual deletion in transition
    startTransition(() => {
      setNotifications([])
    })
  }, [setOptimisticNotifications, startTransition])

  /**
   * Delete all notifications for a specific context with optimistic updates
   */
  const deleteAllInContext = useCallback(
    (contextKey: string): void => {
      // Optimistically update the UI immediately
      startTransition(() => {
        setOptimisticNotifications({ type: 'deleteContext', contextKey })
      })

      // Perform actual deletion in transition
      const filterNotifications = (prev: NotificationData[]) =>
        prev.filter((notification) => {
          const notificationContext = notification.projectContext ?? 'ungrouped'
          return notificationContext !== contextKey
        })

      startTransition(() => {
        setNotifications(filterNotifications)
      })
    },
    [setOptimisticNotifications, startTransition],
  )

  /**
   * Load notifications from localStorage on mount
   */
  useEffect(() => {
    const loadStoredNotifications = (): void => {
      try {
        setIsLoading(true)
        const stored = localStorage.getItem('claude-hooks-notifications')
        if (stored) {
          const parsedNotifications = JSON.parse(stored) as NotificationData[]
          setNotifications(parsedNotifications)
        }
        setError(null) // Clear any previous errors on a successful load
      } catch (loadError) {
        const errorMessage =
          loadError instanceof Error
            ? `Failed to load stored notifications: ${loadError.message}`
            : 'Failed to load stored notifications due to an unknown error'
        setError(errorMessage)

        // Report error in development
        logError('📊 useNotificationData: Failed to load from localStorage:', loadError)
      } finally {
        setIsLoading(false)
      }
    }

    loadStoredNotifications()
  }, [logError])

  /**
   * Save notifications to localStorage whenever they change
   */
  useEffect(() => {
    const saveNotifications = (): void => {
      try {
        localStorage.setItem('claude-hooks-notifications', JSON.stringify(notifications))
        // Clear save errors on successful save
        if (error?.includes('Failed to save')) {
          setError(null)
        }
      } catch (saveError) {
        const errorMessage =
          saveError instanceof Error
            ? `Failed to save notifications: ${saveError.message}`
            : 'Failed to save notifications due to an unknown error'
        setError(errorMessage)

        // Report error in development
        logError('📊 useNotificationData: Failed to save to localStorage:', saveError)
      }
    }

    saveNotifications()
  }, [notifications, error, logError])

  /**
   * Listen for SSE events and automatically add notifications
   */
  useEffect(() => {
    const handleClaudeHookEvent = (event: CustomEvent): void => {
      const hookEvent = event.detail as ClaudeHookEvent

      if (hookEvent?.id && hookEvent?.reason && hookEvent?.timestamp) {
        addNotification(hookEvent)
      }
    }

    // Listen for SSE events dispatched by useSSEConnect
    window.addEventListener('claude-hook-received', handleClaudeHookEvent as EventListener)

    return () => {
      window.removeEventListener('claude-hook-received', handleClaudeHookEvent as EventListener)
    }
  }, [addNotification])

  return {
    notifications: optimisticNotifications,
    isLoading: isLoading || isPending,
    error,
    addNotification,
    deleteNotification,
    deleteAllNotifications,
    deleteAllInContext,
    count: optimisticNotifications.length,
  }
}
