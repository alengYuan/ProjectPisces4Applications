import { useEffect, useState } from 'react'

/**
 * @type {()=>{
 * isInteractive:boolean,
 * }}
 */
export const useTitleBar = () => {
    const [isInteractive, setIsInteractive] = useState(true)

    useEffect(() => {
        const abortController = new AbortController()

        /**
         * @type {()=>void}
         */
        const requestAssistEmbeddedDialogHandler = () => {
            window['rhythm::setting'].switchDialogVisibility(true)

            !abortController.signal.aborted && setIsInteractive(false)
        }

        addEventListener(
            'request-assist-embedded-dialog',
            requestAssistEmbeddedDialogHandler,
        )

        /**
         * @type {()=>void}
         */
        const cancelAssistEmbeddedDialogHandler = () => {
            window['rhythm::setting'].switchDialogVisibility(false)

            !abortController.signal.aborted && setIsInteractive(true)
        }

        addEventListener(
            'cancel-assist-embedded-dialog',
            cancelAssistEmbeddedDialogHandler,
        )

        return () => {
            abortController.abort()

            removeEventListener(
                'cancel-assist-embedded-dialog',
                cancelAssistEmbeddedDialogHandler,
            )

            removeEventListener(
                'request-assist-embedded-dialog',
                requestAssistEmbeddedDialogHandler,
            )
        }
    }, [])

    return {
        isInteractive,
    }
}