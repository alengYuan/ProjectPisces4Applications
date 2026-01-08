import { useCallback, useEffect, useMemo, useState } from 'react'
import { useGeneralLanguage } from '../model'
import { t } from '../../index'

/**
 * @type {()=>{
 * currentValue:'en'|'zh'|'ja',
 * changeLanguage:(event:import("react-aria-components").PressEvent)=>void,
 * isOpen:boolean,
 * firstButton:{
 * isDefault:true,
 * onPress:(event:import("react-aria-components").PressEvent)=>void,
 * content:string,
 * },
 * closeButton:{
 * onPress:(event:import("react-aria-components").PressEvent)=>void,
 * content:string,
 * },
 * }}
 */
export const useActionArea = () => {
    const [targetValue, setTargetValue] = useState(
        /**
         * @type {undefined|'en'|'zh'|'ja'}
         */
        // eslint-disable-next-line no-extra-parens
        (void null),
    )

    const { generalLanguage } = useGeneralLanguage()

    const isOpen = useMemo(
        /**
         * @type {()=>boolean}
         */
        () =>
            typeof targetValue !== 'undefined' &&
            targetValue !== generalLanguage,
        [targetValue, generalLanguage],
    )

    const firstButton = useMemo(
        /**
         * @type {()=>{
         * isDefault:true,
         * onPress:(event:import("react-aria-components").PressEvent)=>void,
         * content:string,
         * }}
         */
        () =>
            ({
                isDefault: true,
                onPress: () => {
                    typeof targetValue !== 'undefined' &&
                    window['rhythm::setting'].setSettingStorage(
                        'general.language',
                        targetValue,
                    )
                },
                content: t({
                    en: 'Apply and reboot',
                    zh: '应用并重启',
                    ja: '適用して再起動',
                }),
            }),
        [targetValue],
    )

    const closeButton = useMemo(
        /**
         * @type {()=>{
         * onPress:(event:import("react-aria-components").PressEvent)=>void,
         * content:string,
         * }}
         */
        () =>
            ({
                onPress: () => {
                    setTargetValue(void null)
                },
                content: t({
                    en: 'Cancel',
                    zh: '取消',
                    ja: 'キャンセル',
                }),
            }),
        [],
    )

    const changeLanguage = useCallback(
        /**
         * @type {(event:import("react-aria-components").PressEvent)=>void}
         */
        event => {
            const element =
                event.target instanceof HTMLLabelElement
                    ? event.target.firstChild?.firstChild
                    : event.target instanceof HTMLSpanElement
                        ? event.target.firstChild
                        : event.target
            if (element instanceof HTMLInputElement) {
                const value = element.value
                if (['en', 'zh', 'ja'].includes(value)) {
                    setTargetValue(
                        /**
                         * @type {undefined|'en'|'zh'|'ja'}
                         */
                        // eslint-disable-next-line no-extra-parens
                        (value),
                    )
                }
            }
        },
        [],
    )

    useEffect(() => {
        const abortController = new AbortController()

        /**
         * @type {()=>void}
         */
        const restoreInterfaceStateHandler = () => {
            !abortController.signal.aborted && setTargetValue(void null)
        }

        addEventListener(
            'restore-interface-state',
            restoreInterfaceStateHandler,
        )

        return () => {
            abortController.abort()

            removeEventListener(
                'restore-interface-state',
                restoreInterfaceStateHandler,
            )
        }
    }, [])

    return {
        currentValue: generalLanguage,
        changeLanguage,
        isOpen,
        firstButton,
        closeButton,
    }
}

/**
 * @type {()=>{
 * isExpanded:boolean,
 * switchPanel:()=>void,
 * status:string,
 * }}
 */
export const useItemGeneralLanguage = () => {
    const [isExpanded, setIsExpanded] = useState(false)

    const { generalLanguage } = useGeneralLanguage()

    const status = useMemo(
        /**
         * @type {()=>string}
         */
        () =>
            ({
                en: 'English',
                zh: '简体中文',
                ja: '日本語',
            })[generalLanguage],
        [generalLanguage],
    )

    const switchPanel = useCallback(
        /**
         * @type {()=>void}
         */
        () => {
            setIsExpanded(previousValue =>
                !previousValue)
        },
        [],
    )

    useEffect(() => {
        const abortController = new AbortController()

        /**
         * @type {()=>void}
         */
        const restoreInterfaceStateHandler = () => {
            !abortController.signal.aborted && setIsExpanded(false)
        }

        addEventListener(
            'restore-interface-state',
            restoreInterfaceStateHandler,
        )

        return () => {
            abortController.abort()

            removeEventListener(
                'restore-interface-state',
                restoreInterfaceStateHandler,
            )
        }
    }, [])

    return {
        isExpanded,
        switchPanel,
        status,
    }
}