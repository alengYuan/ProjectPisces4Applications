import { useCallback, useEffect, useMemo, useState } from 'react'
import { useOtherRemote } from '../model'
import { t } from '../../index'

/**
 * @type {()=>{
 * ariaLabel:string,
 * isSelected:boolean,
 * resetRemote:(isSelected:boolean)=>void,
 * status:string,
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
    const [targetStatus, setTargetStatus] = useState(
        /**
         * @type {undefined|boolean}
         */
        // eslint-disable-next-line no-extra-parens
        (void null),
    )

    const { otherRemote } = useOtherRemote()

    const ariaLabel = useMemo(
        /**
         * @type {()=>string}
         */
        () =>
            `${t({
                en: 'Allow playback commands from the network',
                zh: '允许来自网络的播放指令',
                ja: 'ネットワーク経由の再生操作を許可',
            })}${
                otherRemote
                    ? t({
                        en: ', currently enabled. ',
                        zh: '，当前已启用。',
                        ja: '、現在有効。',
                    })
                    : t({
                        en: ', currently disabled. ',
                        zh: '，当前已禁用。',
                        ja: '、現在無効。',
                    })
            }${t({
                en: 'Enable RMTC to remotely control playback, pause, or track changes of this player via HTTP requests. Please only enable within a secure local network',
                zh: '启用 RMTC，以允许通过 HTTP 请求来远程控制此播放器的播放、暂停或曲目切换，请在安全的局域网内使用',
                ja: 'RMTC を有効にすると、HTTP リクエスト経由で本プレーヤーの再生、一時停止、曲の切替を遠隔操作できます。安全なローカルネットワーク内でご利用ください',
            })}`,
        [otherRemote],
    )

    const status = useMemo(
        /**
         * @type {()=>string}
         */
        () =>
            otherRemote
                ? t({
                    en: 'Enabled',
                    zh: '已启用',
                    ja: '有効',
                })
                : t({
                    en: 'Disabled',
                    zh: '已禁用',
                    ja: '無効',
                }),
        [otherRemote],
    )

    const isOpen = useMemo(
        /**
         * @type {()=>boolean}
         */
        () =>
            typeof targetStatus !== 'undefined' && targetStatus !== otherRemote,
        [targetStatus, otherRemote],
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
                    typeof targetStatus !== 'undefined' &&
                    window['rhythm::setting'].setSettingStorage(
                        'other.remote',
                        targetStatus,
                    )
                },
                content: t({
                    en: 'Apply and reboot',
                    zh: '应用并重启',
                    ja: '適用して再起動',
                }),
            }),
        [targetStatus],
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
                    setTargetStatus(void null)
                },
                content: t({
                    en: 'Cancel',
                    zh: '取消',
                    ja: 'キャンセル',
                }),
            }),
        [],
    )

    const resetRemote = useCallback(
        /**
         * @type {(isSelected:boolean)=>void}
         */
        isSelected => {
            setTargetStatus(isSelected)
        },
        [],
    )

    useEffect(() => {
        const abortController = new AbortController()

        /**
         * @type {()=>void}
         */
        const restoreInterfaceStateHandler = () => {
            !abortController.signal.aborted && setTargetStatus(void null)
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
        ariaLabel,
        isSelected: otherRemote,
        resetRemote,
        status,
        isOpen,
        firstButton,
        closeButton,
    }
}