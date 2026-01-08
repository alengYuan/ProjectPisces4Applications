import { css } from '@emotion/react'

export const itemPanel = css({
    boxSizing: 'border-box',
    position: 'relative',
    flexShrink: '0',
    flexGrow: '0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 36,
    padding: '15px 16px 15px 58px',
    border: '1px var(--panel-border-color) solid',
    borderRadius: 5,
    width: '100%',
    minHeight: 69,
    background: 'var(--panel-background)',
})

export const itemIcon = css({
    position: 'absolute',
    top: '50%',
    left: 0,
    color: 'var(--text-color)',
    fontFamily: 'fluent-regular',
    fontSize: 24,
    transform: 'translate(calc(-50% + 28px), -50%)',
    cursor: 'default',
})

export const informationContainer = css({
    flexShrink: '1',
    flexGrow: '1',
    display: 'flex',
    flexDirection: 'column',
})

export const itemTitle = css({
    flexShrink: '0',
    flexGrow: '0',
    lineHeight: '19px',
    color: 'var(--text-color)',
    fontSize: 14,
    wordBreak: 'break-word',
    cursor: 'default',
})

export const itemDescription = css({
    flexShrink: '0',
    flexGrow: '0',
    lineHeight: '16px',
    color: 'var(--text-color-hover)',
    fontSize: 12,
    wordBreak: 'break-word',
    cursor: 'default',
})

export const actionArea = css({
    flexShrink: '0',
    flexGrow: '0',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
})