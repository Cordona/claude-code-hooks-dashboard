/**
 * Menu Structure Types
 * TypeScript interfaces for an accordion-style menu system
 */

import type { ReactNode } from 'react'

/**
 * Base menu item interface
 */
export interface BaseMenuItem {
  /** Unique identifier for the menu item */
  id: string
  /** Display label for the menu item */
  label: string
  /** Icon component to display */
  icon: ReactNode
  /** Whether the item is disabled */
  disabled?: boolean
}

/**
 * Simple clickable menu item
 */
export interface SimpleMenuItem extends BaseMenuItem {
  /** Click handler for the menu item */
  onClick: () => void
  /** Type identifier */
  type: 'simple'
}

/**
 * Display-only menu item (like uptime)
 */
export interface DisplayMenuItem extends BaseMenuItem {
  /** Value to display */
  value: string
  /** Type identifier */
  type: 'display'
}

/**
 * Collapsible section with nested items
 */
export interface CollapsibleSection extends BaseMenuItem {
  /** Array of items within this section */
  items: (SimpleMenuItem | DisplayMenuItem)[]
  /** Type identifier */
  type: 'collapsible'
  /** Whether section is initially expanded */
  defaultExpanded?: boolean
}

/**
 * Union type for all menu item types
 */
export type MenuItem = SimpleMenuItem | DisplayMenuItem | CollapsibleSection
