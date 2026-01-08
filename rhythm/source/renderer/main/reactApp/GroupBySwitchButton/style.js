import { css } from '@emotion/react'

const groupBySwitchButton = css({
    'position': 'relative',
    'flexShrink': '0',
    'flexGrow': '0',
    'display': 'flex',
    'justifyContent': 'center',
    'alignItems': 'center',
    'padding': '0 6px',
    'border': 'none',
    'borderRadius': 5,
    'height': 38,
    'background': 'transparent',
    'color': 'var(--text-color)',
    'fontSize': 13,
    '&::after': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: '50%',
        borderRadius: 2,
        width: 0,
        height: 3,
        background: 'transparent',
        transform: 'translateX(-50%)',
        transition: 'width 0.05s ease-in',
    },
    '&[data-focused]': {
        outline: 'none',
    },
    '&[data-focus-visible]': {
        outline: 'var(--accessibility-outline)',
    },
})

export const activeGroupBySwitchButton = css(groupBySwitchButton, {
    '&::after': {
        width: 16,
        background: 'var(--primary)',
    },
})

export const inactiveGroupBySwitchButton = css(groupBySwitchButton, {
    '&[data-hovered]': {
        color: 'var(--text-color-hover)',
    },
    '&[data-pressed]': {
        color: 'var(--text-color-active)',
    },
})