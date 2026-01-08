import { css } from '@emotion/react'

const typeSwitchButton = css({
    'boxSizing': 'border-box',
    'flexShrink': '0',
    'flexGrow': '0',
    'display': 'flex',
    'justifyContent': 'center',
    'alignItems': 'center',
    'borderRadius': 5,
    'width': 44,
    'height': 23,
    'fontSize': 11,
    '&[data-focused]': {
        outline: 'none',
    },
    '&[data-focus-visible]': {
        outline: 'var(--accessibility-outline)',
    },
})

export const activeTypeSwitchButton = css(typeSwitchButton, {
    border: '1px solid',
    borderColor: 'var(--normal-button-border-color)',
    background: 'var(--layer-background)',
    color: 'var(--layer-color-focus)',
})

export const inactiveTypeSwitchButton = css(typeSwitchButton, {
    'border': 'none',
    'background': 'transparent',
    'color': 'var(--text-color-active)',
    '&[data-hovered]': {
        border: '1px solid',
        borderColor: 'var(--normal-button-border-color)',
        background: 'var(--layer-background)',
        color: 'var(--text-color-hover)',
    },
    '&[data-pressed]': {
        color: 'var(--text-color-active)',
        transform: 'scale(0.92)',
    },
})