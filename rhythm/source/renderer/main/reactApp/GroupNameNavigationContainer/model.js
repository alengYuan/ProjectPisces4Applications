import { useEffect, useRef } from 'react'
import { useCurrentPage, useCurrentPageGroupBy, switchTabPanel } from '../model'

/**
 * @type {()=>{
 * groupNameNavigationContainerRef:React.MutableRefObject<null|HTMLDivElement>,
 * currentPageGroupBy:'all'|'album'|'artist',
 * switchTabPanel:React.KeyboardEventHandler,
 * }}
 */
export const useGroupNameNavigationContainer = () => {
    const groupNameNavigationContainerRef = useRef(
        /**
         * @type {null|HTMLDivElement}
         */
        // eslint-disable-next-line no-extra-parens
        (null),
    )

    const { currentPage } = useCurrentPage()

    const { currentPageGroupBy } = useCurrentPageGroupBy()

    useEffect(() => {
        let timeoutIDOfSmoothScroll = NaN

        const [, type, group] = currentPage
        if (group === 'all') {
            timeoutIDOfSmoothScroll = window.setTimeout(() => {
                groupNameNavigationContainerRef.current?.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'smooth',
                })
            })
        } else {
            timeoutIDOfSmoothScroll = window.setTimeout(() => {
                groupNameNavigationContainerRef.current
                    ?.querySelector(
                        `[data-type="${type}"][data-group-by="${group.by}"][data-group-name="${group.name}"]`,
                    )
                    ?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'nearest',
                    })
            })
        }

        const removeUpdateLibraryGroupHandler = window[
            'rhythm::main'
        ].updateLibraryGroup(() => {
            if (group === 'all') {
                groupNameNavigationContainerRef.current?.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'instant',
                })
            } else {
                groupNameNavigationContainerRef.current
                    ?.querySelector(
                        `[data-type="${type}"][data-group-by="${group.by}"][data-group-name="${group.name}"]`,
                    )
                    ?.scrollIntoView({
                        behavior: 'instant',
                        block: 'nearest',
                        inline: 'nearest',
                    })
            }
        })

        return () => {
            removeUpdateLibraryGroupHandler()

            clearTimeout(timeoutIDOfSmoothScroll)
        }
    }, [currentPage])

    return {
        groupNameNavigationContainerRef,
        currentPageGroupBy,
        switchTabPanel,
    }
}