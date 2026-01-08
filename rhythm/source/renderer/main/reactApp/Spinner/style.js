import { css, keyframes } from '@emotion/react'

const selfRotate = keyframes({
    from: {
        transform: 'rotate(0deg)',
    },
    to: {
        transform: 'rotate(360deg)',
    },
})

export const spinner = css({
    position: 'absolute',
    top: 14,
    left: 14,
    width: 20,
    height: 20,
    background: 'var(--primary-container)',
    color: 'var(--primary)',
    maskImage:
        'radial-gradient(closest-side, transparent calc(100% - 3px), black calc(100% - 2px) calc(100% - 1px), transparent 100%)',
    animation: `${selfRotate} 1.5s infinite linear`,
})

const decorationSelfRotate = keyframes({
    '0%': {
        transform: 'rotate(-135deg)',
    },
    '50%': {
        transform: 'rotate(0deg)',
    },
    '100%': {
        transform: 'rotate(225deg)',
    },
})

const decorationBeforeRotate = keyframes({
    '0%': {
        transform: 'rotate(0deg)',
    },
    '50%': {
        transform: 'rotate(105deg)',
    },
    '100%': {
        transform: 'rotate(0deg)',
    },
})

const decorationAfterRotate = keyframes({
    '0%': {
        transform: 'rotate(0deg)',
    },
    '50%': {
        transform: 'rotate(225deg)',
    },
    '100%': {
        transform: 'rotate(0deg)',
    },
})

export const spinnerDecoration = css({
    'position': 'absolute',
    'width': '100%',
    'height': '100%',
    'maskImage': 'conic-gradient(transparent 105deg, black 105.5deg)',
    'animation': `${decorationSelfRotate} 1.5s infinite cubic-bezier(0.33, 0, 0.67, 1)`,
    '&::before': {
        content: '""',
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: 'conic-gradient(currentColor 135deg, transparent 135.5deg)',
        animation: `${decorationBeforeRotate} 1.5s infinite cubic-bezier(0.33, 0, 0.67, 1)`,
    },
    '&::after': {
        content: '""',
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: 'conic-gradient(currentColor 135deg, transparent 135.5deg)',
        animation: `${decorationAfterRotate} 1.5s infinite cubic-bezier(0.33, 0, 0.67, 1)`,
    },
})