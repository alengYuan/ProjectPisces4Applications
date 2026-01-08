import { memo } from 'react'
import { theOnePlaybackToggleButton, fluentFilled } from './style'
import { useTheOnePlaybackToggleButton } from './model'
import { Button } from 'react-aria-components'

/**
 * @type {React.FC<{
 * title:string,
 * artist:string,
 * }>}
 */
const TheOnePlaybackToggleButton = props => {
    const {
        isDisabled,
        ariaLabel,
        handleButtonPress,
        handleTogglePlaybackTooltip,
        isPlaying,
    } = useTheOnePlaybackToggleButton(props)

    return (
        !isDisabled &&
            <Button
                css={theOnePlaybackToggleButton}
                aria-label={ariaLabel}
                onPress={handleButtonPress}
                onHoverChange={handleTogglePlaybackTooltip}
            >
                <div css={fluentFilled} aria-hidden="true">
                    {isPlaying ? '' : ''}
                </div>
            </Button>

    )
}

export default memo(TheOnePlaybackToggleButton)