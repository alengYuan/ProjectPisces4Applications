import { css } from '@emotion/react'

const libraryContentContainer = css({
    'flexShrink': '1',
    'flexGrow': '1',
    'display': 'flex',
    'flexWrap': 'wrap',
    'alignContent': 'flex-start',
    'rowGap': 19,
    'columnGap': 24,
    'paddingTop': 12,
    'paddingBottom': 42,
    'minHeight': 0,
    'overflowY': 'auto',
    '&:focus': {
        outline: 'none',
    },
    '&:focus-visible': {
        outline: 'none',
    },
})

export const loadingLibraryContentContainer = css(libraryContentContainer, {
    '& .skeleton-placeholder': {
        opacity: 1,
        transform: 'translateX(0)',
        transition: 'opacity 0.13s ease-in 0.3s, transform 0.13s ease-in 0.3s',
    },
    '& .cover-card-container': {
        transform: 'scale(0.93)',
        transition: 'transform 0.13s ease-in',
    },
    '& .playback-toggle-button': {
        display: 'none',
    },
})

export const loadedLibraryContentContainer = css(libraryContentContainer, {
    '& .skeleton-placeholder': {
        opacity: 0.42,
        transform: 'translateX(-100%)',
        transition: 'opacity 0s, transform 0s',
        pointerEvents: 'none',
    },
    '& .cover-card-container': {
        transform: 'scale(1)',
        transition: 'transform 0s',
    },
    '& .playback-toggle-button': {
        display: 'flex',
    },
})