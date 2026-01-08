import { css } from '@emotion/react'

export const emptyLibraryPage = css({
    width: '100%',
    height: '100%',
    overflowY: 'auto',
})

export const libraryPage = css({
    boxSizing: 'border-box',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    padding: '36px 54px 0 54px',
    width: '100%',
    height: '100%',
})

export const emptyLibraryContentContainer = css({
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 42,
    padding: '36px 0',
    width: '100%',
    minHeight: '100%',
})

export const illustrationEmptyContainer = css({
    flexShrink: '0',
    flexGrow: '0',
    width: 296,
    height: 296,
})

export const emptyLibraryPrompt = css({
    'flexShrink': '0',
    'flexGrow': '0',
    'margin': 0,
    'lineHeight': '28px',
    'color': 'var(--text-color)',
    'fontSize': 20,
    'fontWeight': 'bold',
    'textAlign': 'center',
    'cursor': 'default',
    '&:focus': {
        outline: 'none',
    },
    '&:focus-visible': {
        outline: 'var(--accessibility-outline-non-interactive)',
    },
})

export const libraryHeadContainer = css({
    flexShrink: '0',
    flexGrow: '0',
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: 12,
})