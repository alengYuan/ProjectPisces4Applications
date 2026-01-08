import { memo } from 'react'
import { useActionArea } from './model'
import { t } from '../../index'
import SettingsItemPanel from '../SettingsItemPanel/index.jsx'
import SettingsSwitch from '../SettingsSwitch/index.jsx'

/**
 * @type {React.FC<{}>}
 */
const _ActionArea = () => {
    const { ariaLabel, isSelected, resetTray, status } = useActionArea()

    return (
        <SettingsSwitch
            ariaLabel={ariaLabel}
            isSelected={isSelected}
            onChange={resetTray}
            status={status}
        />
    )
}

const ActionArea = memo(_ActionArea)

/**
 * @type {React.FC<{}>}
 */
const ItemGeneralTray = () =>

    <SettingsItemPanel
        icon=""
        title={t({
            en: 'Minimize to system tray',
            zh: '最小化时隐藏到任务栏托盘',
            ja: '最小化時にタスクトレイ格納',
        })}
        description={t({
            en: 'Enable this feature to hide the taskbar icon when the main window is minimized and show an icon in the system tray',
            zh: '启用该功能，以使任务栏图标在最小化主界面时被隐藏，并在系统托盘区显示图标',
            ja: 'この機能を有効にすると、メイン画面を最小化するときにタスクバーのアイコンを非表示にし、システムトレイにアイコンを表示します',
        })}
    >
        <ActionArea />
    </SettingsItemPanel>

export default memo(ItemGeneralTray)