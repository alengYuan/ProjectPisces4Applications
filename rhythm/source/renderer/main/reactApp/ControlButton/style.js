import { css } from '@emotion/react'

export const controlButton = css({
    'boxSizing': 'border-box',
    'flexShrink': '0',
    'flexGrow': '0',
    'display': 'flex',
    'justifyContent': 'center',
    'alignItems': 'center',
    'border': 'none',
    'borderRadius': 5,
    'width': 36,
    'height': 36,
    'background': 'transparent',
    'color': 'var(--text-color)',
    'fontSize': 17,
    '&[data-hovered]': {
        background: 'var(--transparent-button-background-hover)',
    },
    '&[data-pressed]': {
        background: 'var(--transparent-button-background-active)',
        color: 'var(--text-color-active)',
    },
    '&[data-focused]': {
        outline: 'none',
    },
    '&[data-focus-visible]': {
        outline: 'var(--accessibility-outline)',
    },
    '&[data-disabled]': {
        background: 'transparent',
        color: 'var(--text-color-disabled)',
        opacity: 0.75,
    },
})

export const fluentFilled = css({
    flexShrink: '0',
    flexGrow: '0',
    fontFamily: 'fluent-filled',
    cursor: 'default',
})

export const fluentRegular = css({
    flexShrink: '0',
    flexGrow: '0',
    fontFamily: 'fluent-regular',
    cursor: 'default',
})