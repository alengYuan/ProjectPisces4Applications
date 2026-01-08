import { css } from '@emotion/react'

export const nullLibraryPage = css({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
})

export const nullLibraryContentContainer = css({
    flexShrink: '0',
    flexGrow: '0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 720,
    height: 'min(calc(100% - 16px), 360px)',
})

export const textNullContainer = css({
    flexShrink: '0',
    flexGrow: '0',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: 360,
    height: 'min(100%, 138px)',
})

export const nullLibraryPrompt = css({
    'flexShrink': '0',
    'flexGrow': '0',
    'margin': 0,
    'lineHeight': '36px',
    'color': 'var(--text-color)',
    'fontSize': 28,
    'fontWeight': 'bold',
    'cursor': 'default',
    '&:focus': {
        outline: 'none',
    },
    '&:focus-visible': {
        outline: 'var(--accessibility-outline-non-interactive)',
    },
})

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

export const illustrationNullContainer = css({
    flexShrink: '0',
    flexGrow: '0',
    aspectRatio: 1,
    width: 'auto',
    height: '100%',
    transform: 'translateX(10.83%)',
})