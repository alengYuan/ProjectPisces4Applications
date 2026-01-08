import { css } from '@emotion/react'

export const disclosure = css({
    flexShrink: '0',
    flexGrow: '0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    width: '100%',
})

const disclosureTrigger = css({
    'boxSizing': 'border-box',
    'position': 'relative',
    'flexShrink': '0',
    'flexGrow': '0',
    'display': 'flex',
    'justifyContent': 'space-between',
    'alignItems': 'center',
    'gap': 36,
    'padding': '15px 45px 15px 58px',
    'border': '1px solid',
    'borderColor': 'var(--panel-border-color)',
    'minHeight': 69,
    'background': 'var(--panel-background)',
    '&[data-hovered]': {
        borderColor: 'var(--panel-border-color-hover)',
        background: 'var(--panel-background-hover)',
    },
    '&[data-pressed]': {
        borderColor: 'var(--panel-border-color-active)',
        background: 'var(--panel-background-active)',
    },
    '&[data-focused]': {
        outline: 'none',
    },
    '&[data-focus-visible]': {
        outline: 'var(--accessibility-outline)',
    },
})

export const expandedDisclosureTrigger = css(disclosureTrigger, {
    borderRadius: '5px 5px 0 0',
})

export const collapsedDisclosureTrigger = css(disclosureTrigger, {
    borderRadius: 5,
})

export const disclosureIcon = css({
    position: 'absolute',
    top: '50%',
    left: 0,
    color: 'var(--text-color)',
    fontFamily: 'fluent-regular',
    fontSize: 24,
    transform: 'translate(calc(-50% + 28px), -50%)',
})

export const informationContainer = css({
    flexShrink: '1',
    flexGrow: '1',
    display: 'flex',
    flexDirection: 'column',
})

export const disclosureTitle = css({
    flexShrink: '0',
    flexGrow: '0',
    lineHeight: '19px',
    color: 'var(--text-color)',
    fontSize: 14,
    textAlign: 'left',
    wordBreak: 'break-word',
})

export const disclosureDescription = css({
    flexShrink: '0',
    flexGrow: '0',
    lineHeight: '16px',
    color: 'var(--text-color-hover)',
    fontSize: 12,
    textAlign: 'left',
    wordBreak: 'break-word',
})

export const disclosureStatus = css({
    flexShrink: '0',
    flexGrow: '0',
    lineHeight: '20px',
    color: 'var(--text-color-hover)',
    fontSize: 14,
    textAlign: 'right',
    wordBreak: 'break-word',
})

export const disclosureIndicator = css({
    position: 'absolute',
    top: '50%',
    right: 0,
    color: 'var(--text-color)',
    fontSize: 18,
    transform: 'translate(calc(-50% - 6px), -50%)',
})

const fluentFilled = css({
    fontFamily: 'fluent-filled',
})

export const rotatedIndicator = css(fluentFilled, {
    transform: 'rotate(180deg)',
    transition: 'transform 0.25s ease-in-out',
})

export const normalIndicator = css(fluentFilled, {
    transform: 'rotate(0deg)',
    transition: 'transform 0.25s ease-in-out',
})