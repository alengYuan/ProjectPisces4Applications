import { useEffect, useRef } from 'react'

/**
 * @type {()=>{
 * cursorDockRef:React.MutableRefObject<null|HTMLDivElement>,
 * }}
 */
export const useCursorDock = () => {
    const cursorDockRef = useRef(
        /**
         * @type {null|HTMLDivElement}
         */
        // eslint-disable-next-line no-extra-parens
        (null),
    )

    useEffect(() => {
        /**
         * @type {()=>void}
         */
        const restoreInterfaceStateHandler = () => {
            cursorDockRef.current?.focus()
        }

        addEventListener(
            'restore-interface-state',
            restoreInterfaceStateHandler,
        )

        cursorDockRef.current?.focus()

        return () => {
            removeEventListener(
                'restore-interface-state',
                restoreInterfaceStateHandler,
            )
        }
    }, [])

    return {
        cursorDockRef,
    }
}