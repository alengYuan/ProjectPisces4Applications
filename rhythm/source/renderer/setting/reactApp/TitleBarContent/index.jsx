import { memo } from 'react'
import {
    titleNavigationContainer,
    icon,
    additionalControllerContainer,
    topButtonGroupContainer,
} from './style'
import { useTitleBarContent } from './model'
import { t } from '../../index'
import BackButton from '../BackButton/index.jsx'
import CursorDock from '../CursorDock/index.jsx'
import PageKeySwitchButton from '../PageKeySwitchButton/index.jsx'
import Title from '../Title/index.jsx'
import TopButton from '../TopButton/index.jsx'

/**
 * @type {React.FC<{}>}
 */
const TitleBarContent = () => {
    const { switchTabPanel } = useTitleBarContent()

    return (
        <>
            <div css={titleNavigationContainer}>
                <BackButton />
                <picture css={icon} aria-hidden="true">
                    <source
                        srcSet="./asset/image/theme-light-window-icon.png"
                        media="(prefers-color-scheme: light)"
                    />
                    <source
                        srcSet="./asset/image/theme-dark-window-icon.png"
                        media="(prefers-color-scheme: dark)"
                    />
                    <img width="100%" height="100%" />
                </picture>
                <Title />
            </div>
            <div css={topButtonGroupContainer}>
                <TopButton />
            </div>
            <CursorDock />
            <div
                css={additionalControllerContainer}
                role="tablist"
                aria-label={t({
                    en: 'Categories',
                    zh: '类别',
                    ja: 'カテゴリ',
                })}
                aria-orientation="horizontal"
                onKeyDown={switchTabPanel}
            >
                <PageKeySwitchButton />
            </div>
        </>
    )
}

export default memo(TitleBarContent)