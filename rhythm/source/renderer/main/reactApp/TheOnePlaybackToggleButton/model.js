import { useCallback, useEffect, useMemo } from 'react'
import {
    useQueueSourceBasicInformationListIsEmpty,
    useIsPlaying,
    useTooltip,
} from '../model'
import { t } from '../../index'

/**
 * @type {(props:{
 * title:string,
 * artist:string,
 * })=>{
 * isDisabled:boolean,
 * ariaLabel:string,
 * handleButtonPress:(event:import("react-aria-components").PressEvent)=>void,
 * handleTogglePlaybackTooltip:(isHovering:boolean)=>void,
 * isPlaying:boolean,
 * }}
 */
export const useTheOnePlaybackToggleButton = ({ title, artist }) => {
    const { queueSourceBasicInformationListIsEmpty } =
        useQueueSourceBasicInformationListIsEmpty()

    const { isPlaying } = useIsPlaying()

    const ariaLabel = useMemo(
        /**
         * @type {()=>string}
         */
        () =>
            t({
                en: `${isPlaying ? 'Pause' : 'Play'} ${
                    title || 'Unknown Title'
                } by ${artist || 'Unknown Artist'}, shortcut is: Control and P`,
                zh: `${isPlaying ? '暂停' : '播放'}${artist || '未知艺术家'}的${
                    title || '未知标题'
                }，快捷键为：Control 和 P`,
                ja: `${artist || '不明なアーティスト'}の${
                    title || '不明なタイトル'
                }を${isPlaying ? '一時停止' : '再生'}する、ショートカットは、Control キーと P キーです`,
            }),
        [title, artist, isPlaying],
    )

    const tooltip = useMemo(
        /**
         * @type {()=>string}
         */
        () =>
            t({
                en: `${isPlaying ? 'Pause' : 'Play'} (Ctrl+P)`,
                zh: `${isPlaying ? '暂停' : '播放'} (Ctrl+P)`,
                ja: `${isPlaying ? '一時停止' : '再生'} (Ctrl+P)`,
            }),
        [isPlaying],
    )

    const handleButtonPress = useCallback(
        /**
         * @type {()=>void}
         */
        () => {
            isPlaying
                ? window['rhythm::main'].pause()
                : window['rhythm::main'].play()
        },
        [isPlaying],
    )

    const { onHoverChange: handleTogglePlaybackTooltip } = useTooltip(tooltip)

    useEffect(() => {
        /**
         * @type {(event:KeyboardEvent)=>void}
         */
        const keyDownHandler = event => {
            !queueSourceBasicInformationListIsEmpty &&
                !event.repeat &&
                event.ctrlKey &&
                event.code === 'KeyP' &&
                (isPlaying
                    ? window['rhythm::main'].pause()
                    : window['rhythm::main'].play())
        }

        addEventListener('keydown', keyDownHandler)

        return () => {
            removeEventListener('keydown', keyDownHandler)
        }
    }, [queueSourceBasicInformationListIsEmpty, isPlaying])

    return {
        isDisabled: queueSourceBasicInformationListIsEmpty,
        ariaLabel,
        handleButtonPress,
        handleTogglePlaybackTooltip,
        isPlaying,
    }
}