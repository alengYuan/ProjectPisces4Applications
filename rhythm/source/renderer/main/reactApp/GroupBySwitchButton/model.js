import { useMemo } from 'react'
import {
    useCurrentPageType,
    useCurrentPageGroupBy,
    useGoToPage,
    useLibraryGroup,
} from '../model'

/**
 * @type {()=>{
 * currentPageGroupBy:'all'|'album'|'artist',
 * currentPageType:'flac'|'mp3',
 * albumListIsEmpty:boolean,
 * currentTypeFirstAlbumGroupName:string,
 * artistListIsEmpty:boolean,
 * currentTypeFirstArtistGroupName:string,
 * goToPage:(event:import("react-aria-components").PressEvent)=>void,
 * }}
 */
export const useGroupBySwitchButton = () => {
    const { currentPageType } = useCurrentPageType()

    const { currentPageGroupBy } = useCurrentPageGroupBy()

    const { libraryGroup } = useLibraryGroup()

    const albumListIsEmpty = useMemo(
        /**
         * @type {()=>boolean}
         */
        () =>
            !libraryGroup[currentPageType].album.length,
        [currentPageType, libraryGroup],
    )

    const artistListIsEmpty = useMemo(
        /**
         * @type {()=>boolean}
         */
        () =>
            !libraryGroup[currentPageType].artist.length,
        [currentPageType, libraryGroup],
    )

    const currentTypeFirstAlbumGroupName = useMemo(
        /**
         * @type {()=>string}
         */
        () =>
            libraryGroup[currentPageType].album[0] ?? '',
        [currentPageType, libraryGroup],
    )

    const currentTypeFirstArtistGroupName = useMemo(
        /**
         * @type {()=>string}
         */
        () =>
            libraryGroup[currentPageType].artist[0] ?? '',
        [currentPageType, libraryGroup],
    )

    const { goToPage } = useGoToPage()

    return {
        currentPageGroupBy,
        currentPageType,
        albumListIsEmpty,
        currentTypeFirstAlbumGroupName,
        artistListIsEmpty,
        currentTypeFirstArtistGroupName,
        goToPage,
    }
}