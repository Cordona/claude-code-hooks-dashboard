import type {NotificationData, SessionGroup, ProjectGroup, HostGroup} from '@/types'


/**
 * Formats context path into user-friendly display name
 * Extracts last folder name and converts to a title case
 *
 * Examples:
 * ~/IdeaProjects/cordona/claude-code-hooks-dashboard → Claude Code Hooks Dashboard
 * ~/projects/my_awesome_project → My Awesome Project
 * ~/dev/some.folder.name → Some Folder Name
 */
export const formatContextDisplayName = (contextPath: string): string => {
    if (contextPath === 'ungrouped' || !contextPath) {
        return 'General'
    }

    // Extract the last folder name from the path
    const lastFolder = contextPath.split(/[/\\]/).pop() ?? ''

    if (!lastFolder) {
        return 'General'
    }

    // Remove common concatenation symbols and replace with spaces
    const cleanedName = lastFolder
        .replace(/[-_.]/g, ' ') // Replace hyphens, underscores, dots with spaces
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim() // Remove leading/trailing spaces

    // Convert to a title case (capitalize the first letter of each word)
    const titleCased = cleanedName
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')

    return titleCased || 'General'
}

/**
 * Shortens context path for display
 * Now uses formatContextDisplayName for user-friendly names
 */
export const shortenContextPath = (contextPath: string): string => {
    return formatContextDisplayName(contextPath)
}

/**
 * Empty state messages for when there are no notifications
 */
const EMPTY_STATE_MESSAGES = [
    'All clear',
    'All caught up',
    'Inbox zero achieved',
    'Clean slate',
    'No hooks in sight',
    'Hook-free zone',
    'Radio silence',
    'Peaceful waters',
    'Serene state',
] as const

/**
 * Gets a random empty state message
 */
export const getRandomEmptyStateMessage = (): string => {
    const randomIndex = Math.floor(Math.random() * EMPTY_STATE_MESSAGES.length)
    return EMPTY_STATE_MESSAGES[randomIndex] ?? 'All clear!'
}

/**
 * Groups notifications by Claude session ID
 * Returns session groups sorted by most recent activity
 */
export const groupNotificationsBySession = (
    notifications: NotificationData[],
): SessionGroup[] => {
    const grouped = notifications.reduce<Record<string, NotificationData[]>>(
        (groups, notification) => {
            const sessionKey = notification.sessionId ?? 'unknown-session'
            groups[sessionKey] ??= []
            groups[sessionKey].push(notification)
            return groups
        },
        {},
    )

    const sessionGroups: SessionGroup[] = Object.entries(grouped).map(
        ([sessionId, groupNotifications]) => {
            const sortedNotifications = [...groupNotifications].sort(
                (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
            )

            return {
                sessionId,
                notifications: sortedNotifications,
                count: sortedNotifications.length,
                latestTimestamp: sortedNotifications[0]?.timestamp ?? '',
            }
        },
    )

    return sessionGroups.sort(
        (a, b) => new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime(),
    )
}

/**
 * Groups notifications by project context with session subgroups
 * Returns project groups sorted by most recent activity
 */
export const groupNotificationsByProject = (
    notifications: NotificationData[],
): ProjectGroup[] => {
    const grouped = notifications.reduce<Record<string, NotificationData[]>>(
        (groups, notification) => {
            const contextKey = notification.projectContext ?? 'ungrouped'
            groups[contextKey] ??= []
            groups[contextKey].push(notification)
            return groups
        },
        {},
    )

    const projectGroups: ProjectGroup[] = Object.entries(grouped).map(
        ([contextKey, groupNotifications]) => {
            const sessionGroups = groupNotificationsBySession(groupNotifications)
            const allNotificationsCount = groupNotifications.length
            const latestTimestamp = sessionGroups[0]?.latestTimestamp ?? ''

            return {
                contextKey,
                contextName: shortenContextPath(contextKey),
                sessionGroups,
                count: allNotificationsCount,
                latestTimestamp,
            }
        },
    )

    return projectGroups.sort(
        (a, b) => new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime(),
    )
}

/**
 * Groups notifications by hostname with project and session subgroups
 * Returns host groups sorted by most recent activity
 */
export const groupNotificationsByHost = (
    notifications: NotificationData[],
): HostGroup[] => {
    const grouped = notifications.reduce<Record<string, NotificationData[]>>(
        (groups, notification) => {
            const hostname = notification.hostname ?? 'Unknown Host'
            groups[hostname] ??= []
            groups[hostname].push(notification)
            return groups
        },
        {},
    )

    const hostGroups: HostGroup[] = Object.entries(grouped).map(
        ([hostname, groupNotifications]) => {
            const projectGroups = groupNotificationsByProject(groupNotifications)
            const allNotificationsCount = groupNotifications.length
            const latestTimestamp = projectGroups[0]?.latestTimestamp ?? ''

            return {
                hostname,
                projectGroups,
                count: allNotificationsCount,
                latestTimestamp,
            }
        },
    )

    return hostGroups.sort(
        (a, b) => new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime(),
    )
}

/**
 * Main three-level grouping function: Host > Project > Session
 * Returns notifications organized in complete hierarchy
 * Sorted by most recent activity at each level
 */
export const groupNotificationsByHostProjectSession = (
    notifications: NotificationData[],
): HostGroup[] => {
    return groupNotificationsByHost(notifications)
}
