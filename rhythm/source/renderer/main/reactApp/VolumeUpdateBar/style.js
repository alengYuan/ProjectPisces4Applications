import { css } from '@emotion/react'

const volumeUpdateBar = css({
    flexShrink: '0',
    flexGrow: '0',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: 3,
    overflowX: 'clip',
    transform: 'translateX(-3px)',
    transition: 'width 0.18s ease-in',
})

export const activeVolumeUpdateBar = css(volumeUpdateBar, {
    width: 166,
})

export const inactiveVolumeUpdateBar = css(volumeUpdateBar, {
    width: 36,
})

export const ariaHiddenContainer = css({
    flexShrink: '0',
    flexGrow: '0',
    display: 'flex',
})

export const panelToggleButton = css({
    'boxSizing': 'border-box',
    'flexShrink': '0',
    'flexGrow': '0',
    'display': 'flex',
    'justifyContent': 'center',
    'alignItems': 'center',
    'border': 'none',
    'borderRadius': 5,
    'width': 36,
    'height': 36,
    'background': 'transparent',
    'color': 'var(--text-color)',
    'fontSize': 17,
    '&[data-hovered]': {
        background: 'var(--transparent-button-background-hover)',
    },
    '&[data-pressed]': {
        background: 'var(--transparent-button-background-active)',
        color: 'var(--text-color-active)',
    },
    '&[data-focused]': {
        outline: 'none',
    },
    '&[data-focus-visible]': {
        outline: 'var(--accessibility-outline)',
    },
    '&[data-disabled]': {
        background: 'transparent',
        color: 'var(--text-color-disabled)',
        opacity: 0.75,
    },
})

export const fluentFilled = css({
    flexShrink: '0',
    flexGrow: '0',
    fontFamily: 'fluent-filled',
    cursor: 'default',
})

export const fluentRegular = css({
    flexShrink: '0',
    flexGrow: '0',
    fontFamily: 'fluent-regular',
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
    borderRadius: 2,
    width: '100%',
    height: 4,
    background: 'var(--slider-track-background)',
})

export const sliderMask = css({
    position: 'absolute',
    top: '50%',
    borderRadius: '2px 0 0 2px',
    width: 'var(--slider-mask-coverage)',
    height: 4,
    background: 'var(--primary)',
    transform: 'translateY(-50%)',
})

export const sliderThumb = css({
    'boxSizing': 'border-box',
    'border': '5px var(--slider-thumb-border-color) solid',
    'borderRadius': 10,
    'boxShadow': '0 0 1px #000000',
    'width': 20,
    'height': 20,
    'background': 'var(--primary)',
    'transition': 'border-width 0.12s ease-in-out',
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

export const volumeValue = css({
    flexShrink: '0',
    flexGrow: '0',
    width: 18,
    color: 'var(--text-color)',
    fontSize: 11,
    cursor: 'default',
})