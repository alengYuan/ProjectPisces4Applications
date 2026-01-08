import { useCallback, useEffect, useState } from 'react'
import { useTooltip } from '../model'
import { t } from '../../index'

/**
 * @type {()=>{
 * windowIsFocused:boolean,
 * switchSceneMode:()=>void,
 * handleSwitchSceneModeTooltip:(isHovering:boolean)=>void,
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

    const { onHoverChange: handleSwitchSceneModeTooltip } = useTooltip(
        t({
            en: 'Switch scene mode',
            zh: '切换情景模式',
            ja: 'シーンモードを切り替え',
        }),
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
        switchSceneMode: window['rhythm::main'].switchSceneMode,
        handleSwitchSceneModeTooltip,
    }
}