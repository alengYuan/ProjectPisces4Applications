import { css } from '@emotion/react'

const titleBar = css({
    position: 'relative',
    flexShrink: '0',
    flexGrow: '0',
    display: 'flex',
    justifyContent: 'space-between',
    width: '100vw',
})

export const interactiveTitleBar = css(titleBar, {
    appRegion: 'drag',
})

export const nonInteractiveTitleBar = css(titleBar, {
    appRegion: 'no-drag',
})