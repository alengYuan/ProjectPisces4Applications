import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useModeCandidate } from '../model'
import { NIL as nil, v4 as uuid } from 'uuid'
import { t } from '../../index'

const deviceBackupValue = nil.split('').reverse()
    .join('')

/**
 * @type {(props:{
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
 * })=>{
 * labelValue:string,
 * updateLabelValue:(value:string)=>void,
 * deviceValue:string,
 * deviceBackupValue:string,
 * updateDeviceValue:(value:string)=>void,
 * deviceCandidateList:Array<[key:string,value:string]>,
 * }}
 */
export const useFormArea = ({
    referenceValue,
    updateProposal,
    deviceCandidateList,
}) => {
    const [labelValue, setLabelValue] = useState(referenceValue[1].label)

    const [deviceValue, setDeviceValue] = useState(referenceValue[1].device)

    const updateLabelValue = useCallback(
        /**
         * @type {(value:string)=>void}
         */
        value => {
            updateProposal(referenceValue[0], {
                label: value,
                device: deviceValue,
                volume: referenceValue[1].volume,
            })

            setLabelValue(value)
        },
        [referenceValue, updateProposal, deviceValue],
    )

    const updateDeviceValue = useCallback(
        /**
         * @type {(value:string)=>void}
         */
        value => {
            updateProposal(referenceValue[0], {
                label: labelValue,
                device: value,
                volume: referenceValue[1].volume,
            })

            setDeviceValue(value)
        },
        [referenceValue, updateProposal, labelValue],
    )

    return {
        labelValue,
        updateLabelValue,
        deviceValue,
        deviceBackupValue,
        updateDeviceValue,
        deviceCandidateList,
    }
}

/**
 * @type {()=>{
 * modeList:Array<[uuid:string,value:{
 * label:string,
 * }]>,
 * prepareModeForm:(event:import("react-aria-components").PressEvent)=>void,
 * removeMode:(event:import("react-aria-components").PressEvent)=>void,
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
 * targetMode:[uuid:string,value:{
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
 * }}
 */
export const useActionArea = () => {
    const [isOpen, setIsOpen] = useState(false)

    const [dialogTitle, setDialogTitle] = useState('')

    const [targetMode, setTargetMode] = useState(
        /**
         * @type {[uuid:string,value:{
         * label:string,
         * device:string,
         * volume:number,
         * }]}
         */
        // eslint-disable-next-line no-extra-parens
        (['', { label: '', device: '', volume: NaN }]),
    )

    const [deviceCandidateList, setDeviceCandidateList] = useState(
        /**
         * @type {Array<[key:string,value:string]>}
         */
        // eslint-disable-next-line no-extra-parens
        ([]),
    )

    const { modeCandidate } = useModeCandidate()

    const proposalRef = useRef(structuredClone(modeCandidate))

    const modeList = useMemo(
        /**
         * @type {()=>Array<[uuid:string,value:{
         * label:string,
         * }]>}
         */
        () =>
            Object.entries(modeCandidate)
                .filter(([uuid]) =>
                    uuid !== nil)
                .map(([uuid, { label }]) =>
                    [uuid, { label }]),
        [modeCandidate],
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

                    proposalRef.current = structuredClone(modeCandidate)

                    window['rhythm::setting'].setSettingStorage(
                        'mode.candidate',
                        proposal,
                    )

                    setIsOpen(false)
                },
                content: t({
                    en: 'Apply',
                    zh: '应用',
                    ja: '適用',
                }),
            }),
        [modeCandidate],
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
                    proposalRef.current = structuredClone(modeCandidate)

                    setIsOpen(false)
                },
                content: t({
                    en: 'Cancel',
                    zh: '取消',
                    ja: 'キャンセル',
                }),
            }),
        [modeCandidate],
    )

    const prepareModeForm = useCallback(
        /**
         * @type {(event:import("react-aria-components").PressEvent)=>Promise<void>}
         */
        async event => {
            const formUUID = event.target.parentElement?.dataset.uuid

            const knownDeviceList =
                await window['rhythm::setting'].getKnownDeviceList()

            setDialogTitle(
                formUUID
                    ? t({
                        en: 'Edit scene mode',
                        zh: '编辑情景模式',
                        ja: 'シーンモードを編集',
                    })
                    : t({
                        en: 'Add scene mode',
                        zh: '添加情景模式',
                        ja: 'シーンモードを追加',
                    }),
            )

            const targetMode =
                /**
                 * @type {[uuid:string,value:{
                 * label:string,
                 * device:string,
                 * volume:number,
                 * }]}
                 */
                // eslint-disable-next-line no-extra-parens
                ([
                    formUUID ?? uuid(),
                    structuredClone(proposalRef.current[formUUID ?? '']) ?? {
                        label: '',
                        device: knownDeviceList[0]?.id ?? deviceBackupValue,
                        volume: 0.65,
                    },
                ])

            setTargetMode(targetMode)

            const invalidDeviceList =
                /**
                 * @type {Array<[key:string,value:string]>}
                 */
                // eslint-disable-next-line no-extra-parens
                (
                    knownDeviceList
                        .map(({ id }) =>
                            id)
                        .includes(targetMode[1].device)
                        ? []
                        : [
                            [
                                targetMode[1].device,
                                t({
                                    en: 'Unknown device',
                                    zh: '未知设备',
                                    ja: '不明なデバイス',
                                }),
                            ],
                        ]
                )

            const validDeviceList =
                /**
                 * @type {Array<[key:string,value:string]>}
                 */
                // eslint-disable-next-line no-extra-parens
                (knownDeviceList.map(({ id, label }) =>
                    [id, label]))

            setDeviceCandidateList([...invalidDeviceList, ...validDeviceList])

            setIsOpen(true)
        },
        [],
    )

    const removeMode = useCallback(
        /**
         * @type {(event:import("react-aria-components").PressEvent)=>void}
         */
        event => {
            const formUUID = event.target.parentElement?.dataset.uuid
            if (formUUID) {
                delete proposalRef.current[formUUID]

                window['rhythm::setting'].setSettingStorage(
                    'mode.candidate',
                    proposalRef.current,
                )
            }
        },
        [],
    )

    const updateProposal = useCallback(
        /**
         * @type {(uuid:string,value:{
         * label:string,
         * device:string,
         * volume:number,
         * })=>void}
         */
        (uuid, value) => {
            proposalRef.current[uuid] = value
        },
        [],
    )

    useEffect(() => {
        proposalRef.current = structuredClone(modeCandidate)
    }, [modeCandidate])

    useEffect(() => {
        const abortController = new AbortController()

        /**
         * @type {()=>void}
         */
        const restoreInterfaceStateHandler = () => {
            if (!abortController.signal.aborted) {
                proposalRef.current = structuredClone(modeCandidate)

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
    }, [modeCandidate])

    return {
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
    }
}

/**
 * @type {()=>{
 * isExpanded:boolean,
 * switchPanel:()=>void,
 * status:string,
 * }}
 */
export const useItemModeCandidate = () => {
    const [isExpanded, setIsExpanded] = useState(false)

    const { modeCandidate } = useModeCandidate()

    const status = useMemo(
        /**
         * @type {()=>string}
         */
        () => {
            const modeCount = Object.keys(modeCandidate).length - 1

            return modeCount
                ? `${modeCount} ${t({
                    en: `mode${modeCount > 1 ? 's' : ''}`,
                    zh: '种模式',
                    ja: 'つのモード',
                })}`
                : t({
                    en: 'No candidates',
                    zh: '无预设',
                    ja: '候補項目なし',
                })
        },
        [modeCandidate],
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