import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useImmer } from 'use-immer'
import { useOtherRuleArtistIdentify } from '../model'
import { current } from 'immer'
import { v4 as uuid } from 'uuid'
import { t } from '../../index'

/**
 * @type {(groupValue:string,memberValueList:Array<string>)=>{
 * group:string,
 * member:Array<string>,
 * }}
 */
const filterValidProposal = (groupValue, memberValueList) =>
    ({
        group: groupValue,
        member: memberValueList.filter(
            memberValue =>
                memberValue.trim() && memberValue.trim() !== groupValue.trim(),
        ),
    })

/**
 * @type {(props:{
 * referenceValue:[uuid:string,value:{
 * group:string,
 * member:Array<string>,
 * }],
 * updateProposal:(uuid:string,value:{
 * group:string,
 * member:Array<string>,
 * })=>void,
 * })=>{
 * groupValue:string,
 * updateGroupValue:(value:string)=>void,
 * memberList:Array<{
 * memberValue:string,
 * updateMemberValue:(value:string)=>void,
 * }>,
 * insertMember:()=>void,
 * }}
 */
export const useFormArea = ({ referenceValue, updateProposal }) => {
    const [groupValue, setGroupValue] = useState(referenceValue[1].group)

    const [memberValueList, updateMemberValueList] = useImmer(
        referenceValue[1].member,
    )

    const memberList = useMemo(
        /**
         * @type {()=>Array<{
         * memberValue:string,
         * updateMemberValue:(value:string)=>void,
         * }>}
         */
        () =>
            memberValueList.map((memberValue, index) =>
                ({
                    memberValue,
                    updateMemberValue: value => {
                        updateMemberValueList(draft => {
                            draft[index] = value

                            const snapshot = current(draft)

                            updateProposal(
                                referenceValue[0],
                                filterValidProposal(groupValue, snapshot),
                            )
                        })
                    },
                })),
        [
            referenceValue,
            updateProposal,
            groupValue,
            memberValueList,
            updateMemberValueList,
        ],
    )

    const updateGroupValue = useCallback(
        /**
         * @type {(value:string)=>void}
         */
        value => {
            updateProposal(
                referenceValue[0],
                filterValidProposal(value, memberValueList),
            )

            setGroupValue(value)
        },
        [referenceValue, updateProposal, memberValueList],
    )

    const insertMember = useCallback(
        /**
         * @type {()=>void}
         */
        () => {
            updateMemberValueList(draft => {
                draft.push('')
            })
        },
        [updateMemberValueList],
    )

    return {
        groupValue,
        updateGroupValue,
        memberList,
        insertMember,
    }
}

/**
 * @type {()=>{
 * ruleMapList:Array<[uuid:string,value:{
 * group:string,
 * member:Array<string>,
 * }]>,
 * prepareArtistIdentifyRuleForm:(event:import("react-aria-components").PressEvent)=>void,
 * removeArtistIdentifyRule:(event:import("react-aria-components").PressEvent)=>void,
 * isOpen:boolean,
 * dialogTitle:string,
 * actionButton:{
 * onPress:(event:import("react-aria-components").PressEvent)=>void,
 * content:string,
 * },
 * closeButton:{
 * onPress:(event:import("react-aria-components").PressEvent)=>void,
 * content:string,
 * },
 * targetRule:[uuid:string,value:{
 * group:string,
 * member:Array<string>,
 * }],
 * updateProposal:(uuid:string,value:{
 * group:string,
 * member:Array<string>,
 * })=>void,
 * }}
 */
export const useActionArea = () => {
    const [isOpen, setIsOpen] = useState(false)

    const [dialogTitle, setDialogTitle] = useState('')

    const [targetRule, setTargetRule] = useState(
        /**
         * @type {[uuid:string,value:{
         * group:string,
         * member:Array<string>,
         * }]}
         */
        // eslint-disable-next-line no-extra-parens
        (['', { group: '', member: [''] }]),
    )

    const { otherRuleArtistIdentify } = useOtherRuleArtistIdentify()

    const proposalRef = useRef(structuredClone(otherRuleArtistIdentify))

    const ruleMapList = useMemo(
        /**
         * @type {()=>Array<[uuid:string,value:{
         * group:string,
         * member:Array<string>,
         * }]>}
         */
        () =>
            Object.entries(otherRuleArtistIdentify || {}),
        [otherRuleArtistIdentify],
    )

    const actionButton = useMemo(
        /**
         * @type {()=>{
         * onPress:(event:import("react-aria-components").PressEvent)=>void,
         * content:string,
         * }}
         */
        () =>
            ({
                onPress: () => {
                    const proposal = proposalRef.current

                    proposalRef.current = structuredClone(otherRuleArtistIdentify)

                    window['rhythm::setting'].setSettingStorage(
                        'other.rule.artist.identify',
                        Object.keys(proposal || {}).length ? proposal : false,
                    )

                    setIsOpen(false)
                },
                content: t({
                    en: 'Apply',
                    zh: '应用',
                    ja: '適用',
                }),
            }),
        [otherRuleArtistIdentify],
    )

    const closeButton = useMemo(
        /**
         * @type {()=>{
         * onPress:(event:import("react-aria-components").PressEvent)=>void,
         * content:string,
         * }}
         */
        () =>
            ({
                onPress: () => {
                    proposalRef.current = structuredClone(otherRuleArtistIdentify)

                    setIsOpen(false)
                },
                content: t({
                    en: 'Cancel',
                    zh: '取消',
                    ja: 'キャンセル',
                }),
            }),
        [otherRuleArtistIdentify],
    )

    const prepareArtistIdentifyRuleForm = useCallback(
        /**
         * @type {(event:import("react-aria-components").PressEvent)=>void}
         */
        event => {
            const formUUID = event.target.parentElement?.dataset.uuid

            setDialogTitle(
                formUUID
                    ? t({
                        en: 'Edit rule',
                        zh: '编辑规则',
                        ja: '規則を編集',
                    })
                    : t({
                        en: 'Add rule',
                        zh: '添加规则',
                        ja: '規則を追加',
                    }),
            )

            setTargetRule([
                formUUID ?? uuid(),
                structuredClone(
                    (proposalRef.current || {})[formUUID ?? ''],
                ) ?? {
                    group: '',
                    member: [''],
                },
            ])

            setIsOpen(true)
        },
        [],
    )

    const removeArtistIdentifyRule = useCallback(
        /**
         * @type {(event:import("react-aria-components").PressEvent)=>void}
         */
        event => {
            const formUUID = event.target.parentElement?.dataset.uuid
            if (formUUID && proposalRef.current instanceof Object) {
                delete proposalRef.current[formUUID]

                window['rhythm::setting'].setSettingStorage(
                    'other.rule.artist.identify',
                    Object.keys(proposalRef.current).length
                        ? proposalRef.current
                        : false,
                )
            }
        },
        [],
    )

    const updateProposal = useCallback(
        /**
         * @type {(uuid:string,value:{
         * group:string,
         * member:Array<string>,
         * })=>void}
         */
        (uuid, value) => {
            if (proposalRef.current === false) {
                proposalRef.current = {}
            }

            proposalRef.current[uuid] = value
        },
        [],
    )

    useEffect(() => {
        proposalRef.current = structuredClone(otherRuleArtistIdentify)
    }, [otherRuleArtistIdentify])

    useEffect(() => {
        const abortController = new AbortController()

        /**
         * @type {()=>void}
         */
        const restoreInterfaceStateHandler = () => {
            if (!abortController.signal.aborted) {
                proposalRef.current = structuredClone(otherRuleArtistIdentify)

                setIsOpen(false)
            }
        }

        addEventListener(
            'restore-interface-state',
            restoreInterfaceStateHandler,
        )

        return () => {
            abortController.abort()

            removeEventListener(
                'restore-interface-state',
                restoreInterfaceStateHandler,
            )
        }
    }, [otherRuleArtistIdentify])

    return {
        ruleMapList,
        prepareArtistIdentifyRuleForm,
        removeArtistIdentifyRule,
        isOpen,
        dialogTitle,
        actionButton,
        closeButton,
        targetRule,
        updateProposal,
    }
}

/**
 * @type {()=>{
 * isExpanded:boolean,
 * switchPanel:()=>void,
 * status:string,
 * }}
 */
export const useItemOtherRuleArtistIdentify = () => {
    const [isExpanded, setIsExpanded] = useState(false)

    const { otherRuleArtistIdentify } = useOtherRuleArtistIdentify()

    const status = useMemo(
        /**
         * @type {()=>string}
         */
        () => {
            const ruleCount = Object.keys(otherRuleArtistIdentify || {}).length

            return ruleCount
                ? `${ruleCount} ${t({
                    en: `rule${ruleCount > 1 ? 's' : ''}`,
                    zh: '条规则',
                    ja: '件の規則',
                })}`
                : t({
                    en: 'No rules',
                    zh: '无规则',
                    ja: '規則なし',
                })
        },
        [otherRuleArtistIdentify],
    )

    const switchPanel = useCallback(
        /**
         * @type {()=>void}
         */
        () => {
            setIsExpanded(previousValue =>
                !previousValue)
        },
        [],
    )

    useEffect(() => {
        const abortController = new AbortController()

        /**
         * @type {()=>void}
         */
        const restoreInterfaceStateHandler = () => {
            !abortController.signal.aborted && setIsExpanded(false)
        }

        addEventListener(
            'restore-interface-state',
            restoreInterfaceStateHandler,
        )

        return () => {
            abortController.abort()

            removeEventListener(
                'restore-interface-state',
                restoreInterfaceStateHandler,
            )
        }
    }, [])

    return {
        isExpanded,
        switchPanel,
        status,
    }
}