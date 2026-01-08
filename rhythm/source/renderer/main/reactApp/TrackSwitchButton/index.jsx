import { memo } from 'react'
import { useTrackSwitchButton } from './model'
import ControlButton from '../ControlButton/index.jsx'

/**
 * @type {React.FC<{
 * target:'previous'|'next',
 * }>}
 */
const TrackSwitchButton = props => {
    const { ariaLabel, isDisabled, onPress, onHoverChange, content } =
        useTrackSwitchButton(props)

    return (
        <ControlButton
            ariaLabel={ariaLabel}
            isDisabled={isDisabled}
            onPress={onPress}
            onHoverChange={onHoverChange}
            type="filled"
            content={content}
        />
    )
}

export default memo(TrackSwitchButton)