import { memo } from 'react'
import { usePlayingIndicatorForGroupBySwitchButton } from './model'
import { t } from '../../index'
import ScreenReaderText from '../ScreenReaderText/index.jsx'

/**
 * @type {React.FC<{}>}
 */
const PlayingIndicatorForGroupBySwitchButton = () => {
    const { isPlaying } = usePlayingIndicatorForGroupBySwitchButton()

    return (
        isPlaying &&
            <>
                <ScreenReaderText
                    text={t({
                        en: 'Playing',
                        zh: '播放中',
                        ja: '再生中',
                    })}
                    asRemark={true}
                />{' '}
            </>

    )
}

export default memo(PlayingIndicatorForGroupBySwitchButton)