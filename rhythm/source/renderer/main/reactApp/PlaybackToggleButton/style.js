import { css } from '@emotion/react'

export const playbackToggleButton = css({
    'boxSizing': 'border-box',
    'flexShrink': '0',
    'flexGrow': '0',
    'display': 'flex',
    'justifyContent': 'center',
    'alignItems': 'center',
    'border': 'none',
    'borderRadius': '50%',
    'width': 36,
    'height': 36,
    'background': 'var(--cover-card-primary)',
    'color': 'var(--cover-card-on-primary)',
    'fontSize': 16,
    '&[data-hovered]': {
        background:
            'color-mix(in oklab, var(--cover-card-primary) 90%, var(--cover-card-feedback-mix-material))',
    },
    '&[data-pressed]': {
        background:
            'color-mix(in oklab, var(--cover-card-primary) 80%, var(--cover-card-feedback-mix-material))',
        color: 'color-mix(in oklab, var(--cover-card-on-primary) 90%, var(--cover-card-on-primary-container))',
    },
    '&[data-focused]': {
        outline: 'none',
    },
    '&[data-focus-visible]': {
        outline: 'var(--cover-card-accessibility-outline)',
    },
})

export const fluentFilled = css({
    flexShrink: '0',
    flexGrow: '0',
    fontFamily: 'fluent-filled',
    cursor: 'default',
})