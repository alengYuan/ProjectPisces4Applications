import { memo } from 'react'
import { useOrderModeSwitchButton } from './model'
import ControlButton from '../ControlButton/index.jsx'

/**
 * @type {React.FC<{}>}
 */
const OrderModeSwitchButton = () => {
    const { ariaLabel, isDisabled, onPress, onHoverChange, content } =
        useOrderModeSwitchButton()

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

export default memo(OrderModeSwitchButton)