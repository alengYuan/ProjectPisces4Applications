import { useEffect, useMemo } from 'react'
import {
    useQueueSourceBasicInformationListIsEmpty,
    useQueueOrderLoop,
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
export const useOrderLoopSwitchButton = () => {
    const { queueSourceBasicInformationListIsEmpty } =
        useQueueSourceBasicInformationListIsEmpty()

    const { queueOrderLoop } = useQueueOrderLoop()

    const ariaLabel = useMemo(
        /**
         * @type {()=>string}
         */
        () =>
            t({
                en: `Switch repeat mode, currently set to ${
                    {
                        all: 'All',
                        single: 'Single',
                        off: 'Off',
                    }[queueOrderLoop]
                }, shortcut is: Control and T`,
                zh: `切换循环模式，当前为${
                    {
                        all: '循环全部',
                        single: '单曲循环',
                        off: '不循环',
                    }[queueOrderLoop]
                }，快捷键为：Control 和 T`,
                ja: `リピートモードを切り替え、${
                    {
                        all: '全曲リピート',
                        single: '一曲リピート',
                        off: 'リピート停止',
                    }[queueOrderLoop]
                }中です、ショートカットは、Control キーと T キーです`,
            }),
        [queueOrderLoop],
    )

    const tooltip = useMemo(
        /**
         * @type {()=>string}
         */
        () =>
            t({
                en: `Repeat: ${
                    {
                        all: 'All',
                        single: 'Single',
                        off: 'Off',
                    }[queueOrderLoop]
                } (Ctrl+T)`,
                zh: `循环：${
                    {
                        all: '全部',
                        single: '单曲',
                        off: '关闭',
                    }[queueOrderLoop]
                } (Ctrl+T)`,
                ja: `リピート：${
                    {
                        all: '全て',
                        single: '一曲',
                        off: 'オフ',
                    }[queueOrderLoop]
                } (Ctrl+T)`,
            }),
        [queueOrderLoop],
    )

    const content = useMemo(
        /**
         * @type {()=>string}
         */
        () =>
            ({
                all: '',
                single: '',
                off: '',
            })[queueOrderLoop],
        [queueOrderLoop],
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
                event.code === 'KeyT' &&
                window['rhythm::main'].switchQueueOrderLoop()
        }

        addEventListener('keydown', keyDownHandler)

        return () => {
            removeEventListener('keydown', keyDownHandler)
        }
    }, [queueSourceBasicInformationListIsEmpty])

    return {
        ariaLabel,
        isDisabled: queueSourceBasicInformationListIsEmpty,
        onPress: window['rhythm::main'].switchQueueOrderLoop,
        onHoverChange,
        content,
    }
}