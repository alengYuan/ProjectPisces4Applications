import { css } from '@emotion/react'

export const disclosurePanel = css({
    flexShrink: '0',
    flexGrow: '0',
    height: 'var(--disclosure-panel-height)',
    overflow: 'clip',
    transition: 'height 0.15s ease-in-out',
})

export const contentContainer = css({
    boxSizing: 'border-box',
    padding: '15px 45px 15px 58px',
    border: '1px var(--panel-border-color) solid',
    borderTop: 'none',
    borderRadius: '0 0 5px 5px',
    width: '100%',
    background: 'var(--panel-magazine-background)',
})