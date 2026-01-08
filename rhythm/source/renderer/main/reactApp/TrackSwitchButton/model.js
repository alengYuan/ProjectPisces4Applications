import { useCallback, useEffect, useMemo } from 'react'
import { useQueueSourceBasicInformationListIsEmpty, useTooltip } from '../model'
import { t } from '../../index'

/**
 * @type {(props:{
 * target:'previous'|'next',
 * })=>{
 * ariaLabel:string,
 * isDisabled:boolean,
 * onPress:(event:import("react-aria-components").PressEvent)=>void,
 * onHoverChange:(isHovering:boolean)=>void,
 * content:string,
 * }}
 */
export const useTrackSwitchButton = ({ target }) => {
    const { queueSourceBasicInformationListIsEmpty } =
        useQueueSourceBasicInformationListIsEmpty()

    const ariaLabel = useMemo(
        /**
         * @type {()=>string}
         */
        () =>
            ({
                previous: t({
                    en: 'Previous, shortcut is: Control and B',
                    zh: '上一首，快捷键为：Control 和 B',
                    ja: '前へ、ショートカットは、Control キーと B キーです',
                }),
                next: t({
                    en: 'Next, shortcut is: Control and F',
                    zh: '下一首，快捷键为：Control 和 F',
                    ja: '次へ、ショートカットは、Control キーと F キーです',
                }),
            })[target],
        [target],
    )

    const tooltip = useMemo(
        /**
         * @type {()=>string}
         */
        () =>
            ({
                previous: t({
                    en: 'Previous (Ctrl+B)',
                    zh: '上一首 (Ctrl+B)',
                    ja: '前へ (Ctrl+B)',
                }),
                next: t({
                    en: 'Next (Ctrl+F)',
                    zh: '下一首 (Ctrl+F)',
                    ja: '次へ (Ctrl+F)',
                }),
            })[target],
        [target],
    )

    const content = useMemo(
        /**
         * @type {()=>string}
         */
        () =>
            ({
                previous: '',
                next: '',
            })[target],
        [target],
    )

    const onPress = useCallback(
        /**
         * @type {()=>void}
         */
        () => {
            ({
                previous: window['rhythm::main'].requestPreviousTrack,
                next: window['rhythm::main'].requestNextTrack,
            })[target]()
        },
        [target],
    )

    const { onHoverChange } = useTooltip(tooltip)

    useEffect(() => {
        /**
         * @type {(event:KeyboardEvent)=>void}
         */
        const keyDownHandler = event => {
            !queueSourceBasicInformationListIsEmpty &&
                !event.repeat &&
                event.ctrlKey &&
                event.code ===
                    {
                        previous: 'KeyB',
                        next: 'KeyF',
                    }[target] &&
                {
                    previous: window['rhythm::main'].requestPreviousTrack,
                    next: window['rhythm::main'].requestNextTrack,
                }[target]()
        }

        addEventListener('keydown', keyDownHandler)

        return () => {
            removeEventListener('keydown', keyDownHandler)
        }
    }, [target, queueSourceBasicInformationListIsEmpty])

    return {
        ariaLabel,
        isDisabled: queueSourceBasicInformationListIsEmpty,
        onPress,
        onHoverChange,
        content,
    }
}