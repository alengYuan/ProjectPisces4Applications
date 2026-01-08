import { css, keyframes } from '@emotion/react'

const selfPulse = keyframes({
    '0%': {
        background: 'var(--layer-background)',
    },
    '50%': {
        background: 'var(--layer-border-color)',
    },
    '100%': {
        background: 'var(--layer-background)',
    },
})

const beforeShine = keyframes({
    from: {
        transform: 'skewX(-20deg) translateX(-100%)',
    },
    to: {
        transform: 'skewX(-20deg) translateX(100%)',
    },
})

const skeletonPlaceholder = css({
    'position': 'absolute',
    'top': 0,
    'right': 0,
    'bottom': 0,
    'left': 0,
    'overflow': 'hidden',
    '&::before': {
        content: '""',
        display: 'block',
        width: '100%',
        height: '100%',
        background:
            'linear-gradient(90deg, transparent 0%, var(--card-background-hover) 50%, transparent 100%)',
        transform: 'skewX(-20deg) translateX(-100%)',
    },
})

export const activeSkeletonPlaceholder = css(skeletonPlaceholder, {
    'animation': `${selfPulse} 2s infinite ease-in-out`,
    '&::before': {
        animation: `${beforeShine} 4s infinite ease-in-out`,
    },
})

export const inactiveSkeletonPlaceholder = css(skeletonPlaceholder, {
    'animation': 'none',
    '&::before': {
        animation: 'none',
    },
})