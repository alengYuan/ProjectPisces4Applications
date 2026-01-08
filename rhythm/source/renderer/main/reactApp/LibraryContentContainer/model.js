import { useCallback, useEffect, useRef, useState, createContext } from 'react'
import {
    useCurrentPageType,
    useCurrentPageGroupBy,
    useCurrentPageGroupName,
    useCurrentPageBasicInformationList,
    useCurrentPageBasicInformationListIsLoading,
} from '../model'

const themeUpdateChanceGetEvent = new Event('theme-update-chance-get')

export const IntersectionObserverSetOfThemeUpdateChanceGetContext =
    createContext(
        /**
         * @type {undefined|[IntersectionObserver,WeakMap<Element,number>]}
         */
        // eslint-disable-next-line no-extra-parens
        (void null),
    )

export const CursorIndexContext = createContext(-1)

/**
 * @type {()=>{
 * libraryContentContainerRef:React.MutableRefObject<null|HTMLDivElement>,
 * currentPageBasicInformationListIsLoading:boolean,
 * cursorIndex:number,
 * handleListFocus:React.FocusEventHandler,
 * handleListBlur:React.FocusEventHandler,
 * switchCardButton:React.KeyboardEventHandler,
 * intersectionObserverSetOfThemeUpdateChanceGet:undefined|[IntersectionObserver,WeakMap<Element,number>],
 * }}
 */
export const useLibraryContentContainer = () => {
    const libraryContentContainerRef = useRef(
        /**
         * @type {null|HTMLDivElement}
         */
        // eslint-disable-next-line no-extra-parens
        (null),
    )

    const [
        intersectionObserverSetOfThemeUpdateChanceGet,
        setIntersectionObserverSetOfThemeUpdateChanceGet,
    ] = useState(
        /**
         * @type {undefined|[IntersectionObserver,WeakMap<Element,number>]}
         */
        // eslint-disable-next-line no-extra-parens
        (void null),
    )

    const [cursorIndex, setCursorIndex] = useState(-1)

    const { currentPageType } = useCurrentPageType()

    const { currentPageGroupBy } = useCurrentPageGroupBy()

    const { currentPageGroupName } = useCurrentPageGroupName()

    const { currentPageBasicInformationList } =
        useCurrentPageBasicInformationList()

    const { currentPageBasicInformationListIsLoading } =
        useCurrentPageBasicInformationListIsLoading()

    const handleListFocus = useCallback(
        /**
         * @type {React.FocusEventHandler}
         */
        event => {
            event.target === event.currentTarget && setCursorIndex(0)
        },
        [],
    )

    const handleListBlur = useCallback(
        /**
         * @type {React.FocusEventHandler}
         */
        event => {
            !event.currentTarget.contains(event.relatedTarget) &&
                setCursorIndex(-1)
        },
        [],
    )

    const switchCardButton = useCallback(
        /**
         * @type {React.KeyboardEventHandler}
         */
        event => {
            if (event.repeat && !event.shiftKey) {
                return
            }

            if (
                ![
                    'Home',
                    'ArrowLeft',
                    'ArrowUp',
                    'ArrowRight',
                    'ArrowDown',
                    'End',
                ].includes(event.code)
            ) {
                return
            }

            event.preventDefault()

            setCursorIndex(previousValue => {
                const firstIndex = 0

                const lastIndex = currentPageBasicInformationList.length - 1

                if (event.code === 'Home') {
                    return firstIndex
                }

                if (['ArrowLeft', 'ArrowUp'].includes(event.code)) {
                    return previousValue > lastIndex
                        ? lastIndex
                        : previousValue === firstIndex
                            ? lastIndex
                            : previousValue - 1
                }

                if (['ArrowRight', 'ArrowDown'].includes(event.code)) {
                    return previousValue > lastIndex
                        ? lastIndex
                        : previousValue === lastIndex
                            ? firstIndex
                            : previousValue + 1
                }

                if (event.code === 'End') {
                    return lastIndex
                }

                return previousValue
            })
        },
        [currentPageBasicInformationList],
    )

    useEffect(() => {
        /**
         * @type {(event:Event)=>void}
         */
        const playFromHereHandler = event => {
            if (!currentPageBasicInformationListIsLoading) {
                if (
                    event instanceof CustomEvent &&
                    event.detail instanceof Object &&
                    typeof event.detail.uuid === 'string'
                ) {
                    window['rhythm::main'].playFromHere(
                        currentPageType,
                        currentPageGroupBy === 'all'
                            ? currentPageGroupBy
                            : {
                                by: currentPageGroupBy,
                                name: currentPageGroupName,
                            },
                        /**
                         * @type {CustomEvent<{
                         * uuid:string,
                         * }>}
                         */
                        // eslint-disable-next-line no-extra-parens
                        (event).detail.uuid,
                    )
                }
            }
        }

        addEventListener('play-from-here', playFromHereHandler)

        return () => {
            removeEventListener('play-from-here', playFromHereHandler)
        }
    }, [
        currentPageType,
        currentPageGroupBy,
        currentPageGroupName,
        currentPageBasicInformationListIsLoading,
    ])

    useEffect(() => {
        let timeoutIDOfSmoothScroll = NaN

        libraryContentContainerRef.current?.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant',
        })

        const removeUpdateLibraryDatabaseHandler = window[
            'rhythm::main'
        ].updateLibraryDatabase(() => {
            timeoutIDOfSmoothScroll = window.setTimeout(() => {
                libraryContentContainerRef.current?.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'smooth',
                })
            })
        })

        return () => {
            removeUpdateLibraryDatabaseHandler()

            clearTimeout(timeoutIDOfSmoothScroll)
        }
    }, [currentPageType, currentPageGroupBy, currentPageGroupName])

    useEffect(() => {
        if (libraryContentContainerRef.current) {
            /**
             * @type {WeakMap<Element,number>}
             */
            const timeoutIDMapOfThemeUpdateChanceGet = new WeakMap()

            setIntersectionObserverSetOfThemeUpdateChanceGet([
                new IntersectionObserver(
                    entries => {
                        for (const entry of entries) {
                            const element = entry.target

                            const timeoutIDOfThemeUpdateChanceGet =
                                timeoutIDMapOfThemeUpdateChanceGet.get(element)
                            if (timeoutIDOfThemeUpdateChanceGet) {
                                timeoutIDMapOfThemeUpdateChanceGet.delete(
                                    element,
                                )

                                clearTimeout(timeoutIDOfThemeUpdateChanceGet)
                            }

                            if (entry.isIntersecting) {
                                timeoutIDMapOfThemeUpdateChanceGet.set(
                                    element,
                                    window.setTimeout(() => {
                                        element.dispatchEvent(
                                            themeUpdateChanceGetEvent,
                                        )
                                    }, 200),
                                )

                                element.classList.add('observed')
                            } else {
                                element.classList.remove('observed')
                            }
                        }
                    },
                    {
                        root: libraryContentContainerRef.current,
                    },
                ),
                timeoutIDMapOfThemeUpdateChanceGet,
            ])
        }

        /**
         * @type {(event:Event)=>void}
         */
        const calibrateCursorPositionHandler = event => {
            if (
                event instanceof CustomEvent &&
                event.detail instanceof Object &&
                typeof event.detail.cursorIndex === 'number'
            ) {
                setCursorIndex(
                    /**
                     * @type {CustomEvent<{
                     * cursorIndex:number,
                     * }>}
                     */
                    // eslint-disable-next-line no-extra-parens
                    (event).detail.cursorIndex,
                )
            }
        }

        addEventListener(
            'calibrate-cursor-position',
            calibrateCursorPositionHandler,
        )

        return () => {
            removeEventListener(
                'calibrate-cursor-position',
                calibrateCursorPositionHandler,
            )
        }
    }, [])

    return {
        libraryContentContainerRef,
        currentPageBasicInformationListIsLoading,
        cursorIndex,
        handleListFocus,
        handleListBlur,
        switchCardButton,
        intersectionObserverSetOfThemeUpdateChanceGet,
    }
}