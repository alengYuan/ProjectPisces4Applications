import { useMemo } from 'react'
import {
    useCurrentPageType,
    useCurrentPageGroupBy,
    useCurrentPageGroupName,
    useGoToPage,
    useLibraryGroup,
} from '../model'

/**
 * @type {()=>{
 * groupNameList:Array<string>,
 * currentPageGroupName:string,
 * currentPageType:'flac'|'mp3',
 * currentPageGroupBy:'all'|'album'|'artist',
 * goToPage:(event:import("react-aria-components").PressEvent)=>void,
 * }}
 */
export const useGroupNameSwitchButton = () => {
    const { currentPageType } = useCurrentPageType()

    const { currentPageGroupBy } = useCurrentPageGroupBy()

    const { currentPageGroupName } = useCurrentPageGroupName()

    const { libraryGroup } = useLibraryGroup()

    const groupNameList = useMemo(
        /**
         * @type {()=>Array<string>}
         */
        () =>
            libraryGroup[currentPageType][
                /**
                 * @type {'album'|'artist'}
                 */
                // eslint-disable-next-line no-extra-parens
                (currentPageGroupBy)
            ],
        [currentPageType, currentPageGroupBy, libraryGroup],
    )

    const { goToPage } = useGoToPage()

    return {
        groupNameList,
        currentPageGroupName,
        currentPageType,
        currentPageGroupBy,
        goToPage,
    }
}