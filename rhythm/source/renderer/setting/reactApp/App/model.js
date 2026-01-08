import { useEffect, useRef } from 'react'

/**
 * @type {()=>{
 * bodyRef:React.MutableRefObject<null|HTMLDivElement>,
 * }}
 */
export const useApp = () => {
    const bodyRef = useRef(
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
            bodyRef.current?.scrollTo({
                top: 0,
                left: 0,
                behavior: 'instant',
            })
        }

        addEventListener(
            'restore-interface-state',
            restoreInterfaceStateHandler,
        )

        return () => {
            removeEventListener(
                'restore-interface-state',
                restoreInterfaceStateHandler,
            )
        }
    }, [])

    return {
        bodyRef,
    }
}