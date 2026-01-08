import { css } from '@emotion/react'

const title = css({
    flexShrink: '1',
    flexGrow: '1',
    paddingLeft: 8,
    fontSize: 12,
    overflow: 'hidden',
    cursor: 'default',
})

export const focusedTitle = css(title, {
    color: 'var(--layer-color-focus)',
})

export const blurredTitle = css(title, {
    color: 'var(--layer-color-blur)',
})