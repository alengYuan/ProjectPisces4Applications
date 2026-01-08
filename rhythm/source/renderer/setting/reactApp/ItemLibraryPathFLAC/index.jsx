import { memo } from 'react'
import {
    actionArea,
    pathText,
    multipleButtonContainer,
    singleButtonContainer,
} from './style'
import { useActionArea, useItemLibraryPathFLAC } from './model'
import { t } from '../../index'
import NormalButton from '../NormalButton/index.jsx'
import SettingsItemCollapsiblePanel from '../SettingsItemCollapsiblePanel/index.jsx'
import SettingsItemCollapsiblePanelMagazine from '../SettingsItemCollapsiblePanelMagazine/index.jsx'

/**
 * @type {React.FC<{}>}
 */
const _ActionArea = () => {
    const { path, pathPrompt, selectDirectoryPath, resetDirectoryPath } =
        useActionArea()

    return (
        <div css={actionArea}>
            {path &&
                <p css={pathText} title={path} tabIndex={0}>
                    {pathPrompt}
                </p>
            }
            <div css={path ? multipleButtonContainer : singleButtonContainer}>
                <NormalButton
                    isFlexible={!path}
                    onPress={selectDirectoryPath}
                    content={t({
                        en: 'Select directory',
                        zh: '选择目录',
                        ja: 'フォルダを選択',
                    })}
                />
                {path &&
                    <NormalButton
                        onPress={resetDirectoryPath}
                        content={t({
                            en: 'Reset',
                            zh: '重置',
                            ja: 'リセット',
                        })}
                    />
                }
            </div>
        </div>
    )
}

const ActionArea = memo(_ActionArea)

/**
 * @type {React.FC<{}>}
 */
const ItemLibraryPathFLAC = () => {
    const { isExpanded, switchPanel, status } = useItemLibraryPathFLAC()

    return (
        <SettingsItemCollapsiblePanel
            isExpanded={isExpanded}
            onPress={switchPanel}
            icon=""
            title={t({
                en: 'Location of FLAC music library on device',
                zh: '设备上的 FLAC 音乐库位置',
                ja: 'デバイス上の FLAC 音楽ライブラリの場所',
            })}
            description={t({
                en: 'Specify the directory on the system for scanning and importing FLAC files, nested directories will not be scanned',
                zh: '指定系统上用于扫描和导入 FLAC 文件的目录，不会扫描嵌套的目录',
                ja: 'FLAC ファイルのスキャンおよびインポートに使用するシステム上のディレクトリを指定します、ネストされたディレクトリはスキャンされません',
            })}
            status={status}
        >
            <SettingsItemCollapsiblePanelMagazine>
                <ActionArea />
            </SettingsItemCollapsiblePanelMagazine>
        </SettingsItemCollapsiblePanel>
    )
}

export default memo(ItemLibraryPathFLAC)