import { memo } from 'react'
import {
    actionArea,
    ruleText,
    multipleButtonContainer,
    singleButtonContainer,
} from './style'
import {
    useFormArea,
    useActionArea,
    useItemOtherRuleArtistSplit,
} from './model'
import { t } from '../../index'
import FormDialog from '../FormDialog/index.jsx'
import FormInput from '../FormInput/index.jsx'
import NormalButton from '../NormalButton/index.jsx'
import SettingsItemCollapsiblePanel from '../SettingsItemCollapsiblePanel/index.jsx'
import SettingsItemCollapsiblePanelMagazine from '../SettingsItemCollapsiblePanelMagazine/index.jsx'

/**
 * @type {React.FC<{
 * referenceValue:string,
 * updateProposal:(proposal:string)=>void,
 * }>}
 */
const _FormArea = props => {
    const { value, updateValue } = useFormArea(props)

    return (
        <>
            <FormInput
                value={value}
                onChange={updateValue}
                label={t({
                    en: 'Separator text',
                    zh: '分隔符文本',
                    ja: '区切り文字',
                })}
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
        rule,
        rulePrompt,
        prepareArtistSplitRuleForm,
        isOpen,
        actionButton,
        closeButton,
        updateProposal,
        resetArtistSplitRule,
    } = useActionArea()

    return (
        <div css={actionArea}>
            {rule &&
                <p
                    css={ruleText}
                    title={t({
                        en: `"${rule}"`,
                        zh: `“${rule}”`,
                        ja: `「${rule}」`,
                    })}
                    tabIndex={0}
                >
                    {rulePrompt}
                </p>
            }
            <div css={rule ? multipleButtonContainer : singleButtonContainer}>
                <NormalButton
                    isFlexible={!rule}
                    onPress={prepareArtistSplitRuleForm}
                    content={t({
                        en: 'Edit separator',
                        zh: '编辑分隔符',
                        ja: '区切り文字を編集',
                    })}
                />
                <FormDialog
                    isOpen={isOpen}
                    title={t({
                        en: 'Edit separator',
                        zh: '编辑分隔符',
                        ja: '区切り文字を編集',
                    })}
                    actionButton={actionButton}
                    closeButton={closeButton}
                >
                    <FormArea
                        referenceValue={rule}
                        updateProposal={updateProposal}
                    />
                </FormDialog>
                {rule &&
                    <NormalButton
                        onPress={resetArtistSplitRule}
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
const ItemOtherRuleArtistSplit = () => {
    const { isExpanded, switchPanel, status } = useItemOtherRuleArtistSplit()

    return (
        <SettingsItemCollapsiblePanel
            isExpanded={isExpanded}
            onPress={switchPanel}
            icon=""
            title={t({
                en: 'Artist field separator text',
                zh: '艺术家字段分隔符文本',
                ja: 'アーティスト フィールドの区切り文字',
            })}
            description={t({
                en: 'Specify the separator text used for the artist field, this can be one or multiple characters, no field splitting if empty',
                zh: '指定用于艺术家字段的分隔符文本，可以包含一个字符或多个字符，如果为空，则不进行字段分割',
                ja: 'アーティスト フィールドで使用する区切り文字を指定します。単一または複数の文字を設定可能で、空の場合はフィールドの分割は行いません',
            })}
            status={status}
        >
            <SettingsItemCollapsiblePanelMagazine>
                <ActionArea />
            </SettingsItemCollapsiblePanelMagazine>
        </SettingsItemCollapsiblePanel>
    )
}

export default memo(ItemOtherRuleArtistSplit)