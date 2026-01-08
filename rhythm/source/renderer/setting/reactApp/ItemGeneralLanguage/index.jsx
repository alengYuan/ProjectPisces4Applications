import { memo } from 'react'
import { actionArea, radioItem } from './style'
import { useActionArea, useItemGeneralLanguage } from './model'
import { t } from '../../index'
import { Radio, RadioGroup } from 'react-aria-components'
import ContentDialog from '../ContentDialog/index.jsx'
import SettingsItemCollapsiblePanel from '../SettingsItemCollapsiblePanel/index.jsx'
import SettingsItemCollapsiblePanelMagazine from '../SettingsItemCollapsiblePanelMagazine/index.jsx'

/**
 * @type {React.FC<{}>}
 */
const _ActionArea = () => {
    const { currentValue, changeLanguage, isOpen, firstButton, closeButton } =
        useActionArea()

    return (
        <>
            <RadioGroup
                css={actionArea}
                aria-label={t({
                    en: 'Available languages',
                    zh: '候选语言',
                    ja: '候補言語',
                })}
                value={currentValue}
            >
                <Radio css={radioItem} value="en" onPress={changeLanguage}>
                    <div className="indicator" aria-hidden="true" />
                    English
                </Radio>
                <Radio css={radioItem} value="zh" onPress={changeLanguage}>
                    <div className="indicator" aria-hidden="true" />
                    简体中文
                </Radio>
                <Radio css={radioItem} value="ja" onPress={changeLanguage}>
                    <div className="indicator" aria-hidden="true" />
                    日本語
                </Radio>
            </RadioGroup>
            <ContentDialog
                isOpen={isOpen}
                title={t({
                    en: 'Change settings',
                    zh: '变更设置项',
                    ja: '設定の変更',
                })}
                content={t({
                    en: "Changing the player's display language will reboot the application immediately. Continue?",
                    zh: '变更播放器的显示语言，这将立即重启应用，要继续吗？',
                    ja: 'プレーヤーの表示言語を変更すると、アプリケーションが直ちに再起動されます。続行しますか？',
                })}
                firstButton={firstButton}
                closeButton={closeButton}
            />
        </>
    )
}

const ActionArea = memo(_ActionArea)

/**
 * @type {React.FC<{}>}
 */
const ItemGeneralLanguage = () => {
    const { isExpanded, switchPanel, status } = useItemGeneralLanguage()

    return (
        <SettingsItemCollapsiblePanel
            isExpanded={isExpanded}
            onPress={switchPanel}
            icon=""
            title={t({
                en: 'Player display language',
                zh: '播放器显示语言',
                ja: 'プレーヤーの表示言語',
            })}
            description={t({
                en: 'Specify the display language for player interface, notifications, default values, and other areas',
                zh: '指定用于播放器界面、通知、缺省值等位置的显示语言',
                ja: 'プレーヤーの画面、通知、既定値などで使用される言語を指定します',
            })}
            status={status}
        >
            <SettingsItemCollapsiblePanelMagazine>
                <ActionArea />
            </SettingsItemCollapsiblePanelMagazine>
        </SettingsItemCollapsiblePanel>
    )
}

export default memo(ItemGeneralLanguage)