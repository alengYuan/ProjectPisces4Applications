import { css } from '@emotion/react'

export const primaryButton = css({
    'boxSizing': 'border-box',
    'flexShrink': '0',
    'flexGrow': '0',
    'display': 'flex',
    'justifyContent': 'center',
    'alignItems': 'center',
    'padding': '0 12px',
    'borderTop': '1px #ffffff14 solid',
    'borderRight': '1px #ffffff14 solid',
    'borderBottom': '1px #00000023 solid',
    'borderLeft': '1px #ffffff14 solid',
    'borderRadius': 5,
    'width': 'max-content',
    'height': 32,
    'background': 'var(--primary)',
    'color': 'var(--on-primary)',
    'fontSize': 14,
    '&[data-hovered]': {
        background:
            'color-mix(in oklab, var(--primary) 90%, var(--card-background))',
    },
    '&[data-pressed]': {
        background:
            'color-mix(in oklab, var(--primary) 80%, var(--card-background))',
        color: 'color-mix(in oklab, var(--on-primary) 90%, var(--on-primary-container))',
    },
    '&[data-focused]': {
        outline: 'none',
    },
    '&[data-focus-visible]': {
        outline: 'var(--accessibility-outline)',
    },
})