import { css, keyframes } from '@emotion/react'

export const illustrationContainer = css({
    'position': 'relative',
    'flexShrink': '0',
    'flexGrow': '0',
    'width': '100%',
    'height': '100%',
    'overflow': 'hidden',
    '&>svg': {
        position: 'absolute',
        top: 0,
        left: 0,
    },
})

const breathe = keyframes({
    from: {
        transform: 'scale(1)',
    },
    to: {
        transform: 'scale(1.15)',
    },
})

export const primaryLayer = css({
    opacity: 0.65,
    transformBox: 'fill-box',
    transformOrigin: '50% 50%',
    animation: `${breathe} 6s infinite linear alternate`,
})

const imbalance = keyframes({
    '0%': {
        transform: 'rotate(0deg)',
    },
    '25%': {
        transform: 'rotate(90deg)',
    },
    '50%': {
        transform: 'rotate(0deg)',
    },
    '75%': {
        transform: 'rotate(-90deg)',
    },
    '100%': {
        transform: 'rotate(0deg)',
    },
})

export const secondaryLayer = css({
    opacity: 0.65,
    transformBox: 'fill-box',
    transformOrigin: '50% 50%',
    animation: `${imbalance} 36s infinite linear`,
})

const rotate = keyframes({
    from: {
        transform: 'rotate(0deg)',
    },
    to: {
        transform: 'rotate(360deg)',
    },
})

export const tertiaryLayer = css({
    opacity: 0.65,
    transformBox: 'fill-box',
    transformOrigin: '50% 50%',
    animation: `${rotate} 12s infinite linear`,
})