import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { darkTheme, lightTheme } from '@/theme'

import type { ThemeMode } from '@/types/theme'
import { ThemeContext } from './createThemeContext'

const THEME_STORAGE_KEY = 'claude-dashboard-theme'

// Detect system theme preference
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('system')
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light')

  // Resolve actual theme based on user preference and system
  const resolveTheme = useCallback((mode: ThemeMode): 'light' | 'dark' => {
    if (mode === 'system') {
      return getSystemTheme()
    }
    return mode
  }, [])

  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeMode(savedTheme)
      } else {
        setThemeMode('system')
      }
    } catch {
      // Handle localStorage errors by defaulting to system theme
      setThemeMode('system')
    }
  }, [])

  // Update actual theme when themeMode changes
  useEffect(() => {
    const resolved = resolveTheme(themeMode)
    setActualTheme(resolved)
  }, [themeMode, resolveTheme])

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (themeMode !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      setActualTheme(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [themeMode])

  const handleThemeModeChange = useCallback((mode: ThemeMode) => {
    setThemeMode(mode)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode)
    } catch {
      // Silently handle localStorage errors (e.g., when localStorage is unavailable)
    }
  }, [])

  const currentTheme = actualTheme === 'dark' ? darkTheme : lightTheme

  const contextValue = useMemo(
    () => ({
      themeMode,
      actualTheme,
      currentTheme,
      setThemeMode: handleThemeModeChange,
    }),
    [themeMode, actualTheme, currentTheme, handleThemeModeChange],
  )

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
}
