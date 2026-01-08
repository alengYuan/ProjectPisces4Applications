import { useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { useButton, useFocusRing, useHover, mergeProps } from 'react-aria'
import {
    useCurrentPageType,
    useCurrentPageGroupBy,
    useCurrentPageGroupName,
    useQueueSourceType,
    useQueueSourceGroupBy,
    useQueueSourceGroupName,
    useQueueAtIdentification,
    useIsPlaying,
    useTooltip,
} from '../model'
import { NIL as nil } from 'uuid'
import { CursorIndexContext } from '../LibraryContentContainer/model'
import { t } from '../../index'

/**
 * @type {(event:import("react-aria-components").PressEvent)=>void}
 */
const playFromHere = event => {
    const element = event.target
    if (element instanceof HTMLElement) {
        dispatchEvent(
            new CustomEvent('play-from-here', {
                detail: {
                    uuid: element.dataset.uuid ?? nil,
                },
            }),
        )
    }
}

/**
 * @type {(props:{
 * index:number,
 * uuid:string,
 * title:string,
 * artist:string,
 * })=>{
 * reactARIAProps:React.ButtonHTMLAttributes<
 * HTMLButtonElement
 * >&React.DOMAttributes<
 * import("@react-types/shared").FocusableElement
 * >,
 * playbackToggleButtonRef:React.MutableRefObject<null|HTMLButtonElement>,
 * ariaLabel:string,
 * reactARIAPseudoClassesDataset:{
 * 'data-hovered'?:true,
 * 'data-pressed'?:true,
 * 'data-focused'?:true,
 * 'data-focus-visible'?:true,
 * },
 * uuid:string,
 * isPlaying:boolean,
 * }}
 */
export const usePlaybackToggleButton = ({ index, uuid, title, artist }) => {
    const playbackToggleButtonRef = useRef(
        /**
         * @type {null|HTMLButtonElement}
         */
        // eslint-disable-next-line no-extra-parens
        (null),
    )

    const cursorIndex = useContext(CursorIndexContext)

    const { currentPageType } = useCurrentPageType()

    const { currentPageGroupBy } = useCurrentPageGroupBy()

    const { currentPageGroupName } = useCurrentPageGroupName()

    const { queueSourceType } = useQueueSourceType()

    const { queueSourceGroupBy } = useQueueSourceGroupBy()

    const { queueSourceGroupName } = useQueueSourceGroupName()

    const { queueAtIdentification } = useQueueAtIdentification()

    const { isPlaying: isGlobalPlaying } = useIsPlaying()

    const isAccessible = useMemo(
        /**
         * @type {()=>boolean}
         */
        () =>
            cursorIndex === index,
        [index, cursorIndex],
    )

    const isPlaying = useMemo(
        /**
         * @type {()=>boolean}
         */
        () =>
            isGlobalPlaying &&
            currentPageType === queueSourceType &&
            currentPageGroupBy === queueSourceGroupBy &&
            currentPageGroupName === queueSourceGroupName &&
            uuid === queueAtIdentification,
        [
            uuid,
            currentPageType,
            currentPageGroupBy,
            currentPageGroupName,
            queueSourceType,
            queueSourceGroupBy,
            queueSourceGroupName,
            queueAtIdentification,
            isGlobalPlaying,
        ],
    )

    const ariaLabel = useMemo(
        /**
         * @type {()=>string}
         */
        () =>
            t({
                en: `${isPlaying ? 'Stop' : 'Play'} ${
                    title || 'Unknown Title'
                } by ${artist || 'Unknown Artist'}`,
                zh: `${isPlaying ? '停止' : '播放'}${artist || '未知艺术家'}的${
                    title || '未知标题'
                }`,
                ja: `${artist || '不明なアーティスト'}の${
                    title || '不明なタイトル'
                }を${isPlaying ? '停止' : '再生'}する`,
            }),
        [title, artist, isPlaying],
    )

    const tooltip = useMemo(
        /**
         * @type {()=>string}
         */
        () =>
            isPlaying
                ? t({
                    en: 'Stop',
                    zh: '停止',
                    ja: '停止',
                })
                : t({
                    en: 'Play',
                    zh: '播放',
                    ja: '再生',
                }),
        [isPlaying],
    )

    const handleButtonPress = useCallback(
        /**
         * @type {(event:import("react-aria-components").PressEvent)=>void}
         */
        event => {
            isPlaying
                ? window['rhythm::main'].stopFromHere()
                : playFromHere(event)

            dispatchEvent(
                new CustomEvent('calibrate-cursor-position', {
                    detail: {
                        cursorIndex: index,
                    },
                }),
            )
        },
        [index, isPlaying],
    )

    const { onHoverChange: handleTogglePlaybackTooltip } = useTooltip(tooltip)

    const propsOfUseButton = useMemo(
        () =>
            ({
                excludeFromTabOrder: !isAccessible,
                onPress: handleButtonPress,
            }),
        [isAccessible, handleButtonPress],
    )

    const propsOfUseHover = useMemo(
        () =>
            ({
                onHoverChange: handleTogglePlaybackTooltip,
            }),
        [handleTogglePlaybackTooltip],
    )

    const { buttonProps, isPressed } = useButton(
        propsOfUseButton,
        playbackToggleButtonRef,
    )

    const { focusProps, isFocused, isFocusVisible } = useFocusRing()

    const { hoverProps, isHovered } = useHover(propsOfUseHover)

    const reactARIAProps = useMemo(
        /**
         * @type {()=>React.ButtonHTMLAttributes<
         * HTMLButtonElement
         * >&React.DOMAttributes<
         * import("@react-types/shared").FocusableElement
         * >}
         */
        () =>
            mergeProps(buttonProps, focusProps, hoverProps),
        [buttonProps, focusProps, hoverProps],
    )

    const reactARIAPseudoClassesDataset = useMemo(
        /**
         * @type {()=>{
         * 'data-hovered'?:true,
         * 'data-pressed'?:true,
         * 'data-focused'?:true,
         * 'data-focus-visible'?:true,
         * }}
         */
        () =>
            ({
                ...isHovered ? { 'data-hovered': true } : {},
                ...isPressed ? { 'data-pressed': true } : {},
                ...isFocused ? { 'data-focused': true } : {},
                ...isFocusVisible ? { 'data-focus-visible': true } : {},
            }),
        [isPressed, isFocused, isFocusVisible, isHovered],
    )

    useEffect(() => {
        let timeoutIDOfButtonScrollIntoView = NaN

        if (
            isAccessible &&
            playbackToggleButtonRef.current &&
            document.activeElement !== playbackToggleButtonRef.current
        ) {
            const playbackToggleButton = playbackToggleButtonRef.current

            playbackToggleButton.focus({ preventScroll: true })

            timeoutIDOfButtonScrollIntoView = window.setTimeout(() => {
                playbackToggleButton.hasAttribute('data-focus-visible') &&
                    playbackToggleButton.scrollIntoView({
                        behavior: 'instant',
                        block: 'center',
                        inline: 'nearest',
                    })
            })
        }

        return () => {
            clearTimeout(timeoutIDOfButtonScrollIntoView)
        }
    }, [isAccessible])

    return {
        reactARIAProps,
        playbackToggleButtonRef,
        ariaLabel,
        reactARIAPseudoClassesDataset,
        uuid,
        isPlaying,
    }
}