import { css } from '@emotion/react'

export const app = css({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    pointerEvents: 'auto',
})

export const titleBar = css({
    appRegion: 'drag',
    position: 'relative',
    flexShrink: '0',
    flexGrow: '0',
    display: 'flex',
    justifyContent: 'space-between',
    width: '100vw',
})

export const titleNavigationContainer = css({
    boxSizing: 'border-box',
    flexShrink: '0',
    flexGrow: '0',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '7px 0 6px 5px',
    width: 'calc((100vw - env(titlebar-area-width)) / 3 * 4)',
})

export const additionalControllerContainer = css({
    position: 'absolute',
    top: 12,
    left: 'calc(50vw - 60px)',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
})

export const refreshButton = css({
    'appRegion': 'no-drag',
    'boxSizing': 'border-box',
    'flexShrink': '0',
    'flexGrow': '0',
    'display': 'flex',
    'justifyContent': 'center',
    'alignItems': 'center',
    'border': 'none',
    'borderRadius': 5,
    'width': 25,
    'height': 25,
    'background': 'transparent',
    'color': 'var(--text-color)',
    'fontSize': 14,
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
})

export const fluentRegular = css({
    flexShrink: '0',
    flexGrow: '0',
    fontFamily: 'fluent-regular',
    cursor: 'default',
})

export const typeNavigationContainer = css({
    appRegion: 'no-drag',
    flexShrink: '0',
    flexGrow: '0',
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    padding: 1,
    borderRadius: 6,
    boxShadow: 'var(--tab-slot-border)',
    background: 'var(--tab-slot-background)',
})

export const topButtonGroupContainer = css({
    boxSizing: 'border-box',
    flexShrink: '0',
    flexGrow: '0',
    display: 'flex',
    paddingTop: 1,
    paddingRight: 'calc(100vw - env(titlebar-area-width))',
    height: 'env(titlebar-area-height)',
})

export const body = css({
    flexShrink: '1',
    flexGrow: '1',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
})

export const controlBar = css({
    boxSizing: 'border-box',
    flexShrink: '0',
    flexGrow: '0',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 16,
    borderTop: '1px var(--layer-border-color) solid',
    background: 'var(--page-background)',
})

export const controlButtonGroupContainer = css({
    flexShrink: '1',
    flexGrow: '1',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
})