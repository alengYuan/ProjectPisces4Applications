import { memo } from 'react'
import {
    activeVolumeUpdateBar,
    inactiveVolumeUpdateBar,
    ariaHiddenContainer,
    panelToggleButton,
    fluentFilled,
    fluentRegular,
    sliderContainer,
    sliderTrackContainer,
    sliderTrackArea,
    sliderTrack,
    sliderMask,
    sliderThumb,
    volumeValue,
} from './style'
import { useVolumeUpdateBar } from './model'
import { t } from '../../index'
import { Button, Slider, SliderThumb, SliderTrack } from 'react-aria-components'

/**
 * @type {React.FC<{}>}
 */
const VolumeUpdateBar = () => {
    const {
        panelIsOpen,
        panelIsTemporarilyOpen,
        isDisabled,
        toggleVolumePanel,
        handleToggleVolumePanelTooltip,
        content,
        currentModeVolume,
        setCurrentModeVolume,
        sliderMaskCoverageMeta,
        toggleVolumePanelTemporarily,
    } = useVolumeUpdateBar()

    return (
        <div
            css={
                panelIsOpen || panelIsTemporarilyOpen
                    ? activeVolumeUpdateBar
                    : inactiveVolumeUpdateBar
            }
        >
            <div css={ariaHiddenContainer} aria-hidden="true">
                <Button
                    css={panelToggleButton}
                    excludeFromTabOrder={true}
                    isDisabled={isDisabled}
                    onPress={toggleVolumePanel}
                    onHoverChange={handleToggleVolumePanelTooltip}
                >
                    <div
                        css={panelIsOpen ? fluentFilled : fluentRegular}
                        aria-hidden="true"
                    >
                        {content}
                    </div>
                </Button>
            </div>
            <Slider
                css={sliderContainer}
                aria-label={t({
                    en: 'Volume',
                    zh: '音量',
                    ja: '音量',
                })}
                formatOptions={{
                    style: 'unit',
                    unit: 'percent',
                    unitDisplay: 'long',
                }}
                isDisabled={isDisabled}
                value={currentModeVolume}
                onChange={setCurrentModeVolume}
            >
                <SliderTrack css={sliderTrackContainer}>
                    <div css={sliderTrackArea}>
                        <div className="slider-track" css={sliderTrack} />
                    </div>
                    <div
                        className="slider-mask"
                        css={sliderMask}
                        style={sliderMaskCoverageMeta}
                    />
                    <SliderThumb
                        css={sliderThumb}
                        onFocusChange={toggleVolumePanelTemporarily}
                    />
                </SliderTrack>
            </Slider>
            <div css={volumeValue} aria-hidden="true">
                {currentModeVolume}
            </div>
        </div>
    )
}

export default memo(VolumeUpdateBar)