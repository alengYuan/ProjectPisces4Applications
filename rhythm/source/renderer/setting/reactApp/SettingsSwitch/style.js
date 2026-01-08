import { css } from '@emotion/react'

export const settingsSwitch = css({
    'boxSizing': 'border-box',
    'position': 'relative',
    'flexShrink': '0',
    'flexGrow': '0',
    'display': 'flex',
    'alignItems': 'center',
    'gap': 12,
    'padding': '8px 4px',
    'borderRadius': 5,
    '& .indicator': {
        'boxSizing': 'border-box',
        'flexShrink': '0',
        'flexGrow': '0',
        'padding': '3px 2px',
        'border': '1px var(--text-color-hover) solid',
        'borderRadius': 10,
        'width': 40,
        'background': '#00000007',
        'transition': 'all 0.15s ease-in-out',
        'pointerEvents': 'none',
        '&::before': {
            content: '""',
            display: 'block',
            borderRadius: 6,
            width: 12,
            height: 12,
            background: 'var(--text-color-hover)',
            transformOrigin: 'left center',
            transition: 'all 0.15s ease-in-out',
        },
    },
    '&[data-hovered] .indicator': {
        'background': 'rgb(from var(--text-color-hover) r g b / 0.09)',
        '&::before': {
            transform: 'scale(1.16)',
        },
    },
    '&[data-pressed] .indicator': {
        'background': 'rgb(from var(--text-color-hover) r g b / 0.11)',
        '&::before': {
            width: 15,
        },
    },
    '&[data-selected] .indicator': {
        'borderColor': 'var(--primary)',
        'background': 'var(--primary)',
        '&::before': {
            background: 'var(--on-primary)',
            transformOrigin: 'right center',
            transform: 'translateX(22px)',
        },
    },
    '&[data-selected][data-hovered] .indicator': {
        'borderColor':
            'color-mix(in oklab, var(--primary) 90%, var(--card-background))',
        'background':
            'color-mix(in oklab, var(--primary) 90%, var(--card-background))',
        '&::before': {
            transform: 'translateX(22px) scale(1.16)',
        },
    },
    '&[data-selected][data-pressed] .indicator': {
        'borderColor':
            'color-mix(in oklab, var(--primary) 80%, var(--card-background))',
        'background':
            'color-mix(in oklab, var(--primary) 80%, var(--card-background))',
        '&::before': {
            transform: 'translateX(19px) scale(1.16)',
        },
    },
    '&[data-focused]': {
        outline: 'none',
    },
    '&[data-focus-visible]': {
        outline: 'var(--accessibility-outline)',
    },
})

export const switchStatus = css({
    flexShrink: '0',
    flexGrow: '0',
    lineHeight: '20px',
    color: 'var(--text-color)',
    fontSize: 14,
    wordBreak: 'break-word',
    cursor: 'default',
})