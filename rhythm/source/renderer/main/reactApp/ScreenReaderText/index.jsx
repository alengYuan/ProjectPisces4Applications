import { memo } from 'react'
import { screenReaderText } from './style'
import { useScreenReaderText } from './model'

/**
 * @type {React.FC<{
 * text:string,
 * asRemark?:boolean,
 * isLive?:'polite'|'assertive',
 * }>}
 */
const ScreenReaderText = props => {
    const { isLive, text } = useScreenReaderText(props)

    return (
        <span
            css={screenReaderText}
            {...(isLive ? { 'aria-live': isLive } : {})}
        >
            {text}
        </span>
    )
}

export default memo(ScreenReaderText)