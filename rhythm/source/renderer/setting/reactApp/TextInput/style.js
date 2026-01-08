import { css } from '@emotion/react'

export const inputWrapper = css({
    'position': 'relative',
    'flexShrink': '0',
    'flexGrow': '0',
    'borderRadius': 4,
    'overflow': 'hidden',
    '&:focus-within': {
        '&::after': {
            content: '""',
            position: 'absolute',
            right: 0,
            bottom: 0,
            left: 0,
            height: 2,
            background: 'var(--primary)',
        },
    },
})

export const textInput = css({
    'boxSizing': 'border-box',
    'padding': '0 10px 1px 10px',
    'border': '1px solid',
    'borderColor': 'var(--text-input-border-color)',
    'borderRadius': 4,
    'width': '100%',
    'height': 32,
    'background': 'var(--normal-button-background)',
    'color': 'var(--text-color)',
    'fontSize': 14,
    'caretColor': 'var(--text-input-caret-color)',
    '&[data-hovered]': {
        background: 'var(--normal-button-background-hover)',
    },
    '&[data-focused]': {
        outline: 'none',
        background: 'var(--text-input-background-active)',
    },
    '&::selection': {
        backgroundColor: 'var(--accent)',
        color: '#ffffff',
    },
})