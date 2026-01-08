import { memo } from 'react'
import { textDescription } from './style'
import { useTextDescription } from './model'

/**
 * @type {React.FC<React.PropsWithChildren<{}>>}
 */
const TextDescription = props => {
    const { children } = useTextDescription(props)

    return (
        <p css={textDescription} tabIndex={0}>
            {children}
        </p>
    )
}

export default memo(TextDescription)