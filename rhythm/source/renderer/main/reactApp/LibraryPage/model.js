import { useMemo } from 'react'
import {
    useCurrentPageGroupBy,
    useCurrentPageGroupName,
    useCurrentPageBasicInformationListIsEmpty,
    useCurrentPageBasicInformationListIsLoading,
} from '../model'

/**
 * @type {()=>{
 * currentPageBasicInformationListIsReallyEmpty:boolean,
 * currentPageGroupBy:'all'|'album'|'artist',
 * currentPageGroupName:string,
 * }}
 */
export const useLibraryPage = () => {
    const { currentPageGroupBy } = useCurrentPageGroupBy()

    const { currentPageGroupName } = useCurrentPageGroupName()

    const { currentPageBasicInformationListIsEmpty } =
        useCurrentPageBasicInformationListIsEmpty()

    const { currentPageBasicInformationListIsLoading } =
        useCurrentPageBasicInformationListIsLoading()

    const currentPageBasicInformationListIsReallyEmpty = useMemo(
        /**
         * @type {()=>boolean}
         */
        () =>
            !currentPageBasicInformationListIsLoading &&
            currentPageBasicInformationListIsEmpty,
        [
            currentPageBasicInformationListIsEmpty,
            currentPageBasicInformationListIsLoading,
        ],
    )

    return {
        currentPageBasicInformationListIsReallyEmpty,
        currentPageGroupBy,
        currentPageGroupName,
    }
}