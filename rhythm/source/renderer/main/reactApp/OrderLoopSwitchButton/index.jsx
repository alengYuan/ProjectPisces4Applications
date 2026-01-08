import { memo } from 'react'
import { useOrderLoopSwitchButton } from './model'
import ControlButton from '../ControlButton/index.jsx'

/**
 * @type {React.FC<{}>}
 */
const OrderLoopSwitchButton = () => {
    const { ariaLabel, isDisabled, onPress, onHoverChange, content } =
        useOrderLoopSwitchButton()

    return (
        <ControlButton
            ariaLabel={ariaLabel}
            isDisabled={isDisabled}
            onPress={onPress}
            onHoverChange={onHoverChange}
            type="regular"
            content={content}
        />
    )
}

export default memo(OrderLoopSwitchButton)