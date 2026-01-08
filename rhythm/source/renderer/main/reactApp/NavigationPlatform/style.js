import { css } from '@emotion/react'

export const navigationPlatform = css({
    flexShrink: '0',
    flexGrow: '0',
    display: 'flex',
    flexDirection: 'column',
    width: 259,
})

export const groupByNavigationContainer = css({
    flexShrink: '0',
    flexGrow: '0',
    display: 'flex',
    gap: 2,
    padding: '0 11px 6px 12px',
})

export const additionalNavigationContainer = css({
    flexShrink: '0',
    flexGrow: '0',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: '4px 4px 4px 5px',
    borderTop: '1px var(--layer-border-color) solid',
})

export const ariaHiddenContainer = css({
    flexShrink: '0',
    flexGrow: '0',
    display: 'flex',
    flexDirection: 'column',
})

const groupNameSwitchButton = css({
    'position': 'relative',
    'flexShrink': '0',
    'flexGrow': '0',
    'display': 'flex',
    'justifyContent': 'space-between',
    'alignItems': 'center',
    'gap': 15,
    'padding': '0 11px',
    'border': 'none',
    'borderRadius': 5,
    'height': 36,
    'color': 'var(--text-color)',
    'fontSize': 19,
    'contentVisibility': 'auto',
    'containIntrinsicSize': 'auto 250px auto 36px',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: '50%',
        left: 0,
        borderRadius: 2,
        width: 3,
        height: 0,
        background: 'transparent',
        transform: 'translateY(-50%)',
        transition: 'height 0.05s ease-in',
    },
    '&[data-focused]': {
        outline: 'none',
    },
    '&[data-focus-visible]': {
        outline: 'var(--accessibility-outline)',
    },
})

export const inactiveGroupNameSwitchButton = css(groupNameSwitchButton, {
    'background': 'transparent',
    '&[data-hovered]': {
        background: 'var(--transparent-button-background-hover)',
    },
    '&[data-pressed]': {
        background: 'var(--transparent-button-background-active)',
        color: 'var(--text-color-active)',
    },
})

export const fluentRegular = css({
    flexShrink: '0',
    flexGrow: '0',
    fontFamily: 'fluent-regular',
    cursor: 'default',
})

export const buttonText = css({
    flexShrink: '1',
    flexGrow: '1',
    minWidth: 0,
    fontSize: 14,
    textAlign: 'left',
    wordBreak: 'break-all',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflowX: 'hidden',
})