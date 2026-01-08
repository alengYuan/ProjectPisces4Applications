import { css } from '@emotion/react'

export const formFlexButtonContainer = css({
    flexShrink: '0',
    flexGrow: '0',
    display: 'flex',
})

export const actionArea = css({
    display: 'flex',
    flexDirection: 'column',
})

export const itemContainer = css({
    'boxSizing': 'border-box',
    'flexShrink': '0',
    'flexGrow': '0',
    'display': 'flex',
    'justifyContent': 'space-between',
    'alignItems': 'center',
    'gap': 36,
    'padding': '15px 0',
    'boxShadow': '0 2px 0 -1px var(--panel-border-color)',
    'width': '100%',
    'minHeight': 69,
    '&:first-child': {
        paddingTop: 0,
        minHeight: 54,
    },
})

export const informationContainer = css({
    'flexShrink': '1',
    'flexGrow': '0',
    'display': 'flex',
    'flexDirection': 'column',
    'margin': 0,
    'overflowX': 'hidden',
    'cursor': 'default',
    '&:focus': {
        outline: 'none',
    },
    '&:focus-visible': {
        outline: 'var(--accessibility-outline-non-interactive)',
    },
})

export const itemTitle = css({
    flexShrink: '0',
    flexGrow: '0',
    lineHeight: '20px',
    color: 'var(--text-color)',
    fontSize: 14,
    wordBreak: 'break-all',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflowX: 'hidden',
})

export const itemDetail = css({
    flexShrink: '0',
    flexGrow: '0',
    lineHeight: '16px',
    color: 'var(--text-color-hover)',
    fontSize: 12,
    wordBreak: 'break-all',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflowX: 'hidden',
})

export const buttonContainer = css({
    flexShrink: '0',
    flexGrow: '0',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
})

export const flexButtonContainer = css({
    'flexShrink': '0',
    'flexGrow': '0',
    'display': 'flex',
    '&:last-child': {
        paddingTop: 15,
    },
    '&:first-child': {
        paddingTop: 0,
    },
})