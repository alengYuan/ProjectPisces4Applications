import { memo } from 'react'
import { fluentRegular } from './style'
import { usePlayingIndicatorForGroupNameSwitchButton } from './model'
import { t } from '../../index'
import ScreenReaderText from '../ScreenReaderText/index.jsx'

/**
 * @type {React.FC<{
 * groupName:string,
 * }>}
 */
const PlayingIndicatorForGroupNameSwitchButton = props => {
    const { isPlaying, currentPageGroupBy } =
        usePlayingIndicatorForGroupNameSwitchButton(props)

    return (
        <>
            <div css={fluentRegular} aria-hidden="true">
                {isPlaying
                    ? ''
                    : {
                        album: '',
                        artist: '',
                    }[currentPageGroupBy]}
            </div>
            {isPlaying &&
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
            }
        </>
    )
}

export default memo(PlayingIndicatorForGroupNameSwitchButton)