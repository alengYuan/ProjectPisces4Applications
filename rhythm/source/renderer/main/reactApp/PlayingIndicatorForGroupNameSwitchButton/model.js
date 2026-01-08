import { useMemo } from 'react'
import {
    useCurrentPageType,
    useCurrentPageGroupBy,
    useQueueSourceType,
    useQueueSourceGroupBy,
    useQueueSourceGroupName,
} from '../model'

/**
 * @type {(props:{
 * groupName:string,
 * })=>{
 * isPlaying:boolean,
 * currentPageGroupBy:'album'|'artist',
 * }}
 */
export const usePlayingIndicatorForGroupNameSwitchButton = ({ groupName }) => {
    const { currentPageType } = useCurrentPageType()

    const { currentPageGroupBy } = useCurrentPageGroupBy()

    const { queueSourceType } = useQueueSourceType()

    const { queueSourceGroupBy } = useQueueSourceGroupBy()

    const { queueSourceGroupName } = useQueueSourceGroupName()

    const isPlaying = useMemo(
        /**
         * @type {()=>boolean}
         */
        () =>
            queueSourceType === currentPageType &&
            queueSourceGroupBy === currentPageGroupBy &&
            queueSourceGroupName === groupName,
        [
            groupName,
            currentPageType,
            currentPageGroupBy,
            queueSourceType,
            queueSourceGroupBy,
            queueSourceGroupName,
        ],
    )

    return {
        isPlaying,
        // eslint-disable-next-line object-shorthand
        currentPageGroupBy:
            /**
             * @type {'album'|'artist'}
             */
            // eslint-disable-next-line no-extra-parens
            (currentPageGroupBy),
    }
}