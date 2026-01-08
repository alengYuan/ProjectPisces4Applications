import { css } from '@emotion/react'

export const cursorDock = css({
    'position': 'absolute',
    'top': 0,
    'right': 0,
    'margin': 0,
    'width': 1,
    'height': 1,
    'pointerEvents': 'none',
    '&[data-focused]': {
        outline: 'none',
    },
})