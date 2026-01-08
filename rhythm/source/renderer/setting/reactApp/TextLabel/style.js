import { css } from '@emotion/react'

export const ariaHiddenContainer = css({
    flexShrink: '0',
    flexGrow: '0',
})

export const textLabel = css({
    lineHeight: '20px',
    color: 'var(--text-color)',
    fontSize: 14,
    wordBreak: 'break-word',
    pointerEvents: 'none',
})