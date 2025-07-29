import type { NotificationData } from '@/types'

/**
 * Grouped notifications by context
 */
export interface NotificationGroup {
  /** Context identifier (path or 'ungrouped') */
  contextKey: string
  /** Display name for the context */
  contextName: string
  /** Array of notifications in this context */
  notifications: NotificationData[]
  /** Count of notifications in this group */
  count: number
  /** Most recent timestamp in this group */
  latestTimestamp: string
}

/**
 * Groups notifications by their project context
 * Returns groups sorted by most recent activity
 */
export const groupNotificationsByContext = (
  notifications: NotificationData[],
): NotificationGroup[] => {
  const grouped = notifications.reduce<Record<string, NotificationData[]>>(
    (groups, notification) => {
      const contextKey = notification.projectContext ?? 'ungrouped'
      groups[contextKey] ??= []
      groups[contextKey].push(notification)
      return groups
    },
    {},
  )

  const notificationGroups: NotificationGroup[] = Object.entries(grouped).map(
    ([contextKey, groupNotifications]) => {
      const sortedNotifications = [...groupNotifications].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )

      return {
        contextKey,
        contextName: shortenContextPath(contextKey),
        notifications: sortedNotifications,
        count: sortedNotifications.length,
        latestTimestamp: sortedNotifications[0]?.timestamp ?? '',
      }
    },
  )

  return notificationGroups.sort(
    (a, b) => new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime(),
  )
}

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
