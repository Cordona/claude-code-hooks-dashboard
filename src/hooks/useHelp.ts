import { useContext } from 'react'
import { HelpContext } from '@/contexts/HelpContext'

interface UseHelpReturn {
  isHelpOpen: boolean
  openHelp: () => void
  closeHelp: () => void
  toggleHelp: () => void
}

export const useHelp = (): UseHelpReturn => {
  const context = useContext(HelpContext)

  if (!context) {
    throw new Error('useHelp must be used within a HelpProvider')
  }

  return context
}
