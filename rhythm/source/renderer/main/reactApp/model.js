import { useCallback } from 'react'
import { useAtomValue, useSetAtom, atom } from 'jotai'
import { atomWrapper, flattenQueueSource } from '../index'

const pageStackIsEmptyAtom = atom(
    get =>
        get(atomWrapper.pageStack).length === 1,
)

const currentPageAtom = atom(get => {
    const pageStack = get(atomWrapper.pageStack)

    /**
     * @type {[string,'flac'|'mp3','all'|{
     * by:'album'|'artist',
     * name:string,
     * }]}
     */
    const sparePage = [flattenQueueSource(['flac', 'all']), 'flac', 'all']

    return pageStack[pageStack.length - 1] ?? sparePage
})

const currentPageTypeAtom = atom(get => {
    const [, type] = get(currentPageAtom)

    return type
})

const currentPageGroupByAtom = atom(get => {
    const [, , group] = get(currentPageAtom)

    return group === 'all' ? group : group.by
})

const currentPageGroupNameAtom = atom(get => {
    const [, , group] = get(currentPageAtom)

    return group === 'all' ? '' : group.name
})

export const currentPageBasicInformationListAtom = atom(
    /**
     * @type {Array<{
     * type:'flac'|'mp3',
     * uuid:string,
     * size:number,
     * modified:number,
     * title:string,
     * artist:string,
     * album:string,
     * length:number,
     * bit:number,
     * depth?:number,
     * sample:number,
     * cover:string,
     * }>}
     */
    // eslint-disable-next-line no-extra-parens
    ([]),
)

const currentPageBasicInformationListIsEmptyAtom = atom(
    get =>
        !get(currentPageBasicInformationListAtom).length,
)

export const currentPageBasicInformationListIsLoadingAtom = atom(true)

const queueSourceTypeAtom = atom(get => {
    const [type] = get(atomWrapper.queueSource)

    return type
})

const queueSourceGroupByAtom = atom(get => {
    const [, group] = get(atomWrapper.queueSource)

    return group === 'all' ? group : group.by
})

const queueSourceGroupNameAtom = atom(get => {
    const [, group] = get(atomWrapper.queueSource)

    return group === 'all' ? '' : group.name
})

export const queueSourceBasicInformationListAtom = atom(
    /**
     * @type {Array<{
     * type:'flac'|'mp3',
     * uuid:string,
     * size:number,
     * modified:number,
     * title:string,
     * artist:string,
     * album:string,
     * length:number,
     * bit:number,
     * depth?:number,
     * sample:number,
     * cover:string,
     * }>}
     */
    // eslint-disable-next-line no-extra-parens
    ([]),
)

const queueSourceBasicInformationListIsEmptyAtom = atom(
    get =>
        !get(queueSourceBasicInformationListAtom).length,
)

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
 * currentPage:[string,'flac'|'mp3','all'|{
 * by:'album'|'artist',
 * name:string,
 * }],
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
 * currentPageType:'flac'|'mp3',
 * }}
 */
export const useCurrentPageType = () => {
    const currentPageType = useAtomValue(currentPageTypeAtom)

    return {
        currentPageType,
    }
}

/**
 * @type {()=>{
 * currentPageGroupBy:'all'|'album'|'artist',
 * }}
 */
export const useCurrentPageGroupBy = () => {
    const currentPageGroupBy = useAtomValue(currentPageGroupByAtom)

    return {
        currentPageGroupBy,
    }
}

/**
 * @type {()=>{
 * currentPageGroupName:string,
 * }}
 */
export const useCurrentPageGroupName = () => {
    const currentPageGroupName = useAtomValue(currentPageGroupNameAtom)

    return {
        currentPageGroupName,
    }
}

/**
 * @type {()=>{
 * pushPageStack:(page:[string,'flac'|'mp3','all'|{
 * by:'album'|'artist',
 * name:string,
 * }])=>void,
 * }}
 */
export const usePushPageStack = () => {
    const setPageStack = useSetAtom(atomWrapper.pageStack)

    const pushPageStack = useCallback(
        /**
         * @type {(page:[string,'flac'|'mp3','all'|{
         * by:'album'|'artist',
         * name:string,
         * }])=>void}
         */
        page => {
            setPageStack(previousValue => {
                const pageIsNotCurrent =
                    page[0] !==
                    (previousValue[previousValue.length - 1] ?? [
                        flattenQueueSource(['flac', 'all']),
                    ])[0]

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
                const pageStackIsNotEmpty = previousValue.length > 1

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
                const { type, groupBy, groupName } = element.dataset

                const targetPageType =
                    // prettier-ignore
                    typeof type === 'string' && ['flac', 'mp3'].includes(type)
                        // eslint-disable-next-line no-inline-comments, no-extra-parens
                        ? /** @type {'flac'|'mp3'} */ (type)
                        : 'flac'

                const targetPageGroupBy =
                    // prettier-ignore
                    typeof groupBy === 'string' &&
                    ['all', 'album', 'artist'].includes(groupBy)
                        // eslint-disable-next-line no-inline-comments, no-extra-parens
                        ? /** @type {'all'|'album'|'artist'} */ (groupBy)
                        : 'all'

                const targetPageGroupName =
                    typeof groupName === 'string' ? groupName : ''

                /**
                 * @type {['flac'|'mp3','all'|{
                 * by:'album'|'artist',
                 * name:string,
                 * }]}
                 */
                const target = [
                    targetPageType,
                    targetPageGroupBy === 'all'
                        ? targetPageGroupBy
                        : {
                            by: targetPageGroupBy,
                            name: targetPageGroupName,
                        },
                ]

                /**
                 * @type {[string,'flac'|'mp3','all'|{
                 * by:'album'|'artist',
                 * name:string,
                 * }]}
                 */
                const page = [flattenQueueSource(target), ...target]

                setPageStack(previousValue => {
                    const pageIsNotCurrent =
                        page[0] !==
                        (previousValue[previousValue.length - 1] ?? [
                            flattenQueueSource(['flac', 'all']),
                        ])[0]

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
 * currentPageBasicInformationList:Array<{
 * type:'flac'|'mp3',
 * uuid:string,
 * size:number,
 * modified:number,
 * title:string,
 * artist:string,
 * album:string,
 * length:number,
 * bit:number,
 * depth?:number,
 * sample:number,
 * cover:string,
 * }>,
 * }}
 */
export const useCurrentPageBasicInformationList = () => {
    const currentPageBasicInformationList = useAtomValue(
        currentPageBasicInformationListAtom,
    )

    return {
        currentPageBasicInformationList,
    }
}

/**
 * @type {()=>{
 * currentPageBasicInformationListIsEmpty:boolean,
 * }}
 */
export const useCurrentPageBasicInformationListIsEmpty = () => {
    const currentPageBasicInformationListIsEmpty = useAtomValue(
        currentPageBasicInformationListIsEmptyAtom,
    )

    return {
        currentPageBasicInformationListIsEmpty,
    }
}

/**
 * @type {()=>{
 * currentPageBasicInformationListIsLoading:boolean,
 * }}
 */
export const useCurrentPageBasicInformationListIsLoading = () => {
    const currentPageBasicInformationListIsLoading = useAtomValue(
        currentPageBasicInformationListIsLoadingAtom,
    )

    return {
        currentPageBasicInformationListIsLoading,
    }
}

/**
 * @type {()=>{
 * queueSource:['flac'|'mp3','all'|{
 * by:'album'|'artist',
 * name:string,
 * }],
 * }}
 */
export const useQueueSource = () => {
    const queueSource = useAtomValue(atomWrapper.queueSource)

    return {
        queueSource,
    }
}

/**
 * @type {()=>{
 * queueSourceType:'flac'|'mp3',
 * }}
 */
export const useQueueSourceType = () => {
    const queueSourceType = useAtomValue(queueSourceTypeAtom)

    return {
        queueSourceType,
    }
}

/**
 * @type {()=>{
 * queueSourceGroupBy:'all'|'album'|'artist',
 * }}
 */
export const useQueueSourceGroupBy = () => {
    const queueSourceGroupBy = useAtomValue(queueSourceGroupByAtom)

    return {
        queueSourceGroupBy,
    }
}

/**
 * @type {()=>{
 * queueSourceGroupName:string,
 * }}
 */
export const useQueueSourceGroupName = () => {
    const queueSourceGroupName = useAtomValue(queueSourceGroupNameAtom)

    return {
        queueSourceGroupName,
    }
}

/**
 * @type {()=>{
 * queueSourceBasicInformationList:Array<{
 * type:'flac'|'mp3',
 * uuid:string,
 * size:number,
 * modified:number,
 * title:string,
 * artist:string,
 * album:string,
 * length:number,
 * bit:number,
 * depth?:number,
 * sample:number,
 * cover:string,
 * }>,
 * }}
 */
export const useQueueSourceBasicInformationList = () => {
    const queueSourceBasicInformationList = useAtomValue(
        queueSourceBasicInformationListAtom,
    )

    return {
        queueSourceBasicInformationList,
    }
}

/**
 * @type {()=>{
 * queueSourceBasicInformationListIsEmpty:boolean,
 * }}
 */
export const useQueueSourceBasicInformationListIsEmpty = () => {
    const queueSourceBasicInformationListIsEmpty = useAtomValue(
        queueSourceBasicInformationListIsEmptyAtom,
    )

    return {
        queueSourceBasicInformationListIsEmpty,
    }
}

/**
 * @type {()=>{
 * queueAtIdentification:string,
 * }}
 */
export const useQueueAtIdentification = () => {
    const queueAtIdentification = useAtomValue(
        atomWrapper.queueAtIdentification,
    )

    return {
        queueAtIdentification,
    }
}

/**
 * @type {()=>{
 * progress:number,
 * }}
 */
export const useProgress = () => {
    const progress = useAtomValue(atomWrapper.progress)

    return {
        progress,
    }
}

/**
 * @type {()=>{
 * isPlaying:boolean,
 * }}
 */
export const useIsPlaying = () => {
    const isPlaying = useAtomValue(atomWrapper.isPlaying)

    return {
        isPlaying,
    }
}

/**
 * @type {()=>{
 * libraryPathIsFilled:{
 * flac:boolean,
 * mp3:boolean,
 * },
 * }}
 */
export const useLibraryPathIsFilled = () => {
    const libraryPathIsFilled = useAtomValue(atomWrapper.libraryPathIsFilled)

    return {
        libraryPathIsFilled,
    }
}

/**
 * @type {()=>{
 * currentModeVolume:number,
 * }}
 */
export const useCurrentModeVolume = () => {
    const currentModeVolume = useAtomValue(atomWrapper.currentModeVolume)

    return {
        currentModeVolume,
    }
}

/**
 * @type {()=>{
 * queueOrderMode:'sequential'|'shuffle'|'random',
 * }}
 */
export const useQueueOrderMode = () => {
    const queueOrderMode = useAtomValue(atomWrapper.queueOrderMode)

    return {
        queueOrderMode,
    }
}

/**
 * @type {()=>{
 * queueOrderLoop:'all'|'single'|'off',
 * }}
 */
export const useQueueOrderLoop = () => {
    const queueOrderLoop = useAtomValue(atomWrapper.queueOrderLoop)

    return {
        queueOrderLoop,
    }
}

/**
 * @type {()=>{
 * libraryGroup:{[type in 'flac'|'mp3']:{[by in 'album'|'artist']:Array<string>}},
 * }}
 */
export const useLibraryGroup = () => {
    const libraryGroup = useAtomValue(atomWrapper.libraryGroup)

    return {
        libraryGroup,
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
                window['rhythm::main'].requestShowContent(content)
            } else {
                window['rhythm::main'].cancelShowContent()
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