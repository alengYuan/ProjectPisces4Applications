import { css } from '@emotion/react'

export const actionArea = css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 36,
})

export const ruleText = css({
    'flexShrink': '1',
    'flexGrow': '0',
    'margin': 0,
    'lineHeight': '20px',
    'color': 'var(--text-color)',
    'fontSize': 14,
    'wordBreak': 'break-all',
    'whiteSpace': 'nowrap',
    'textOverflow': 'ellipsis',
    'overflowX': 'hidden',
    'cursor': 'default',
    '&:focus': {
        outline: 'none',
    },
    '&:focus-visible': {
        outline: 'var(--accessibility-outline-non-interactive)',
    },
})

const buttonContainer = css({
    display: 'flex',
})

export const multipleButtonContainer = css(buttonContainer, {
    flexShrink: '0',
    flexGrow: '0',
    alignItems: 'center',
    gap: 8,
})

export const singleButtonContainer = css(buttonContainer, {
    flexShrink: '1',
    flexGrow: '1',
})