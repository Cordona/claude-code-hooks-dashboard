/**
 * Claude Code Hooks Notification Types
 * TypeScript interfaces for notification data structure and table components
 */

/**
 * Core notification data structure received from SSE events
 */
export interface ClaudeHookEvent {
  /** Unique identifier for the notification */
  id: string
  /** Hook type from backend (received as snake_case hook_type) - optional for backward compatibility */
  hook_type?: string
  /** Main notification message/reason */
  reason: string
  /** ISO timestamp when event occurred */
  timestamp: string
  /** Optional project context path */
  context_work_directory?: string
  /** User external ID - optional for backward compatibility */
  user_external_id?: string
  /** Event type (e.g., 'plan_ready', 'tool_use', etc.) */
  type?: string
  /** Additional event metadata */
  metadata?: Record<string, unknown>
  /** Event source or origin */
  source?: string
}

/**
 * Enhanced notification for display in table
 * Includes additional metadata for UI components
 */
export interface NotificationData {
  /** Unique identifier for the notification */
  id: string
  /** Main notification message for display */
  message: string
  /** ISO timestamp when event occurred */
  timestamp: string
  /** Optional project context path for display */
  projectContext?: string
  /** When this notification was added to the local list */
  addedAt: string
  /** Formatted time for display (HH:MM) */
  displayTime: string
  /** Formatted date for display (DD/MM/YYYY) */
  displayDate: string
  /** Hook type from backend for primary event classification */
  hookType?: string
  /** Event type for additional context */
  eventType?: string
  /** Additional event metadata for debugging */
  metadata?: Record<string, unknown>
  /** Event source or origin */
  source?: string
}

/**
 * Notification table component props
 */
export interface NotificationTableProps {
  /** Array of notifications to display */
  notifications: NotificationData[]
  /** Callback when individual notification is deleted */
  onDeleteNotification: (id: string) => void
  /** Callback when all notifications are deleted */
  onDeleteAll: () => void
}

/**
 * Table column definitions for consistent layout
 */
export interface TableColumn {
  /** Column identifier */
  id: keyof NotificationData | 'actions'
  /** Display label */
  label: string
  /** Column width in CSS units */
  width: string
  /** Alignment for column content */
  align: 'left' | 'center' | 'right'
  /** Whether column is sortable */
  sortable: boolean
  /** Whether column is hidden on mobile */
  hideOnMobile?: boolean
}

/**
 * System notification permission states
 */
export type SystemNotificationPermission = 'default' | 'granted' | 'denied'

/**
 * System notification configuration options
 */
export interface SystemNotificationOptions {
  /** Main title for the notification */
  title: string
  /** Body text of the notification */
  body: string
  /** Unique tag to prevent duplicate notifications */
  tag: string
  /** Whether notification requires user interaction to dismiss */
  requireInteraction?: boolean
  /** Whether notification should be silent */
  silent?: boolean
  /** Custom data attached to the notification */
  data?: unknown
}

/**
 * System notification state management
 */
export interface SystemNotificationState {
  /** Whether browser supports notifications */
  isSupported: boolean
  /** Current permission state */
  permission: SystemNotificationPermission
  /** Whether permission request is in progress */
  isRequesting: boolean
  /** Whether system notifications are enabled */
  isEnabled: boolean
}

/**
 * System notification manager interface
 */
export interface UseSystemNotificationsReturn {
  /** Current notification state */
  state: SystemNotificationState
  /** Whether any async operation is pending */
  isPending: boolean
  /** Request notification permission from user */
  requestPermission: () => Promise<void>
  /** Show a system notification */
  showNotification: (options: Omit<SystemNotificationOptions, 'tag'>) => Promise<void>
  /** Test system notifications with a sample notification */
  testNotification: () => Promise<void>
  /** Check the current permission status */
  checkPermission: () => void
}
