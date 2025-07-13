import { createContext } from 'react'
import type { Theme } from '@mui/material/styles'
import type { ThemeMode } from '@/types/theme'

export interface ThemeContextType {
  themeMode: ThemeMode
  actualTheme: 'light' | 'dark'
  currentTheme: Theme
  setThemeMode: (mode: ThemeMode) => void
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)
