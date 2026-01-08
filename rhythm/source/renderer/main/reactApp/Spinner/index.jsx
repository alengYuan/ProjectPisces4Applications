import { memo } from 'react'
import { spinner, spinnerDecoration } from './style'
import { useSpinner } from './model'

/**
 * @type {React.FC<{}>}
 */
const Spinner = () => {
    const { currentPageBasicInformationListIsLoading } = useSpinner()

    return (
        currentPageBasicInformationListIsLoading &&
            <div css={spinner}>
                <div css={spinnerDecoration}></div>
            </div>

    )
}

export default memo(Spinner)