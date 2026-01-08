import { useCallback } from 'react'
import { useAtomValue, useSetAtom, atom } from 'jotai'
import { defaultPage, defaultPageStack, atomWrapper } from '../index'

const pageStackIsEmptyAtom = atom(
    get =>
        get(atomWrapper.pageStack).length === defaultPageStack.length,
)

const currentPageAtom = atom(get => {
    const pageStack = get(atomWrapper.pageStack)

    return pageStack[pageStack.length - 1] ?? defaultPage
})

/**
 * @type {()=>{
 * pageStackIsEmpty:boolean,
 * }}
 */
export const usePageStackIsEmpty = () => {
    const pageStackIsEmpty = useAtomValue(pageStackIsEmptyAtom)

    return {
        pageStackIsEmpty,
    }
}

/**
 * @type {()=>{
 * currentPage:import("../index").PageKey,
 * }}
 */
export const useCurrentPage = () => {
    const currentPage = useAtomValue(currentPageAtom)

    return {
        currentPage,
    }
}

/**
 * @type {()=>{
 * pushPageStack:(page:import("../index").PageKey)=>void,
 * }}
 */
export const usePushPageStack = () => {
    const setPageStack = useSetAtom(atomWrapper.pageStack)

    const pushPageStack = useCallback(
        /**
         * @type {(page:import("../index").PageKey)=>void}
         */
        page => {
            setPageStack(previousValue => {
                const pageIsNotCurrent =
                    page !==
                    (previousValue[previousValue.length - 1] ?? defaultPage)

                pageIsNotCurrent && previousValue.push(page)

                return pageIsNotCurrent ? [...previousValue] : previousValue
            })
        },
        [setPageStack],
    )

    return {
        pushPageStack,
    }
}

/**
 * @type {()=>{
 * popPageStack:()=>void,
 * }}
 */
export const usePopPageStack = () => {
    const setPageStack = useSetAtom(atomWrapper.pageStack)

    const popPageStack = useCallback(
        /**
         * @type {()=>void}
         */
        () => {
            setPageStack(previousValue => {
                const pageStackIsNotEmpty =
                    previousValue.length > defaultPageStack.length

                pageStackIsNotEmpty && previousValue.pop()

                return pageStackIsNotEmpty ? [...previousValue] : previousValue
            })
        },
        [setPageStack],
    )

    return {
        popPageStack,
    }
}

/**
 * @type {()=>{
 * clearPageStack:()=>void,
 * }}
 */
export const useClearPageStack = () => {
    const setPageStack = useSetAtom(atomWrapper.pageStack)

    const clearPageStack = useCallback(
        /**
         * @type {()=>void}
         */
        () => {
            setPageStack([...defaultPageStack])
        },
        [setPageStack],
    )

    return {
        clearPageStack,
    }
}

/**
 * @type {()=>{
 * goToPage:(event:import("react-aria-components").PressEvent)=>void,
 * }}
 */
export const useGoToPage = () => {
    const setPageStack = useSetAtom(atomWrapper.pageStack)

    const goToPage = useCallback(
        /**
         * @type {(event:import("react-aria-components").PressEvent)=>void}
         */
        event => {
            const element = event.target
            if (element instanceof HTMLElement) {
                const { pageKey } = element.dataset

                const page =
                    // prettier-ignore
                    typeof pageKey === 'string' &&
                    ['general', 'library', 'mode', 'other', 'about'].includes(pageKey)
                        // eslint-disable-next-line no-inline-comments, no-extra-parens
                        ? /** @type {import("../index").PageKey} */ (pageKey)
                        : defaultPage

                setPageStack(previousValue => {
                    const pageIsNotCurrent =
                        page !==
                        (previousValue[previousValue.length - 1] ?? defaultPage)

                    pageIsNotCurrent && previousValue.push(page)

                    return pageIsNotCurrent ? [...previousValue] : previousValue
                })
            }
        },
        [setPageStack],
    )

    return {
        goToPage,
    }
}

/**
 * @type {()=>{
 * generalLanguage:import("../index").SettingStorage['general.language'],
 * }}
 */
export const useGeneralLanguage = () => {
    const generalLanguage = useAtomValue(atomWrapper['general.language'])

    return {
        generalLanguage,
    }
}

/**
 * @type {()=>{
 * generalTray:import("../index").SettingStorage['general.tray'],
 * }}
 */
export const useGeneralTray = () => {
    const generalTray = useAtomValue(atomWrapper['general.tray'])

    return {
        generalTray,
    }
}

/**
 * @type {()=>{
 * libraryPathFLAC:import("../index").SettingStorage['library.path.flac'],
 * }}
 */
export const useLibraryPathFLAC = () => {
    const libraryPathFLAC = useAtomValue(atomWrapper['library.path.flac'])

    return {
        libraryPathFLAC,
    }
}

/**
 * @type {()=>{
 * libraryPathMP3:import("../index").SettingStorage['library.path.mp3'],
 * }}
 */
export const useLibraryPathMP3 = () => {
    const libraryPathMP3 = useAtomValue(atomWrapper['library.path.mp3'])

    return {
        libraryPathMP3,
    }
}

/**
 * @type {()=>{
 * modeCandidate:import("../index").SettingStorage['mode.candidate'],
 * }}
 */
export const useModeCandidate = () => {
    const modeCandidate = useAtomValue(atomWrapper['mode.candidate'])

    return {
        modeCandidate,
    }
}

/**
 * @type {()=>{
 * otherRuleArtistSplit:import("../index").SettingStorage['other.rule.artist.split'],
 * }}
 */
export const useOtherRuleArtistSplit = () => {
    const otherRuleArtistSplit = useAtomValue(
        atomWrapper['other.rule.artist.split'],
    )

    return {
        otherRuleArtistSplit,
    }
}

/**
 * @type {()=>{
 * otherRuleArtistIdentify:import("../index").SettingStorage['other.rule.artist.identify'],
 * }}
 */
export const useOtherRuleArtistIdentify = () => {
    const otherRuleArtistIdentify = useAtomValue(
        atomWrapper['other.rule.artist.identify'],
    )

    return {
        otherRuleArtistIdentify,
    }
}

/**
 * @type {()=>{
 * otherRemote:import("../index").SettingStorage['other.remote'],
 * }}
 */
export const useOtherRemote = () => {
    const otherRemote = useAtomValue(atomWrapper['other.remote'])

    return {
        otherRemote,
    }
}

/**
 * @type {(content:string)=>{
 * onHoverChange:(isHovering:boolean)=>void,
 * }}
 */
export const useTooltip = content => {
    const onHoverChange = useCallback(
        /**
         * @type {(isHovering:boolean)=>void}
         */
        isHovering => {
            if (isHovering) {
                window['rhythm::setting'].requestShowContent(content)
            } else {
                window['rhythm::setting'].cancelShowContent()
            }
        },
        [content],
    )

    return {
        onHoverChange,
    }
}

/**
 * @type {React.KeyboardEventHandler}
 */
export const switchTabPanel = event => {
    const currentTarget = event.currentTarget
    if (currentTarget.getAttribute('role') !== 'tablist') {
        return
    }

    if (event.repeat && !event.shiftKey) {
        return
    }

    const tabListOrientation =
        /**
         * @type {null|'horizontal'|'vertical'}
         */
        // eslint-disable-next-line no-extra-parens
        (currentTarget.getAttribute('aria-orientation')) ?? 'horizontal'

    if (
        ![
            'Home',
            'ArrowLeft',
            'ArrowRight',
            'End',
            ...tabListOrientation === 'vertical'
                ? ['ArrowUp', 'ArrowDown']
                : [],
        ].includes(event.code)
    ) {
        return
    }

    const target = event.target
    if (
        target instanceof HTMLButtonElement &&
        target.getAttribute('role') === 'tab'
    ) {
        const targetParent = target.parentElement
        if (targetParent === currentTarget) {
            /**
             * @type {Element}
             */
            let jumpTarget = target

            if (event.code === 'Home') {
                jumpTarget = targetParent.firstElementChild ?? target
            } else if (
                [
                    'ArrowLeft',
                    ...tabListOrientation === 'vertical' ? ['ArrowUp'] : [],
                ].includes(event.code)
            ) {
                jumpTarget =
                    target.previousElementSibling ??
                    targetParent.lastElementChild ??
                    target
            } else if (
                [
                    'ArrowRight',
                    ...tabListOrientation === 'vertical' ? ['ArrowDown'] : [],
                ].includes(event.code)
            ) {
                jumpTarget =
                    target.nextElementSibling ??
                    targetParent.firstElementChild ??
                    target
            } else if (event.code === 'End') {
                jumpTarget = targetParent.lastElementChild ?? target
            }

            if (
                jumpTarget instanceof HTMLButtonElement &&
                jumpTarget.getAttribute('role') === 'tab'
            ) {
                event.preventDefault()

                jumpTarget.focus()

                jumpTarget.click()
            } else {
                console.error(new TypeError('Invalid tab list or tab button.'))
            }
        }
    }
}