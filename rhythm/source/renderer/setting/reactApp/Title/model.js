import { useCallback, useEffect, useState } from 'react'

/**
 * @type {()=>{
 * windowIsFocused:boolean,
 * windowTitle:string,
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
            window['rhythm::setting'].focusWindow(focusWindowHandler),
        [focusWindowHandler],
    )

    useEffect(
        () =>
            window['rhythm::setting'].blurWindow(blurWindowHandler),
        [blurWindowHandler],
    )

    return {
        windowIsFocused,
        windowTitle: document.title,
    }
}