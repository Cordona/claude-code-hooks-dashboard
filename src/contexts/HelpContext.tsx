import React, {createContext, useCallback, useEffect, useMemo, useState} from 'react'

interface HelpContextValue {
    isHelpOpen: boolean
    openHelp: () => void
    closeHelp: () => void
    toggleHelp: () => void
}

const HelpContext = createContext<HelpContextValue | null>(null)

interface HelpProviderProps {
    children: React.ReactNode
}

export const HelpProvider: React.FC<HelpProviderProps> = ({children}) => {
    const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false)

    const openHelp = useCallback((): void => {
        setIsHelpOpen(true)
    }, [])

    const closeHelp = useCallback((): void => {
        setIsHelpOpen(false)
    }, [])

    const toggleHelp = useCallback((): void => {
        setIsHelpOpen((prev) => !prev)
    }, [])

    // ESC key to close help
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent): void => {
            // ESC to close help
            if (event.key === 'Escape' && isHelpOpen) {
                event.preventDefault()
                closeHelp()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isHelpOpen, closeHelp])

    const value: HelpContextValue = useMemo(
        () => ({
            isHelpOpen,
            openHelp,
            closeHelp,
            toggleHelp,
        }),
        [isHelpOpen, openHelp, closeHelp, toggleHelp],
    )

    return <HelpContext.Provider value={value}>{children}</HelpContext.Provider>
}

HelpProvider.displayName = 'HelpProvider'

export {HelpContext}
