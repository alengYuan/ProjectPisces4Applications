import { memo } from 'react'
import { activeSkeletonPlaceholder, inactiveSkeletonPlaceholder } from './style'
import { useSkeletonPlaceholder } from './model'

/**
 * @type {React.FC<{}>}
 */
const SkeletonPlaceholder = () => {
    const { currentPageBasicInformationListIsLoading } =
        useSkeletonPlaceholder()

    return (
        <div
            className="skeleton-placeholder"
            css={
                currentPageBasicInformationListIsLoading
                    ? activeSkeletonPlaceholder
                    : inactiveSkeletonPlaceholder
            }
        ></div>
    )
}

export default memo(SkeletonPlaceholder)