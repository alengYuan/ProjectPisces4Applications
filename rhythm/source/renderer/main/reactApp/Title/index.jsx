import { memo } from 'react'
import { focusedTitle, blurredTitle } from './style'
import { useTitle } from './model'

/**
 * @type {React.FC<{}>}
 */
const Title = () => {
    const { windowIsFocused } = useTitle()

    return (
        <div
            css={windowIsFocused ? focusedTitle : blurredTitle}
            aria-hidden="true"
        >
            Rhythm
        </div>
    )
}

export default memo(Title)