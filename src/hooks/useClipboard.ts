import {useCallback, useState} from 'react'

/**
 * Custom hook for clipboard operations with visual feedback
 * Provides consistent clipboard functionality across components
 */
export const useClipboard = () => {
    const [copiedItemId, setCopiedItemId] = useState<string | null>(null)

    /**
     * Copy text to clipboard with visual feedback
     */
    const copyToClipboard = useCallback(async (text: string, itemId: string): Promise<void> => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedItemId(itemId)
            setTimeout(() => setCopiedItemId(null), 2000)

            if (process.env.NODE_ENV === 'development') {
                // eslint-disable-next-line no-console
                console.log(`📋 ${itemId} copied to clipboard:`, text)
            }
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                // eslint-disable-next-line no-console
                console.error('Failed to copy to clipboard:', error)
            }
        }
    }, [])

    /**
     * Check if a specific item was recently copied
     */
    const isCopied = useCallback((itemId: string): boolean => {
        return copiedItemId === itemId
    }, [copiedItemId])

    return {
        copyToClipboard,
        isCopied,
    }
}