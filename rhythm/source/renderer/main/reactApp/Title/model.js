import { useCallback, useEffect, useState } from 'react'

/**
 * @type {()=>{
 * windowIsFocused:boolean,
 * }}
 */
export const useTitle = () => {
    const [windowIsFocused, setWindowIsFocused] = useState(false)

    const focusWindowHandler = useCallback(
        /**
         * @type {()=>void}
         */
        () => {
            setWindowIsFocused(true)
        },
        [],
    )

    const blurWindowHandler = useCallback(
        /**
         * @type {()=>void}
         */
        () => {
            setWindowIsFocused(false)
        },
        [],
    )

    useEffect(
        () =>
            window['rhythm::main'].focusWindow(focusWindowHandler),
        [focusWindowHandler],
    )

    useEffect(
        () =>
            window['rhythm::main'].blurWindow(blurWindowHandler),
        [blurWindowHandler],
    )

    return {
        windowIsFocused,
    }
}