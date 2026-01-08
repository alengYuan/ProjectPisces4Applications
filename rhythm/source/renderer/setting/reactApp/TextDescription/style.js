import { css } from '@emotion/react'

export const textDescription = css({
    'flexShrink': '0',
    'flexGrow': '0',
    'margin': 0,
    'lineHeight': '20px',
    'color': 'var(--text-color)',
    'fontSize': 14,
    'wordBreak': 'break-word',
    'cursor': 'default',
    '&:focus': {
        outline: 'none',
    },
    '&:focus-visible': {
        outline: 'var(--accessibility-outline-non-interactive)',
    },
})