/**
 * Uptime Feature Types
 * TypeScript interfaces for application uptime tracking functionality
 */

/**
 * Internal state for uptime tracking
 */
export interface UptimeState {
  /** Timestamp when uptime tracking started (in milliseconds) */
  startTime: number
  /** Current timestamp (in milliseconds) */
  currentTime: number
  /** Calculated uptime duration (in milliseconds) */
  uptime: number
}

/**
 * Hook return interface for useUptime
 */
export interface UseUptimeReturn {
  /** Current uptime duration in milliseconds */
  uptime: number
  /** Formatted uptime string in HH:MM:SS format */
  formattedUptime: string
  /** Function to reset uptime to zero */
  reset: () => void
  /** Whether uptime tracking is active */
  isTracking: boolean
}

/**
 * Configuration options for uptime tracking
 */
export interface UptimeConfig {
  /** Update interval in milliseconds (default: 1000) */
  updateInterval?: number
  /** Whether to start tracking immediately (default: true) */
  autoStart?: boolean
}
