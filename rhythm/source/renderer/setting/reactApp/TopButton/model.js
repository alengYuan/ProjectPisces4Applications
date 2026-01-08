import { useCallback, useEffect, useState } from 'react'
import { useTooltip } from '../model'
import { t } from '../../index'

/**
 * @type {()=>{
 * windowIsFocused:boolean,
 * viewInFileExplorer:()=>void,
 * handleViewInFileExplorerTooltip:(isHovering:boolean)=>void,
 * }}
 */
export const useTopButton = () => {
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

    const { onHoverChange: handleViewInFileExplorerTooltip } = useTooltip(
        t({
            en: 'View in File Explorer',
            zh: '在文件资源管理器中查看',
            ja: 'エクスプローラーで表示',
        }),
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
        viewInFileExplorer: window['rhythm::setting'].viewInFileExplorer,
        handleViewInFileExplorerTooltip,
    }
}