import { memo } from 'react'
import {
    progressUpdateBar,
    timeValue,
    sliderContainer,
    sliderTrackContainer,
    sliderTrackArea,
    sliderTrack,
    agileSliderTrackFilling,
    smoothSliderTrackFilling,
    agileSliderMaskContainer,
    smoothSliderMaskContainer,
    sliderDynamicMask,
    sliderStaticMask,
    agileSliderThumb,
    smoothSliderThumb,
} from './style'
import { useProgressUpdateBar } from './model'
import { t } from '../../index'
import { Slider, SliderThumb, SliderTrack } from 'react-aria-components'

/**
 * @type {React.FC<{}>}
 */
const ProgressUpdateBar = () => {
    const {
        formattedCurrentPosition,
        isDisabled,
        totalDuration,
        visualProgress,
        setVisualProgress,
        setProgressForKeyboardUser,
        lockVisualProgressSynchronization,
        unlockVisualProgressSynchronization,
        isFocused,
        visualProgressSynchronizationIsLocked,
        sliderMaskCoverageMeta,
        sliderDynamicMaskRef,
        isInDynamicMode,
        formattedTotalDuration,
    } = useProgressUpdateBar()

    return (
        <div css={progressUpdateBar}>
            <div css={timeValue} aria-hidden="true">
                {formattedCurrentPosition}
            </div>
            <Slider
                css={sliderContainer}
                aria-label={t({
                    en: 'Playback progress',
                    zh: '播放进度',
                    ja: '再生進捗',
                })}
                formatOptions={{
                    style: 'unit',
                    unit: 'second',
                    unitDisplay: 'long',
                }}
                isDisabled={isDisabled}
                maxValue={totalDuration}
                value={visualProgress}
                onChange={setVisualProgress}
                onChangeEnd={setProgressForKeyboardUser}
            >
                <SliderTrack
                    css={sliderTrackContainer}
                    onPointerDownCapture={lockVisualProgressSynchronization}
                    onPointerUpCapture={unlockVisualProgressSynchronization}
                >
                    <div css={sliderTrackArea}>
                        <div className="slider-track" css={sliderTrack}>
                            <div
                                css={
                                    !isFocused ||
                                    visualProgressSynchronizationIsLocked
                                        ? agileSliderTrackFilling
                                        : smoothSliderTrackFilling
                                }
                                style={sliderMaskCoverageMeta}
                            />
                        </div>
                    </div>
                    <div
                        className="slider-mask"
                        css={
                            !isFocused || visualProgressSynchronizationIsLocked
                                ? agileSliderMaskContainer
                                : smoothSliderMaskContainer
                        }
                        style={sliderMaskCoverageMeta}
                    >
                        <canvas
                            ref={sliderDynamicMaskRef}
                            css={sliderDynamicMask}
                        />
                        {!isInDynamicMode && <div css={sliderStaticMask} />}
                    </div>
                    <SliderThumb
                        css={
                            !isFocused || visualProgressSynchronizationIsLocked
                                ? agileSliderThumb
                                : smoothSliderThumb
                        }
                    />
                </SliderTrack>
            </Slider>
            <div css={timeValue} aria-hidden="true">
                {formattedTotalDuration}
            </div>
        </div>
    )
}

export default memo(ProgressUpdateBar)