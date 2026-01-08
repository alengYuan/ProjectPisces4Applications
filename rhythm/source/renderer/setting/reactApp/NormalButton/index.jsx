import { memo } from 'react'
import {
    defaultFlexButton,
    defaultButton,
    normalFlexButton,
    normalButton,
} from './style'
import { useNormalButton } from './model'
import { Button } from 'react-aria-components'

/**
 * @type {React.FC<{
 * isDefault?:boolean,
 * isFlexible?:boolean,
 * ariaDescribedBy?:string,
 * onPress:(event:import("react-aria-components").PressEvent)=>void,
 * content:string,
 * }>}
 */
const NormalButton = props => {
    const { isDefault, isFlexible, ariaDescribedBy, onPress, content } =
        useNormalButton(props)

    return (
        <Button
            css={
                isDefault
                    ? isFlexible
                        ? defaultFlexButton
                        : defaultButton
                    : isFlexible
                        ? normalFlexButton
                        : normalButton
            }
            aria-describedby={ariaDescribedBy}
            onPress={onPress}
        >
            {content}
        </Button>
    )
}

export default memo(NormalButton)