import { useEffect, useMemo } from 'react'
import {
    useQueueSourceBasicInformationListIsEmpty,
    useQueueOrderMode,
    useTooltip,
} from '../model'
import { t } from '../../index'

/**
 * @type {()=>{
 * ariaLabel:string,
 * isDisabled:boolean,
 * onPress:(event:import("react-aria-components").PressEvent)=>void,
 * onHoverChange:(isHovering:boolean)=>void,
 * content:string,
 * }}
 */
export const useOrderModeSwitchButton = () => {
    const { queueSourceBasicInformationListIsEmpty } =
        useQueueSourceBasicInformationListIsEmpty()

    const { queueOrderMode } = useQueueOrderMode()

    const ariaLabel = useMemo(
        /**
         * @type {()=>string}
         */
        () =>
            t({
                en: `Switch playback mode, currently set to ${
                    {
                        sequential: 'Sequential',
                        shuffle: 'Shuffle',
                        random: 'Random',
                    }[queueOrderMode]
                }, shortcut is: Control and O`,
                zh: `切换播放模式，当前为${
                    {
                        sequential: '顺序',
                        shuffle: '乱序',
                        random: '随机',
                    }[queueOrderMode]
                }播放，快捷键为：Control 和 O`,
                ja: `再生モードを切り替え、現在、${
                    {
                        sequential: '順番',
                        shuffle: '乱序',
                        random: 'ランダム',
                    }[queueOrderMode]
                }再生モードです、ショートカットは、Control キーと O キーです`,
            }),
        [queueOrderMode],
    )

    const tooltip = useMemo(
        /**
         * @type {()=>string}
         */
        () =>
            t({
                en: `Order: ${
                    {
                        sequential: 'Sequential',
                        shuffle: 'Shuffle',
                        random: 'Random',
                    }[queueOrderMode]
                } (Ctrl+O)`,
                zh: `队列：${
                    {
                        sequential: '顺序',
                        shuffle: '乱序',
                        random: '随机',
                    }[queueOrderMode]
                } (Ctrl+O)`,
                ja: `並び：${
                    {
                        sequential: '順番',
                        shuffle: '乱序',
                        random: 'ランダム',
                    }[queueOrderMode]
                } (Ctrl+O)`,
            }),
        [queueOrderMode],
    )

    const content = useMemo(
        /**
         * @type {()=>string}
         */
        () =>
            ({
                sequential: '',
                shuffle: '',
                random: '',
            })[queueOrderMode],
        [queueOrderMode],
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
                event.code === 'KeyO' &&
                window['rhythm::main'].switchQueueOrderMode()
        }

        addEventListener('keydown', keyDownHandler)

        return () => {
            removeEventListener('keydown', keyDownHandler)
        }
    }, [queueSourceBasicInformationListIsEmpty])

    return {
        ariaLabel,
        isDisabled: queueSourceBasicInformationListIsEmpty,
        onPress: window['rhythm::main'].switchQueueOrderMode,
        onHoverChange,
        content,
    }
}