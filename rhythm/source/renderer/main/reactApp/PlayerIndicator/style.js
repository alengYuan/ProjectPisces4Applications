import { css } from '@emotion/react'

export const playerIndicator = css({
    display: 'flex',
    alignItems: 'center',
    gap: 21,
    padding: '33px 16px 18px 49px',
    width: 145,
    background: [
        'linear-gradient(to left, var(--cover-card-on-primary), rgb(from var(--cover-card-on-primary) r g b / 0) 38%) left center / 127px 169px no-repeat,',
        'linear-gradient(to right, var(--cover-card-on-primary), rgb(from var(--cover-card-on-primary) r g b / 0) 38%) left center / 127px 169px no-repeat,',
        'radial-gradient(ellipse at center, rgb(from var(--cover-card-on-primary) r g b / 0.19), rgb(from var(--cover-card-on-primary) r g b / 0.38) 62%) left center / 127px 169px no-repeat,',
        'var(--cover-card-image-url) left center / 127px 169px no-repeat,',
        'var(--cover-card-on-primary)',
    ].join(' '),
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
    textAlign: 'right',
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
    textAlign: 'right',
    wordBreak: 'break-all',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflowX: 'hidden',
    cursor: 'default',
})