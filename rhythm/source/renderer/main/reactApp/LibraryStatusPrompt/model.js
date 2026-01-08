import { useMemo } from 'react'
import {
    useCurrentPageType,
    useCurrentPageGroupBy,
    useCurrentPageGroupName,
    useCurrentPageBasicInformationList,
    useQueueSourceType,
    useQueueSourceGroupBy,
    useQueueSourceGroupName,
} from '../model'
import { t } from '../../index'

/**
 * @type {()=>{
 * currentPageBasicInformationListStatusPrompt:string,
 * }}
 */
export const useLibraryStatusPrompt = () => {
    const { currentPageType } = useCurrentPageType()

    const { currentPageGroupBy } = useCurrentPageGroupBy()

    const { currentPageGroupName } = useCurrentPageGroupName()

    const { currentPageBasicInformationList } =
        useCurrentPageBasicInformationList()

    const { queueSourceType } = useQueueSourceType()

    const { queueSourceGroupBy } = useQueueSourceGroupBy()

    const { queueSourceGroupName } = useQueueSourceGroupName()

    const currentPageBasicInformationListStatusPrompt = useMemo(
        /**
         * @type {()=>string}
         */
        () =>
            `${t({
                /**
                 * @type {(count:number)=>string}
                 */
                en: count =>
                    `Total of ${count} song${count > 1 ? 's' : ''}`,
                /**
                 * @type {(count:number)=>string}
                 */
                zh: count =>
                    `共计 ${count} 首`,
                /**
                 * @type {(count:number)=>string}
                 */
                ja: count =>
                    `合計 ${count} 曲`,
            })(currentPageBasicInformationList.length)}${
                currentPageType === queueSourceType &&
                currentPageGroupBy === queueSourceGroupBy &&
                currentPageGroupName === queueSourceGroupName
                    ? ` • ${t({
                        en: 'Playing',
                        zh: '播放中',
                        ja: '再生中',
                    })}`
                    : ''
            }`,
        [
            currentPageType,
            currentPageGroupBy,
            currentPageGroupName,
            currentPageBasicInformationList,
            queueSourceType,
            queueSourceGroupBy,
            queueSourceGroupName,
        ],
    )

    return {
        currentPageBasicInformationListStatusPrompt,
    }
}