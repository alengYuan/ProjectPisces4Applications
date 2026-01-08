import { memo } from 'react'
import { useQueueSourceIndicator } from './model'
import ScreenReaderText from '../ScreenReaderText/index.jsx'

/**
 * @type {React.FC<{}>}
 */
const QueueSourceIndicator = () => {
    const { screenReaderPrompt } = useQueueSourceIndicator()

    return <ScreenReaderText text={screenReaderPrompt} isLive="polite" />
}

export default memo(QueueSourceIndicator)