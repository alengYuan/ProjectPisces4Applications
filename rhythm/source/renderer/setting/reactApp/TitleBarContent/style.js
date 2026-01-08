import { css } from '@emotion/react'

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

export const icon = css({
    flexShrink: '0',
    flexGrow: '0',
    width: 18,
    height: 18,
})

export const additionalControllerContainer = css({
    position: 'absolute',
    top: '50%',
    left: '50%',
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    transform: 'translate(-50%, -50%)',
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