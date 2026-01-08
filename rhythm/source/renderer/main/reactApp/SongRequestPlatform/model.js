import { useMemo } from 'react'
import { useCurrentPageType, useLibraryPathIsFilled } from '../model'

/**
 * @type {()=>{
 * currentPageType:'flac'|'mp3',
 * currentLibraryPathIsFilled:boolean,
 * }}
 */
export const useSongRequestPlatform = () => {
    const { currentPageType } = useCurrentPageType()

    const { libraryPathIsFilled } = useLibraryPathIsFilled()

    const currentLibraryPathIsFilled = useMemo(
        /**
         * @type {()=>boolean}
         */
        () =>
            libraryPathIsFilled[currentPageType],
        [currentPageType, libraryPathIsFilled],
    )

    return {
        currentPageType,
        currentLibraryPathIsFilled,
    }
}