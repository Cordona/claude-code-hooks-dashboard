import React from 'react'
import PropTypes from 'prop-types'
import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import { Computer, DarkMode, WbSunny } from '@mui/icons-material'
import { useTheme } from '@/hooks'
import type { ThemeMode } from '@/types/theme'

interface ThemeSwitcherProps {
  size?: 'small' | 'medium' | 'large'
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = React.memo(({ size = 'small' }) => {
  const { themeMode, setThemeMode } = useTheme()

  const handleThemeChange = (_event: React.MouseEvent<HTMLElement>, newTheme: ThemeMode | null) => {
    if (newTheme !== null) {
      setThemeMode(newTheme)
    }
  }

  return (
    <ToggleButtonGroup
      value={themeMode}
      exclusive
      onChange={handleThemeChange}
      aria-label="theme switcher"
      size={size}
      sx={{
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: 2,
        '& .MuiToggleButtonGroup-grouped': {
          border: 'none',
          borderRadius: 1.5,
          '&:not(:first-of-type)': {
            borderLeft: 'none',
            marginLeft: 0.5,
          },
        },
        '& .MuiToggleButton-root': {
          border: 'none',
          color: 'text.secondary',
          backgroundColor: 'transparent',
          minWidth: 32,
          minHeight: 32,
          padding: 0.5,
          transition: 'all 0.2s ease-in-out',
          '&.Mui-selected': {
            backgroundColor: 'action.selected',
            color: 'text.primary',
            '&:hover': {
              backgroundColor: 'action.selected',
            },
          },
          '&:hover': {
            backgroundColor: 'action.hover',
            color: 'text.primary',
          },
        },
      }}
    >
      <ToggleButton value="light" aria-label="light theme">
        <WbSunny sx={{ fontSize: 18, opacity: 0.8 }} />
      </ToggleButton>
      <ToggleButton value="dark" aria-label="dark theme">
        <DarkMode sx={{ fontSize: 18, opacity: 0.8 }} />
      </ToggleButton>
      <ToggleButton value="system" aria-label="system theme">
        <Computer sx={{ fontSize: 18, opacity: 0.8 }} />
      </ToggleButton>
    </ToggleButtonGroup>
  )
})

ThemeSwitcher.displayName = 'ThemeSwitcher'

ThemeSwitcher.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
}
