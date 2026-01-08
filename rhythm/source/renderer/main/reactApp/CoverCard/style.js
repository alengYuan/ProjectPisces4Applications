import { css } from '@emotion/react'

export const coverCardContainer = css({
    'position': 'relative',
    'borderRadius': 8,
    'width': '100%',
    'height': '100%',
    'background': 'var(--cover-card-on-primary)',
    '&.observed': {
        background:
            'var(--cover-card-image-url) center center / cover no-repeat, var(--cover-card-on-primary)',
    },
})

export const highQualityDecoration = css({
    position: 'absolute',
    top: 12,
    left: 12,
    display: 'block',
    width: 28,
    height: 26,
    objectFit: 'fill',
    mixBlendMode: 'screen',
})

export const controlArea = css({
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: '0 0 8px 8px',
    overflow: 'hidden',
})

export const informationContainer = css({
    flexShrink: '1',
    flexGrow: '1',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 1,
    minWidth: 0,
    height: 36,
})

export const songTitle = css({
    flexShrink: '0',
    flexGrow: '0',
    width: '100%',
    lineHeight: '16px',
    color: 'var(--cover-card-on-primary-container)',
    fontSize: 12,
    wordBreak: 'break-all',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflowX: 'hidden',
    cursor: 'default',
})

export const songArtist = css({
    flexShrink: '0',
    flexGrow: '0',
    width: '100%',
    lineHeight: '16px',
    color: 'var(--cover-card-primary)',
    fontSize: 12,
    wordBreak: 'break-all',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflowX: 'hidden',
    cursor: 'default',
})