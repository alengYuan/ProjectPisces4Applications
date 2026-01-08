import { memo } from 'react'
import { interactiveTitleBar, nonInteractiveTitleBar } from './style'
import { useTitleBar } from './model'
import TitleBarContent from '../TitleBarContent/index.jsx'

/**
 * @type {React.FC<{}>}
 */
const TitleBar = () => {
    const { isInteractive } = useTitleBar()

    return (
        <div css={isInteractive ? interactiveTitleBar : nonInteractiveTitleBar}>
            <TitleBarContent />
        </div>
    )
}

export default memo(TitleBar)