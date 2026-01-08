import { css } from '@emotion/react'

export const normalButton = css({
    'boxSizing': 'border-box',
    'flexShrink': '0',
    'flexGrow': '0',
    'display': 'flex',
    'justifyContent': 'center',
    'alignItems': 'center',
    'padding': '0 12px',
    'border': '1px solid',
    'borderColor': 'var(--normal-button-border-color)',
    'borderRadius': 5,
    'width': 'max-content',
    'height': 32,
    'background': 'var(--normal-button-background)',
    'color': 'var(--text-color)',
    'fontSize': 14,
    '&[data-hovered]': {
        background: 'var(--normal-button-background-hover)',
    },
    '&[data-pressed]': {
        borderColor: 'var(--normal-button-border-color-active)',
        background: 'var(--normal-button-background-active)',
        color: 'var(--text-color-active)',
    },
    '&[data-focused]': {
        outline: 'none',
    },
    '&[data-focus-visible]': {
        outline: 'var(--accessibility-outline) !important',
    },
})

export const defaultButton = css(normalButton, {
    '&[data-focused], .blurred-container &': {
        borderTop: '1px #ffffff14 solid',
        borderRight: '1px #ffffff14 solid',
        borderBottom: '1px #00000023 solid',
        borderLeft: '1px #ffffff14 solid',
        outline: 'none',
        background: 'var(--primary)',
        color: 'var(--on-primary)',
    },
    '&[data-focused][data-hovered], .blurred-container &[data-hovered]': {
        background:
            'color-mix(in oklab, var(--primary) 90%, var(--card-background))',
    },
    '&[data-focused][data-pressed], .blurred-container &[data-pressed]': {
        borderTop: '1px #ffffff14 solid',
        borderRight: '1px #ffffff14 solid',
        borderBottom: '1px #00000023 solid',
        borderLeft: '1px #ffffff14 solid',
        background:
            'color-mix(in oklab, var(--primary) 80%, var(--card-background))',
        color: 'color-mix(in oklab, var(--on-primary) 90%, var(--on-primary-container))',
    },
})

export const normalFlexButton = css(normalButton, {
    flex: '1',
    display: 'inline-block',
    width: 'auto',
    minWidth: 0,
    wordBreak: 'break-all',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflowX: 'hidden',
})

export const defaultFlexButton = css(defaultButton, {
    flex: '1',
    display: 'inline-block',
    width: 'auto',
    minWidth: 0,
    wordBreak: 'break-all',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflowX: 'hidden',
})