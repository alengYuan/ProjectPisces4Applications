import { memo } from 'react'
import { activePageKeySwitchButton, inactivePageKeySwitchButton } from './style'
import { usePageKeySwitchButton } from './model'
import { t } from '../../index'
import TabSwitchButton from '../TabSwitchButton/index.jsx'

/**
 * @type {React.FC<{}>}
 */
const PageKeySwitchButton = () => {
    const { currentPage, goToPage } = usePageKeySwitchButton()

    return (
        <>
            <TabSwitchButton
                id="page-key-general"
                css={
                    currentPage === 'general'
                        ? activePageKeySwitchButton
                        : inactivePageKeySwitchButton
                }
                tabIndex={currentPage === 'general' ? 0 : -1}
                aria-selected={currentPage === 'general'}
                aria-controls="settings-page"
                data-page-key="general"
                onPress={goToPage}
            >
                {t({
                    en: 'General',
                    zh: '通用',
                    ja: '一般',
                })}
            </TabSwitchButton>
            <TabSwitchButton
                id="page-key-library"
                css={
                    currentPage === 'library'
                        ? activePageKeySwitchButton
                        : inactivePageKeySwitchButton
                }
                tabIndex={currentPage === 'library' ? 0 : -1}
                aria-selected={currentPage === 'library'}
                aria-controls="settings-page"
                data-page-key="library"
                onPress={goToPage}
            >
                {t({
                    en: 'Library',
                    zh: '媒体库',
                    ja: 'ライブラリ',
                })}
            </TabSwitchButton>
            <TabSwitchButton
                id="page-key-mode"
                css={
                    currentPage === 'mode'
                        ? activePageKeySwitchButton
                        : inactivePageKeySwitchButton
                }
                tabIndex={currentPage === 'mode' ? 0 : -1}
                aria-selected={currentPage === 'mode'}
                aria-controls="settings-page"
                data-page-key="mode"
                onPress={goToPage}
            >
                {t({
                    en: 'Mode',
                    zh: '模式',
                    ja: 'モード',
                })}
            </TabSwitchButton>
            <TabSwitchButton
                id="page-key-other"
                css={
                    currentPage === 'other'
                        ? activePageKeySwitchButton
                        : inactivePageKeySwitchButton
                }
                tabIndex={currentPage === 'other' ? 0 : -1}
                aria-selected={currentPage === 'other'}
                aria-controls="settings-page"
                data-page-key="other"
                onPress={goToPage}
            >
                {t({
                    en: 'Other',
                    zh: '其他',
                    ja: 'その他',
                })}
            </TabSwitchButton>
            <TabSwitchButton
                id="page-key-about"
                css={
                    currentPage === 'about'
                        ? activePageKeySwitchButton
                        : inactivePageKeySwitchButton
                }
                tabIndex={currentPage === 'about' ? 0 : -1}
                aria-selected={currentPage === 'about'}
                aria-controls="settings-page"
                data-page-key="about"
                onPress={goToPage}
            >
                {t({
                    en: 'About',
                    zh: '关于',
                    ja: 'バージョン情報',
                })}
            </TabSwitchButton>
        </>
    )
}

export default memo(PageKeySwitchButton)