import { memo } from 'react'
import { useActionArea } from './model'
import { t } from '../../index'
import ContentDialog from '../ContentDialog/index.jsx'
import SettingsItemPanel from '../SettingsItemPanel/index.jsx'
import SettingsSwitch from '../SettingsSwitch/index.jsx'

/**
 * @type {React.FC<{}>}
 */
const _ActionArea = () => {
    const {
        ariaLabel,
        isSelected,
        resetRemote,
        status,
        isOpen,
        firstButton,
        closeButton,
    } = useActionArea()

    return (
        <>
            <SettingsSwitch
                ariaLabel={ariaLabel}
                isSelected={isSelected}
                onChange={resetRemote}
                status={status}
            />
            <ContentDialog
                isOpen={isOpen}
                title={t({
                    en: 'Change settings',
                    zh: '变更设置项',
                    ja: '設定の変更',
                })}
                content={t({
                    en: 'Changing the activation status of RMTC will reboot the application immediately. Continue?',
                    zh: '变更 RMTC 的启用状态，这将立即重启应用，要继续吗？',
                    ja: 'RMTC の有効化ステータスを変更すると、アプリケーションが直ちに再起動されます。続行しますか？',
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
const ItemOtherRemote = () =>

    <SettingsItemPanel
        icon=""
        title={t({
            en: 'Allow playback commands from the network',
            zh: '允许来自网络的播放指令',
            ja: 'ネットワーク経由の再生操作を許可',
        })}
        description={t({
            en: 'Enable RMTC to remotely control playback, pause, or track changes of this player via HTTP requests. Please only enable within a secure local network',
            zh: '启用 RMTC，以允许通过 HTTP 请求来远程控制此播放器的播放、暂停或曲目切换，请在安全的局域网内使用',
            ja: 'RMTC を有効にすると、HTTP リクエスト経由で本プレーヤーの再生、一時停止、曲の切替を遠隔操作できます。安全なローカルネットワーク内でご利用ください',
        })}
    >
        <ActionArea />
    </SettingsItemPanel>

export default memo(ItemOtherRemote)