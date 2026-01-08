import { memo } from 'react'
import { playbackToggleButton, fluentFilled } from './style'
import { usePlaybackToggleButton } from './model'

/**
 * @type {React.FC<{
 * index:number,
 * uuid:string,
 * title:string,
 * artist:string,
 * }>}
 */
const PlaybackToggleButton = props => {
    const {
        reactARIAProps,
        playbackToggleButtonRef,
        ariaLabel,
        reactARIAPseudoClassesDataset,
        uuid,
        isPlaying,
    } = usePlaybackToggleButton(props)

    return (
        <button
            {...reactARIAProps}
            ref={playbackToggleButtonRef}
            className="playback-toggle-button"
            css={playbackToggleButton}
            role="menuitem"
            aria-label={ariaLabel}
            {...reactARIAPseudoClassesDataset}
            data-uuid={uuid}
        >
            <div css={fluentFilled} aria-hidden="true">
                {isPlaying ? '' : ''}
            </div>
        </button>
    )
}

export default memo(PlaybackToggleButton)