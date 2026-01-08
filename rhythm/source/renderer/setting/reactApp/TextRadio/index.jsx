import { memo } from 'react'
import { textRadio } from './style'
import { useTextRadio } from './model'
import { ListBoxItem } from 'react-aria-components'

/**
 * @type {React.FC<{
 * id:string,
 * content:string,
 * }>}
 */
const TextRadio = props => {
    const { id, content } = useTextRadio(props)

    return (
        <ListBoxItem css={textRadio} id={id}>
            <div className="indicator" aria-hidden="true" />
            {content}
        </ListBoxItem>
    )
}

export default memo(TextRadio)