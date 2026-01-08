import { css } from '@emotion/react'

export const progressUpdateBar = css({
    flexShrink: '1',
    flexGrow: '1',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '0 8px',
})

export const timeValue = css({
    flexShrink: '0',
    flexGrow: '0',
    color: 'var(--text-color)',
    fontSize: 11,
    cursor: 'default',
})

export const sliderContainer = css({
    flexShrink: '1',
    flexGrow: '1',
})

export const sliderTrackContainer = css({
    'width': '100%',
    '&[data-disabled] .slider-track': {
        background: 'var(--slider-track-background-disabled)',
    },
    '&[data-disabled] .slider-track>*': {
        display: 'none',
    },
    '&[data-disabled] .slider-mask': {
        opacity: 0,
    },
})

export const sliderTrackArea = css({
    position: 'absolute',
    top: '50%',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    height: 28,
    transform: 'translateY(-50%)',
})

export const sliderTrack = css({
    display: 'flex',
    justifyContent: 'right',
    borderRadius: 2,
    width: '100%',
    height: 4,
    overflow: 'hidden',
})

const sliderTrackFilling = css({
    flexShrink: '0',
    flexGrow: '0',
    width: 'calc(100% - var(--slider-mask-coverage))',
    background: 'var(--slider-track-background)',
})

export const agileSliderTrackFilling = css(sliderTrackFilling, {
    transition: 'none',
})

export const smoothSliderTrackFilling = css(sliderTrackFilling, {
    transition: 'width 1s linear',
})

const sliderMaskContainer = css({
    position: 'absolute',
    top: '50%',
    width: 'var(--slider-mask-coverage)',
    height: 28,
    transform: 'translateY(-50%)',
})

export const agileSliderMaskContainer = css(sliderMaskContainer, {
    transition: 'none',
})

export const smoothSliderMaskContainer = css(sliderMaskContainer, {
    transition: 'width 1s linear',
})

export const sliderDynamicMask = css({
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
})

export const sliderStaticMask = css({
    position: 'absolute',
    top: '50%',
    borderRadius: '2px 0 0 2px',
    width: '100%',
    height: 4,
    background: 'var(--primary)',
    transform: 'translateY(-50%)',
})

const sliderThumb = css({
    'boxSizing': 'border-box',
    'border': '5px var(--slider-thumb-border-color) solid',
    'borderRadius': 10,
    'boxShadow': '0 0 1px #000000',
    'width': 20,
    'height': 20,
    'background': 'var(--primary)',
    '&[data-hovered]': {
        borderWidth: 3,
    },
    '&[data-dragging]': {
        borderWidth: 6,
        background:
            'color-mix(in oklab, var(--primary) 85%, var(--slider-thumb-border-color))',
    },
    '&[data-focused]': {
        outline: 'none',
    },
    '&[data-focus-visible]': {
        outline: 'var(--accessibility-outline)',
    },
    '&[data-disabled]': {
        borderWidth: 5,
        background: 'var(--slider-thumb-background-disabled)',
    },
})

export const agileSliderThumb = css(sliderThumb, {
    transition: 'border-width 0.12s ease-in-out',
})

export const smoothSliderThumb = css(sliderThumb, {
    transition: 'left 1s linear, border-width 0.12s ease-in-out',
})