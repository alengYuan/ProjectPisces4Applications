import { memo } from 'react'
import { inputWrapper, textInput } from './style'
import { useTextInput } from './model'
import { Input } from 'react-aria-components'

/**
 * @type {React.FC<{}>}
 */
const TextInput = () => {
    const { popupInputContextMenu } = useTextInput()

    return (
        <div css={inputWrapper}>
            <Input css={textInput} onContextMenu={popupInputContextMenu} />
        </div>
    )
}

export default memo(TextInput)