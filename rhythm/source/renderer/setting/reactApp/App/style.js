import { css } from '@emotion/react'

export const app = css({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    pointerEvents: 'auto',
})

export const body = css({
    flexShrink: '1',
    flexGrow: '1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: 0,
    overflowX: 'hidden',
    overflowY: 'auto',
})