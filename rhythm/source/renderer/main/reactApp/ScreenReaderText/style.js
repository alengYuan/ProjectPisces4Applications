import { css } from '@emotion/react'

export const screenReaderText = css({
    position: 'absolute',
    display: 'inline-block',
    margin: -1,
    padding: 0,
    border: 'none',
    width: 1,
    height: 1,
    whiteSpace: 'nowrap',
    clip: 'rect(0, 0, 0, 0)',
    opacity: 0,
    overflow: 'hidden',
})