import { css } from '@emotion/react'

const topButton = css({
    'appRegion': 'no-drag',
    'boxSizing': 'border-box',
    'flexShrink': '0',
    'flexGrow': '0',
    'display': 'flex',
    'justifyContent': 'center',
    'alignItems': 'center',
    'border': 'none',
    'borderRadius': 0,
    'width': 'calc((100vw - env(titlebar-area-width)) / 3)',
    'background': 'var(--layer-background)',
    'fontSize': 16,
    'transition': 'background 0.135s cubic-bezier(0.5, 0.66, 0.66, 1)',
    '&[data-hovered]': {
        background: 'var(--layer-background-hover)',
        transition: 'background 0.135s cubic-bezier(0.5, 0.66, 0.66, 1)',
    },
    '&[data-pressed]': {
        background: 'var(--layer-background-active)',
        transition: 'background 0s',
    },
    '&[data-focused]': {
        outline: 'none',
    },
    '&[data-focus-visible]': {
        outline: 'none',
        background: 'var(--layer-background-hover)',
        transition: 'background 0s',
    },
})

export const focusedTopButton = css(topButton, {
    color: 'var(--layer-color-focus)',
})

export const blurredTopButton = css(topButton, {
    color: 'var(--layer-color-blur)',
})

export const fluentRegular = css({
    flexShrink: '0',
    flexGrow: '0',
    fontFamily: 'fluent-regular',
    cursor: 'default',
})