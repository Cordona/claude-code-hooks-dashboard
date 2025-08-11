/**
 * Claude Code Hooks Notification Types
 * TypeScript interfaces for notification data structure and table components
 */

/**
 * Hook metadata structure from Claude Code Hooks service
 */
export interface HookMetadata {
    /** ISO timestamp when event occurred */
    timestamp: string
    /** Hook type from backend */
    hookType: "notification" | "stop"
    /** Claude session identifier */
    claudeSessionId: string
    /** Full path to session transcript */
    transcriptPath: string
    /** Optional project context path */
    contextWorkDirectory?: string
    /** User external ID */
    userExternalId: string
    /** Unique event ID (replaces old 'id' field) */
    hostEventId: string
}

/**
 * Host details structure from telemetry
 */
export interface HostDetails {
    /** Machine hostname */
    hostname: string
    /** OS platform (e.g., "macos", "linux") */
    platform: string
    /** Internal IP address */
    private_ip?: string
    /** External IP address */
    public_ip?: string
    /** System username */
    username: string
}

/**
 * Daemon details structure from telemetry
 */
export interface DaemonDetails {
    /** Daemon identifier string */
    id: string
    /** Process ID number */
    pid: number
}

/**
 * Tmux session structure from telemetry
 */
export interface TmuxSession {
    /** Tmux session ID */
    session_id: string
    /** Human-readable session name */
    session_name: string
    /** Tmux pane identifier */
    pane_id: string
}

/**
 * Host telemetry structure containing environmental and process context
 */
export interface HostTelemetry {
    /** Host environment details (required) */
    host_details: HostDetails
    /** Daemon process details (optional) */
    daemon_details?: DaemonDetails
    /** Tmux session information (optional) */
    tmux_session?: TmuxSession
}

/**
 * Core notification data structure received from SSE events
 * Updated to match new nested payload structure from Claude Code Hooks service
 */
export interface ClaudeHookEvent {
    /** Main notification message/reason */
    reason: string
    /** Event context and identification */
    hookMetadata: HookMetadata
    /** Rich environmental and process context */
    hostTelemetry: HostTelemetry
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
    /** Machine hostname from host telemetry */
    hostname?: string
    /** Claude session identifier */
    sessionId?: string
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

/**
 * Session group - notifications grouped by Claude session ID
 */
export interface SessionGroup {
    /** Claude session identifier */
    readonly sessionId: string
    /** Array of notifications in this session */
    readonly notifications: NotificationData[]
    /** Count of notifications in this session */
    readonly count: number
    /** Most recent timestamp in this session */
    readonly latestTimestamp: string
}

/**
 * Project group - session groups within a project context
 */
export interface ProjectGroup {
    /** Context identifier (path or 'ungrouped') */
    readonly contextKey: string
    /** Display name for the context */
    readonly contextName: string
    /** Array of session groups in this project */
    readonly sessionGroups: SessionGroup[]
    /** Count of all notifications in this project */
    readonly count: number
    /** Most recent timestamp in this project */
    readonly latestTimestamp: string
}

/**
 * Host group - project groups within a hostname
 */
export interface HostGroup {
    /** Machine hostname from host telemetry */
    readonly hostname: string
    /** Array of project groups in this host */
    readonly projectGroups: ProjectGroup[]
    /** Count of all notifications in this host */
    readonly count: number
    /** Most recent timestamp in this host */
    readonly latestTimestamp: string
}
