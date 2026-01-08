import { memo } from 'react'
import {
    actionArea,
    itemContainer,
    itemTitle,
    buttonContainer,
    flexButtonContainer,
} from './style'
import { useFormArea, useActionArea, useItemModeCandidate } from './model'
import { t } from '../../index'
import FormDialog from '../FormDialog/index.jsx'
import FormInput from '../FormInput/index.jsx'
import FormRadio from '../FormRadio/index.jsx'
import NormalButton from '../NormalButton/index.jsx'
import SettingsItemCollapsiblePanel from '../SettingsItemCollapsiblePanel/index.jsx'
import SettingsItemCollapsiblePanelMagazine from '../SettingsItemCollapsiblePanelMagazine/index.jsx'
import TextDescription from '../TextDescription/index.jsx'

/**
 * @type {React.FC<{
 * referenceValue:[uuid:string,value:{
 * label:string,
 * device:string,
 * volume:number,
 * }],
 * updateProposal:(uuid:string,value:{
 * label:string,
 * device:string,
 * volume:number,
 * })=>void,
 * deviceCandidateList:Array<[key:string,value:string]>,
 * }>}
 */
const _FormArea = props => {
    const {
        labelValue,
        updateLabelValue,
        deviceValue,
        deviceBackupValue,
        updateDeviceValue,
        deviceCandidateList,
    } = useFormArea(props)

    return (
        <>
            <TextDescription>
                {t({
                    en: 'Please note that the following processing steps will be executed upon submission. Leading and trailing whitespace will be automatically trimmed from the mode name field value. The mode name value will be automatically ignored and removed in the following scenario: the value is empty or contains only whitespace. If the mode name value is empty, the mode will be automatically removed.',
                    zh: '提交时，您需要注意以下处理工序将被执行。模式名称字段值两侧的空白字符会被自动移除。以下情况，模式名称的值会被自动忽略和移除：本身值为空或只含空白字符。当模式名称的值为空时，模式将被自动移除。',
                    ja: '提出時、以下の処理工程が実行されることにご注意ください。モード名フィールド値両端の空白文字は自動的に除去されます。モード名の値が空である、または空白文字のみを含む場合、自動的に無視され削除されます。モード名の値が空である場合、そのモードは自動的に削除されます。',
                })}
            </TextDescription>
            <FormInput
                value={labelValue}
                onChange={updateLabelValue}
                label={t({
                    en: 'Mode name',
                    zh: '模式名称',
                    ja: 'モード名',
                })}
            />
            <FormRadio
                value={deviceValue}
                backupValue={deviceBackupValue}
                onChange={updateDeviceValue}
                label={t({
                    en: 'Audio device',
                    zh: '音频设备',
                    ja: 'オーディオ デバイス',
                })}
                candidateList={deviceCandidateList}
            />
        </>
    )
}

const FormArea = memo(_FormArea)

/**
 * @type {React.FC<{}>}
 */
const _ActionArea = () => {
    const {
        modeList,
        prepareModeForm,
        removeMode,
        isOpen,
        dialogTitle,
        actionButton,
        closeButton,
        targetMode,
        updateProposal,
        deviceCandidateList,
    } = useActionArea()

    return (
        <div css={actionArea}>
            {Boolean(modeList.length) &&
                modeList.map(([uuid, { label }]) =>

                    <div key={uuid} css={itemContainer}>
                        <p id={uuid} css={itemTitle} tabIndex={0}>
                            {label}
                        </p>
                        <div
                            css={buttonContainer}
                            role="region"
                            aria-labelledby={uuid}
                            data-uuid={uuid}
                        >
                            <NormalButton
                                onPress={prepareModeForm}
                                content={t({
                                    en: 'Edit scene mode',
                                    zh: '编辑情景模式',
                                    ja: 'シーンモードを編集',
                                })}
                            />
                            <NormalButton
                                onPress={removeMode}
                                content={t({
                                    en: 'Delete',
                                    zh: '删除',
                                    ja: '削除',
                                })}
                            />
                        </div>
                    </div>)}
            <div css={flexButtonContainer}>
                <NormalButton
                    isFlexible={true}
                    onPress={prepareModeForm}
                    content={t({
                        en: 'Add scene mode',
                        zh: '添加情景模式',
                        ja: 'シーンモードを追加',
                    })}
                />
            </div>
            <FormDialog
                isOpen={isOpen}
                title={dialogTitle}
                actionButton={actionButton}
                closeButton={closeButton}
            >
                <FormArea
                    referenceValue={targetMode}
                    updateProposal={updateProposal}
                    deviceCandidateList={deviceCandidateList}
                />
            </FormDialog>
        </div>
    )
}

const ActionArea = memo(_ActionArea)

/**
 * @type {React.FC<{}>}
 */
const ItemModeCandidate = () => {
    const { isExpanded, switchPanel, status } = useItemModeCandidate()

    return (
        <SettingsItemCollapsiblePanel
            isExpanded={isExpanded}
            onPress={switchPanel}
            icon="󰂡"
            title={t({
                en: 'Scene mode candidates',
                zh: '情景模式候选预设',
                ja: 'シーンモードの候補項目',
            })}
            description={t({
                en: 'Edit scene mode candidates for quick switching, bind audio output devices to modes, and each mode will have independent volume levels in the player',
                zh: '编辑可被快速切换的情景模式候选项，将音频输出设备绑定到模式项上。每个模式在播放器中将具有独立的音量大小',
                ja: 'クイック切り替え可能なシーンモードの候補項目を編集します。各モードにオーディオ出力デバイスを割り当てます。また、モードごとにプレーヤー内での音量が独立しています',
            })}
            status={status}
        >
            <SettingsItemCollapsiblePanelMagazine>
                <ActionArea />
            </SettingsItemCollapsiblePanelMagazine>
        </SettingsItemCollapsiblePanel>
    )
}

export default memo(ItemModeCandidate)