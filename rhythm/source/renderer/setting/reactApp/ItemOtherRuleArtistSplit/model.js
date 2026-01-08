import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useOtherRuleArtistSplit } from '../model'
import { t } from '../../index'

/**
 * @type {(props:{
 * referenceValue:string,
 * updateProposal:(proposal:string)=>void,
 * })=>{
 * value:string,
 * updateValue:(value:string)=>void,
 * }}
 */
export const useFormArea = ({ referenceValue, updateProposal }) => {
    const [value, setValue] = useState(referenceValue)

    const updateValue = useCallback(
        /**
         * @type {(value:string)=>void}
         */
        value => {
            updateProposal(value)

            setValue(value)
        },
        [updateProposal],
    )

    return {
        value,
        updateValue,
    }
}

/**
 * @type {()=>{
 * rule:string,
 * rulePrompt:string,
 * prepareArtistSplitRuleForm:()=>void,
 * isOpen:boolean,
 * actionButton:{
 * onPress:(event:import("react-aria-components").PressEvent)=>void,
 * content:string,
 * },
 * closeButton:{
 * onPress:(event:import("react-aria-components").PressEvent)=>void,
 * content:string,
 * },
 * updateProposal:(proposal:string)=>void,
 * resetArtistSplitRule:()=>void,
 * }}
 */
export const useActionArea = () => {
    const [isOpen, setIsOpen] = useState(false)

    const { otherRuleArtistSplit } = useOtherRuleArtistSplit()

    const proposalRef = useRef(otherRuleArtistSplit)

    const rulePrompt = useMemo(
        /**
         * @type {()=>string}
         */
        () =>
            t({
                en: `The current separator is "${otherRuleArtistSplit}"`,
                zh: `当前分隔符为“${otherRuleArtistSplit}”`,
                ja: `現在の区切り文字は「${otherRuleArtistSplit}」です`,
            }),
        [otherRuleArtistSplit],
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

                    proposalRef.current = otherRuleArtistSplit

                    window['rhythm::setting'].setSettingStorage(
                        'other.rule.artist.split',
                        proposal || false,
                    )

                    setIsOpen(false)
                },
                content: t({
                    en: 'Apply',
                    zh: '应用',
                    ja: '適用',
                }),
            }),
        [otherRuleArtistSplit],
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
                    proposalRef.current = otherRuleArtistSplit

                    setIsOpen(false)
                },
                content: t({
                    en: 'Cancel',
                    zh: '取消',
                    ja: 'キャンセル',
                }),
            }),
        [otherRuleArtistSplit],
    )

    const prepareArtistSplitRuleForm = useCallback(
        /**
         * @type {()=>void}
         */
        () => {
            setIsOpen(true)
        },
        [],
    )

    const updateProposal = useCallback(
        /**
         * @type {(proposal:string)=>void}
         */
        proposal => {
            proposalRef.current = proposal
        },
        [],
    )

    const resetArtistSplitRule = useCallback(
        /**
         * @type {()=>void}
         */
        () => {
            window['rhythm::setting'].setSettingStorage(
                'other.rule.artist.split',
                false,
            )
        },
        [],
    )

    useEffect(() => {
        proposalRef.current = otherRuleArtistSplit
    }, [otherRuleArtistSplit])

    useEffect(() => {
        const abortController = new AbortController()

        /**
         * @type {()=>void}
         */
        const restoreInterfaceStateHandler = () => {
            if (!abortController.signal.aborted) {
                proposalRef.current = otherRuleArtistSplit

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
    }, [otherRuleArtistSplit])

    return {
        rule: otherRuleArtistSplit || '',
        rulePrompt,
        prepareArtistSplitRuleForm,
        isOpen,
        actionButton,
        closeButton,
        updateProposal,
        resetArtistSplitRule,
    }
}

/**
 * @type {()=>{
 * isExpanded:boolean,
 * switchPanel:()=>void,
 * status:string,
 * }}
 */
export const useItemOtherRuleArtistSplit = () => {
    const [isExpanded, setIsExpanded] = useState(false)

    const { otherRuleArtistSplit } = useOtherRuleArtistSplit()

    const status = useMemo(
        /**
         * @type {()=>string}
         */
        () =>
            otherRuleArtistSplit
                ? t({
                    en: 'Specified',
                    zh: '已指定',
                    ja: '指定済み',
                })
                : t({
                    en: 'Unspecified',
                    zh: '未指定',
                    ja: '未指定',
                }),
        [otherRuleArtistSplit],
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