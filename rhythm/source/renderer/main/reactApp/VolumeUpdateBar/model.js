import { useCallback, useEffect, useMemo, useState } from 'react'
import {
    useQueueSourceBasicInformationListIsEmpty,
    useCurrentModeVolume,
    useTooltip,
} from '../model'
import { t } from '../../index'

/**
 * @type {()=>{
 * panelIsOpen:boolean,
 * panelIsTemporarilyOpen:boolean,
 * isDisabled:boolean,
 * toggleVolumePanel:()=>void,
 * handleToggleVolumePanelTooltip:(isHovering:boolean)=>void,
 * content:string,
 * currentModeVolume:number,
 * setCurrentModeVolume:(volume:number)=>void,
 * sliderMaskCoverageMeta:React.CSSProperties,
 * toggleVolumePanelTemporarily:(isFocused:boolean)=>void,
 * }}
 */
export const useVolumeUpdateBar = () => {
    const [panelIsOpen, setPanelIsOpen] = useState(false)

    const [panelIsTemporarilyOpen, setPanelIsTemporarilyOpen] = useState(false)

    const { queueSourceBasicInformationListIsEmpty } =
        useQueueSourceBasicInformationListIsEmpty()

    const { currentModeVolume } = useCurrentModeVolume()

    const tooltip = useMemo(
        /**
         * @type {()=>string}
         */
        () =>
            panelIsOpen
                ? t({
                    en: 'Collapse volume panel',
                    zh: '收起音量面板',
                    ja: '音量パネルを非表示',
                })
                : t({
                    en: 'Expand volume panel',
                    zh: '展开音量面板',
                    ja: '音量パネルを表示',
                }),
        [panelIsOpen],
    )

    const content = useMemo(
        /**
         * @type {()=>string}
         */
        () =>
            currentModeVolume === 0
                ? panelIsOpen
                    ? ''
                    : ''
                : currentModeVolume <= 34
                    ? panelIsOpen
                        ? ''
                        : ''
                    : currentModeVolume <= 69
                        ? panelIsOpen
                            ? ''
                            : ''
                        : panelIsOpen
                            ? ''
                            : '',
        [panelIsOpen, currentModeVolume],
    )

    const sliderMaskCoverageMeta = useMemo(
        /**
         * @type {()=>React.CSSProperties}
         */
        () =>
            /**
             * @type {React.CSSProperties}
             */
            // eslint-disable-next-line no-extra-parens
            ({
                '--slider-mask-coverage': `${currentModeVolume}%`,
            }),
        [currentModeVolume],
    )

    const toggleVolumePanel = useCallback(
        /**
         * @type {()=>void}
         */
        () => {
            setPanelIsOpen(previousValue =>
                !previousValue)
        },
        [],
    )

    const { onHoverChange: handleToggleVolumePanelTooltip } =
        useTooltip(tooltip)

    useEffect(() => {
        queueSourceBasicInformationListIsEmpty && setPanelIsOpen(false)
    }, [queueSourceBasicInformationListIsEmpty])

    return {
        panelIsOpen,
        panelIsTemporarilyOpen,
        isDisabled: queueSourceBasicInformationListIsEmpty,
        toggleVolumePanel,
        handleToggleVolumePanelTooltip,
        content,
        currentModeVolume,
        setCurrentModeVolume: window['rhythm::main'].setCurrentModeVolume,
        sliderMaskCoverageMeta,
        toggleVolumePanelTemporarily: setPanelIsTemporarilyOpen,
    }
}