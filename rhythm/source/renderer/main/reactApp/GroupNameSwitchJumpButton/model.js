import { useMemo } from 'react'
import {
    useCurrentPage,
    useCurrentPageType,
    useGoToPage,
    useQueueSource,
    useLibraryGroup,
} from '../model'

/**
 * @type {()=>{
 * recommendedGroupList:Array<{
 * key:string,
 * by:'album'|'artist',
 * name:string,
 * }>,
 * currentPageType:'flac'|'mp3',
 * goToPage:(event:import("react-aria-components").PressEvent)=>void,
 * }}
 */
export const useGroupNameSwitchJumpButton = () => {
    const { currentPage } = useCurrentPage()

    const { currentPageType } = useCurrentPageType()

    const { queueSource } = useQueueSource()

    const { libraryGroup } = useLibraryGroup()

    const recommendedGroupList = useMemo(
        /**
         * @type {()=>Array<{
         * key:string,
         * by:'album'|'artist',
         * name:string,
         * }>}
         */
        () => {
            const [queueSourceType, queueSourceGroup] = queueSource

            const [, currentPageType, currentPageGroup] = currentPage
            if (currentPageGroup !== 'all') {
                return []
            }

            let originGroupList = [
                ...libraryGroup[currentPageType].album.map(
                    /**
                     * @type {()=>{
                     * key:string,
                     * by:'album'|'artist',
                     * name:string,
                     * }}
                     */
                    name =>
                        ({
                            key: `album::${name}`,
                            by: 'album',
                            name,
                        }),
                ),
                ...libraryGroup[currentPageType].artist.map(
                    /**
                     * @type {()=>{
                     * key:string,
                     * by:'album'|'artist',
                     * name:string,
                     * }}
                     */
                    name =>
                        ({
                            key: `artist::${name}`,
                            by: 'artist',
                            name,
                        }),
                ),
            ]

            for (
                let currentIndex = originGroupList.length - 1;
                currentIndex > 0;
                currentIndex -= 1
            ) {
                const randomIndex = Math.floor(
                    Math.random() * (currentIndex + 1),
                )

                // eslint-disable-next-line semi-style
                ;[originGroupList[currentIndex], originGroupList[randomIndex]] =
                    [
                        /**
                         * @type {{
                         * key:string,
                         * by:'album'|'artist',
                         * name:string,
                         * }}
                         */
                        // eslint-disable-next-line no-extra-parens
                        (originGroupList[randomIndex]),
                        /**
                         * @type {{
                         * key:string,
                         * by:'album'|'artist',
                         * name:string,
                         * }}
                         */
                        // eslint-disable-next-line no-extra-parens
                        (originGroupList[currentIndex]),
                    ]
            }

            if (
                currentPageType === queueSourceType &&
                queueSourceGroup !== 'all'
            ) {
                const indexOfQueueSource = originGroupList.findIndex(
                    ({ by, name }) =>
                        by === queueSourceGroup.by &&
                        name === queueSourceGroup.name,
                )
                if (indexOfQueueSource >= 0) {
                    originGroupList = [
                        {
                            key: `${queueSourceType}::${queueSourceGroup.by}::${queueSourceGroup.name}`,
                            by: queueSourceGroup.by,
                            name: queueSourceGroup.name,
                        },
                        ...originGroupList.toSpliced(indexOfQueueSource, 1),
                    ]
                }
            }

            return originGroupList
        },
        [currentPage, queueSource, libraryGroup],
    )

    const { goToPage } = useGoToPage()

    return {
        recommendedGroupList,
        currentPageType,
        goToPage,
    }
}