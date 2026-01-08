import { css } from '@emotion/react'

export const textRadio = css({
    'boxSizing': 'border-box',
    'flexShrink': '0',
    'flexGrow': '0',
    'display': 'flex',
    'alignItems': 'center',
    'gap': 8,
    'padding': '1px 0',
    'borderRadius': 5,
    'width': '100%',
    'lineHeight': '20px',
    'color': 'var(--text-color)',
    'fontSize': 14,
    'wordBreak': 'break-word',
    'cursor': 'default',
    '& .indicator': {
        'boxSizing': 'border-box',
        'position': 'relative',
        'flexShrink': '0',
        'flexGrow': '0',
        'border': '1px var(--text-color-hover) solid',
        'borderRadius': 10,
        'width': 20,
        'height': 20,
        'background': '#00000007',
        'transition': 'all 0.09s ease-in-out',
        'pointerEvents': 'none',
        '&::before': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '50%',
            display: 'block',
            borderRadius: '50%',
            boxShadow: '0 1px #00000007',
            width: 12,
            height: 12,
            background: 'var(--on-primary)',
            transform: 'translate(-50%, -50%) scale(0)',
            transition: 'all 0.09s ease-in-out',
        },
    },
    '&[data-hovered] .indicator': {
        background: 'rgb(from var(--text-color-hover) r g b / 0.09)',
    },
    '&[data-pressed] .indicator': {
        'borderColor': 'rgb(from var(--text-color-hover) r g b / 0.5)',
        'background': 'rgb(from var(--text-color-hover) r g b / 0.11)',
        '&::before': {
            boxShadow: '0 1px #00000000',
            transform: 'translate(-50%, -50%) scale(0.8)',
        },
    },
    '&[data-selected] .indicator': {
        'borderColor': 'var(--primary)',
        'background': 'var(--primary)',
        '&::before': {
            transform: 'translate(-50%, -50%) scale(0.9)',
        },
    },
    '&[data-selected][data-hovered] .indicator': {
        'borderColor':
            'color-mix(in oklab, var(--primary) 90%, var(--card-background))',
        'background':
            'color-mix(in oklab, var(--primary) 90%, var(--card-background))',
        '&::before': {
            transform: 'translate(-50%, -50%) scale(1.08)',
        },
    },
    '&[data-selected][data-pressed] .indicator': {
        'borderColor':
            'color-mix(in oklab, var(--primary) 90%, var(--card-background))',
        'background':
            'color-mix(in oklab, var(--primary) 80%, var(--card-background))',
        '&::before': {
            boxShadow: '0 1px #00000000',
            transform: 'translate(-50%, -50%) scale(0.9)',
        },
    },
    '&[data-focused]': {
        outline: 'none',
    },
    '&[data-focus-visible]': {
        outline: 'var(--accessibility-outline)',
    },
})