import { css } from '@emotion/react'

export const versionText = css({
    'flexShrink': '0',
    'flexGrow': '0',
    'lineHeight': '20px',
    'color': 'var(--text-color-hover)',
    'fontSize': 14,
    'textAlign': 'right',
    'wordBreak': 'break-word',
    'cursor': 'default',
    '&:focus': {
        outline: 'none',
    },
    '&:focus-visible': {
        outline: 'var(--accessibility-outline-non-interactive)',
    },
})