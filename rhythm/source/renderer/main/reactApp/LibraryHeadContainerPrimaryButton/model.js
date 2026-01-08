import { useCallback, useMemo } from 'react'
import {
    useCurrentPageType,
    useCurrentPageGroupBy,
    useCurrentPageGroupName,
    useCurrentPageBasicInformationList,
} from '../model'
import { t } from '../../index'

/**
 * @type {()=>{
 * ariaLabel:string,
 * playFromHere:()=>void,
 * }}
 */
export const useLibraryHeadContainerPrimaryButton = () => {
    const { currentPageType } = useCurrentPageType()

    const { currentPageGroupBy } = useCurrentPageGroupBy()

    const { currentPageGroupName } = useCurrentPageGroupName()

    const { currentPageBasicInformationList } =
        useCurrentPageBasicInformationList()

    const ariaLabel = useMemo(
        /**
         * @type {()=>string}
         */
        () =>
            t({
                /**
                 * @type {(count:number)=>string}
                 */
                en: count =>
                    `Play all, total of ${count} song${count > 1 ? 's' : ''}`,
                /**
                 * @type {(count:number)=>string}
                 */
                zh: count =>
                    `播放全部，共计${count}首`,
                /**
                 * @type {(count:number)=>string}
                 */
                ja: count =>
                    `すべて再生、合計${count}曲`,
            })(currentPageBasicInformationList.length),
        [currentPageBasicInformationList],
    )

    const playFromHere = useCallback(
        /**
         * @type {()=>void}
         */
        () => {
            window['rhythm::main'].playFromHere(
                currentPageType,
                currentPageGroupBy === 'all'
                    ? currentPageGroupBy
                    : { by: currentPageGroupBy, name: currentPageGroupName },
            )
        },
        [currentPageType, currentPageGroupBy, currentPageGroupName],
    )

    return {
        ariaLabel,
        playFromHere,
    }
}