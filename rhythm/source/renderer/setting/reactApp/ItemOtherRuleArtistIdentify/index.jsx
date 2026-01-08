import { memo } from 'react'
import {
    formFlexButtonContainer,
    actionArea,
    itemContainer,
    informationContainer,
    itemTitle,
    itemDetail,
    buttonContainer,
    flexButtonContainer,
} from './style'
import {
    useFormArea,
    useActionArea,
    useItemOtherRuleArtistIdentify,
} from './model'
import { t } from '../../index'
import FormDialog from '../FormDialog/index.jsx'
import FormInput from '../FormInput/index.jsx'
import NormalButton from '../NormalButton/index.jsx'
import SettingsItemCollapsiblePanel from '../SettingsItemCollapsiblePanel/index.jsx'
import SettingsItemCollapsiblePanelMagazine from '../SettingsItemCollapsiblePanelMagazine/index.jsx'
import TextDescription from '../TextDescription/index.jsx'

/**
 * @type {React.FC<{
 * referenceValue:[uuid:string,value:{
 * group:string,
 * member:Array<string>,
 * }],
 * updateProposal:(uuid:string,value:{
 * group:string,
 * member:Array<string>,
 * })=>void,
 * }>}
 */
const _FormArea = props => {
    const { groupValue, updateGroupValue, memberList, insertMember } =
        useFormArea(props)

    return (
        <>
            <TextDescription>
                {t({
                    en: 'Please note that the following processing steps will be executed upon submission. Leading and trailing whitespace will be automatically trimmed from the source artist and target artist field values. Target artist values will be automatically ignored and removed in the following scenarios: the value is empty or contains only whitespace; the value is identical to the source artist value; or another target artist field with the same value already exists. The source artist must map to at least one target artist. If the source artist value is empty or there are no valid target artists, the rule will be automatically removed.',
                    zh: '提交时，您需要注意以下处理工序将被执行。源艺术家和目标艺术家字段值两侧的空白字符会被自动移除。以下情况，目标艺术家的值会被自动忽略和移除：本身值为空或只含空白字符；与源艺术家的值相同；已存在值相同的其他目标艺术家字段。源艺术家需要映射到至少一个目标艺术家，当源艺术家的值为空或没有有效的目标艺术家时，规则将被自动移除。',
                    ja: '提出時、以下の処理工程が実行されることにご注意ください。ソース アーティストとターゲット アーティストのフィールド値両端の空白文字は自動的に除去されます。ターゲット アーティストの値が以下に該当する場合、自動的に無視され削除されます。値が空である、または空白文字のみを含む場合。ソース アーティストの値と同一である場合。既に同一の値を持つ別のターゲット アーティスト フィールドが存在する場合。ソース アーティストは少なくとも1つのターゲット アーティストにマッピングされている必要があります。ソース アーティストの値が空である、または有効なターゲット アーティストがない場合、その規則は自動的に削除されます。',
                })}
            </TextDescription>
            <FormInput
                value={groupValue}
                onChange={updateGroupValue}
                label={t({
                    en: 'Source artist',
                    zh: '源艺术家',
                    ja: 'ソース アーティスト',
                })}
            />
            {memberList.map(({ memberValue, updateMemberValue }, index) =>

                <FormInput
                    key={index}
                    value={memberValue}
                    onChange={updateMemberValue}
                    label={`${t({
                        en: 'Target artist',
                        zh: '目标艺术家',
                        ja: 'ターゲット アーティスト',
                    })} ${index + 1}`}
                />)}
            <div css={formFlexButtonContainer}>
                <NormalButton
                    isFlexible={true}
                    onPress={insertMember}
                    content={t({
                        en: 'Add target artist',
                        zh: '添加目标艺术家',
                        ja: 'ターゲット アーティストを追加',
                    })}
                />
            </div>
        </>
    )
}

const FormArea = memo(_FormArea)

/**
 * @type {React.FC<{}>}
 */
const _ActionArea = () => {
    const {
        ruleMapList,
        prepareArtistIdentifyRuleForm,
        removeArtistIdentifyRule,
        isOpen,
        dialogTitle,
        actionButton,
        closeButton,
        targetRule,
        updateProposal,
    } = useActionArea()

    return (
        <div css={actionArea}>
            {Boolean(ruleMapList.length) &&
                ruleMapList.map(([uuid, { group, member }]) =>

                    <div key={uuid} css={itemContainer}>
                        <p id={uuid} css={informationContainer} tabIndex={0}>
                            <span css={itemTitle}>{group}</span>
                            <span
                                css={itemDetail}
                                title={t({
                                    en: member.join(', '),
                                    zh: member.join('、'),
                                    ja: member.join('・'),
                                })}
                            >
                                {t({
                                    en: `Maps to: ${member.join(', ')}`,
                                    zh: `映射到：${member.join('、')}`,
                                    ja: `マッピング先：${member.join('・')}`,
                                })}
                            </span>
                        </p>
                        <div
                            css={buttonContainer}
                            role="region"
                            aria-labelledby={uuid}
                            data-uuid={uuid}
                        >
                            <NormalButton
                                onPress={prepareArtistIdentifyRuleForm}
                                content={t({
                                    en: 'Edit rule',
                                    zh: '编辑规则',
                                    ja: '規則を編集',
                                })}
                            />
                            <NormalButton
                                onPress={removeArtistIdentifyRule}
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
                    onPress={prepareArtistIdentifyRuleForm}
                    content={t({
                        en: 'Add rule',
                        zh: '添加规则',
                        ja: '規則を追加',
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
                    referenceValue={targetRule}
                    updateProposal={updateProposal}
                />
            </FormDialog>
        </div>
    )
}

const ActionArea = memo(_ActionArea)

/**
 * @type {React.FC<{}>}
 */
const ItemOtherRuleArtistIdentify = () => {
    const { isExpanded, switchPanel, status } = useItemOtherRuleArtistIdentify()

    return (
        <SettingsItemCollapsiblePanel
            isExpanded={isExpanded}
            onPress={switchPanel}
            icon=""
            title={t({
                en: 'Artist field mapping rules',
                zh: '艺术家字段映射规则',
                ja: 'アーティスト フィールドのマッピング規則',
            })}
            description={t({
                en: 'Set the mapping rules for the artist field, which will cause the source artist\'s works to appear in the target artist\'s work list. This can be used to map a group name to multiple member names, or to map between an artist\'s various stage names. For example: map "The Beatles" to "Paul McCartney, Ringo Starr, George Harrison and John Lennon", or map "Diddy" to "Puff Daddy"',
                zh: '设置艺术家字段的映射规则，这将使源艺术家的作品出现在目标艺术家的作品列表中，可以用于将组合名映射到多个成员名，或在某个艺术家的多个艺名间做映射。例如，将“凤凰传奇”映射到“杨魏玲花和曾毅”，或将“王菲”映射到“王靖雯”',
                ja: 'アーティスト フィールドのマッピング規則を設定します。これにより、ソース アーティストの作品が、ターゲット アーティストの作品リストに表示されるようになります。これは、グループ名を複数のメンバー名にマッピングしたり、あるアーティストの複数の芸名を相互にマッピングしたりするために使用できます。例えば、「YOASOBI」を「幾田りらと Ayase」にマッピング、または「米津玄師」を「ハチ」にマッピング',
            })}
            status={status}
        >
            <SettingsItemCollapsiblePanelMagazine>
                <ActionArea />
            </SettingsItemCollapsiblePanelMagazine>
        </SettingsItemCollapsiblePanel>
    )
}

export default memo(ItemOtherRuleArtistIdentify)