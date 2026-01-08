import { memo } from 'react'
import { cursorDock } from './style'
import { useCursorDock } from './model'

/**
 * @type {React.FC<{}>}
 */
const CursorDock = () => {
    const { cursorDockRef } = useCursorDock()

    return (
        <p
            ref={cursorDockRef}
            css={cursorDock}
            tabIndex={-1}
            aria-hidden="true"
        />
    )
}

export default memo(CursorDock)