import { css } from '@emotion/react'

export const songRequestPlatform = css({
    flexShrink: '1',
    flexGrow: '1',
    display: 'flex',
    minHeight: 0,
})

const songCandidatePlatform = css({
    boxSizing: 'border-box',
    flexShrink: '1',
    flexGrow: '1',
    display: 'flex',
    flexDirection: 'column',
    borderTop: '1px var(--layer-border-color) solid',
    overflow: 'hidden',
})

export const readySongCandidatePlatform = css(songCandidatePlatform, {
    borderLeft: '1px var(--layer-border-color) solid',
    borderRadius: '8px 0 0 0',
})

export const unreadySongCandidatePlatform = css(songCandidatePlatform)

export const songCandidateControlPanel = css({
    flexShrink: '1',
    flexGrow: '1',
    minHeight: 0,
    background: 'var(--page-background)',
})

export const songCandidateEdgeSpace = css({
    flexShrink: '0',
    flexGrow: '0',
    borderTop: '1px var(--layer-border-color) solid',
    height: 8,
})