import { useMemo } from 'react'
import {
    useCurrentPageType,
    useQueueSourceType,
    useQueueSourceGroupBy,
} from '../model'

/**
 * @type {()=>{
 * isPlaying:boolean,
 * }}
 */
export const usePlayingIndicatorForGroupBySwitchButton = () => {
    const { currentPageType } = useCurrentPageType()

    const { queueSourceType } = useQueueSourceType()

    const { queueSourceGroupBy } = useQueueSourceGroupBy()

    const isPlaying = useMemo(
        /**
         * @type {()=>boolean}
         */
        () =>
            queueSourceType === currentPageType && queueSourceGroupBy === 'all',
        [currentPageType, queueSourceType, queueSourceGroupBy],
    )

    return {
        isPlaying,
    }
}