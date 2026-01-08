import { css } from '@emotion/react'

export const backButton = css({
    'appRegion': 'no-drag',
    'boxSizing': 'border-box',
    'flexShrink': '0',
    'flexGrow': '0',
    'display': 'flex',
    'justifyContent': 'center',
    'alignItems': 'center',
    'border': 'none',
    'borderRadius': 5,
    'width': 40,
    'height': 36,
    'background': 'transparent',
    'color': 'var(--text-color-hover)',
    'fontSize': 12,
    'transition': 'color 0.35s cubic-bezier(0.51, 0.01, 0, 1.55) 0.12s',
    '& .icon-container': {
        flexShrink: '0',
        flexGrow: '0',
        overflow: 'hidden',
    },
    '& .icon-container>*': {
        transform: 'translateX(0)',
        transition: 'transform 0.35s cubic-bezier(0.51, 0.01, 0, 1.55) 0.12s',
    },
    '&[data-hovered]': {
        background: 'var(--transparent-button-background-hover)',
    },
    '&[data-pressed]': {
        background: 'var(--transparent-button-background-active)',
        color: 'var(--text-color-active)',
        transition: 'color 0.07s cubic-bezier(0.7, 0, 0.9, 0.3)',
    },
    '&[data-pressed] .icon-container>*': {
        transform: 'translateX(3px)',
        transition: 'transform 0.07s cubic-bezier(0.7, 0, 0.9, 0.3)',
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

export const segoe = css({
    fontFamily: '"Segoe Fluent Icons"',
    cursor: 'default',
})