import { useMemo } from 'react'
import {
    useCurrentPageType,
    useQueueSourceType,
    useQueueSourceGroupBy,
    useQueueSourceGroupName,
} from '../model'

/**
 * @type {(props:{
 * by:'album'|'artist',
 * name:string,
 * })=>{
 * isPlaying:boolean,
 * by:'album'|'artist',
 * }}
 */
export const usePlayingIndicatorForGroupNameSwitchJumpButton = ({
    by,
    name,
}) => {
    const { currentPageType } = useCurrentPageType()

    const { queueSourceType } = useQueueSourceType()

    const { queueSourceGroupBy } = useQueueSourceGroupBy()

    const { queueSourceGroupName } = useQueueSourceGroupName()

    const isPlaying = useMemo(
        /**
         * @type {()=>boolean}
         */
        () =>
            queueSourceType === currentPageType &&
            queueSourceGroupBy === by &&
            queueSourceGroupName === name,
        [
            by,
            name,
            currentPageType,
            queueSourceType,
            queueSourceGroupBy,
            queueSourceGroupName,
        ],
    )

    return {
        isPlaying,
        by,
    }
}