import { memo } from 'react'
import { controlButton, fluentFilled, fluentRegular } from './style'
import { useControlButton } from './model'
import { Button } from 'react-aria-components'

/**
 * @type {React.FC<{
 * ariaLabel:string,
 * isDisabled:boolean,
 * onPress:(event:import("react-aria-components").PressEvent)=>void,
 * onHoverChange:(isHovering:boolean)=>void,
 * type:'filled'|'regular',
 * content:string,
 * }>}
 */
const ControlButton = props => {
    const { ariaLabel, isDisabled, onPress, onHoverChange, type, content } =
        useControlButton(props)

    return (
        <Button
            css={controlButton}
            aria-label={ariaLabel}
            isDisabled={isDisabled}
            onPress={onPress}
            onHoverChange={onHoverChange}
        >
            <div
                css={
                    {
                        filled: fluentFilled,
                        regular: fluentRegular,
                    }[type]
                }
                aria-hidden="true"
            >
                {content}
            </div>
        </Button>
    )
}

export default memo(ControlButton)