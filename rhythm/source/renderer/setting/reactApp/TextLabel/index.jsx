import { memo } from 'react'
import { ariaHiddenContainer, textLabel } from './style'
import { useTextLabel } from './model'
import { Label } from 'react-aria-components'

/**
 * @type {React.FC<{
 * labelARIAIsHidden?:boolean,
 * content:string,
 * }>}
 */
const TextLabel = props => {
    const { labelARIAIsHidden, content } = useTextLabel(props)

    return (
        <div css={ariaHiddenContainer} aria-hidden={labelARIAIsHidden}>
            <Label css={textLabel}>{content}</Label>
        </div>
    )
}

export default memo(TextLabel)