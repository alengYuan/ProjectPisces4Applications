import { memo } from 'react'
import { useCore } from './model'

/**
 * @type {React.FC<{}>}
 */
const Core = () => {
    useCore()

    return <></>
}

export default memo(Core)