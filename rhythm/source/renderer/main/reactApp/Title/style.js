import { css } from '@emotion/react'

const title = css({
    flexShrink: '1',
    flexGrow: '1',
    paddingLeft: 4,
    fontFamily: 'slothindie-rings',
    fontSize: 16,
    overflow: 'hidden',
    cursor: 'default',
})

export const focusedTitle = css(title, {
    color: 'var(--layer-color-focus)',
    textShadow: '0 0 0 var(--layer-color-focus)',
})

export const blurredTitle = css(title, {
    color: 'var(--layer-color-blur)',
    textShadow: '0 0 0 var(--layer-color-blur)',
})