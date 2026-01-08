import { memo } from 'react'
import { fluentRegular } from './style'
import { usePlayingIndicatorForGroupNameSwitchJumpButton } from './model'

/**
 * @type {React.FC<{
 * by:'album'|'artist',
 * name:string,
 * }>}
 */
const PlayingIndicatorForGroupNameSwitchJumpButton = props => {
    const { isPlaying, by } =
        usePlayingIndicatorForGroupNameSwitchJumpButton(props)

    return (
        <div css={fluentRegular} aria-hidden="true">
            {isPlaying
                ? ''
                : {
                    album: '',
                    artist: '',
                }[by]}
        </div>
    )
}

export default memo(PlayingIndicatorForGroupNameSwitchJumpButton)