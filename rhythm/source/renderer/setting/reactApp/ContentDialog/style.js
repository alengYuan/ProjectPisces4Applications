import { css, keyframes } from '@emotion/react'

export const modalOverlay = css({
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#0000004d',
})

const modalEnter = keyframes({
    from: {
        opacity: 0.5,
        transform: 'scale(1.02)',
    },
    to: {
        opacity: 1,
        transform: 'scale(1)',
    },
})

export const modal = css({
    'borderRadius': 7,
    'boxShadow': '0 10px 35px -10px #0000005d',
    'outline': '1px var(--dialog-border-color) solid',
    'outlineOffset': 0,
    'overflow': 'hidden',
    '&[data-entering]': {
        animation: `${modalEnter} 0.16s ease-out`,
    },
})

export const dialog = css({
    boxSizing: 'border-box',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: '28px 21px 99px 21px',
    borderRadius: 7,
    minWidth: 318,
    width: 'var(--dialog-expected-width)',
    maxWidth: 'min(62vw, 656px)',
    height: 'max-content',
    background: 'var(--dialog-information-background)',
    overflow: 'hidden',
})

export const dialogTitle = css({
    flexShrink: '0',
    flexGrow: '0',
    margin: 0,
    padding: '0 3px',
    lineHeight: '28px',
    color: 'var(--text-color)',
    fontSize: 20,
    fontWeight: 'bold',
    wordBreak: 'break-word',
    transform: 'translateY(-4px)',
    cursor: 'default',
})

export const dialogContent = css({
    flexShrink: '0',
    flexGrow: '0',
    padding: 3,
    maxHeight: 'calc(100vh - 264px)',
    overflowY: 'auto',
    transform: 'translateY(-2px)',
})

export const contentText = css({
    'margin': 0,
    'lineHeight': '20px',
    'color': 'var(--text-color)',
    'fontSize': 14,
    'wordBreak': 'break-word',
    'cursor': 'default',
    '&:focus': {
        outline: 'none',
    },
    '&:focus-visible': {
        outline: 'var(--accessibility-outline-non-interactive)',
    },
})

export const actionButtonContainer = css({
    boxSizing: 'border-box',
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '0 24px',
    borderTop: '1px var(--layer-border-color) solid',
    height: 81,
    background: 'var(--layer-background)',
})