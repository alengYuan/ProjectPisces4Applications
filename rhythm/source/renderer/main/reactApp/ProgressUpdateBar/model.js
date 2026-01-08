import { useCallback, useEffect, useMemo, useState } from 'react'
import { useProgressUpdateBarCanvas } from './model.canvas'
import {
    useQueueSourceType,
    useQueueSourceBasicInformationListIsEmpty,
    useQueueAtIdentification,
    useProgress,
} from '../model'
import {
    second,
    thirty,
    requestAnimationFrames,
    getStructuredTime,
} from '@projectleo/tickerjs'

/**
 * @type {(structuredTime:import("@projectleo/tickerjs").StructuredTimeWithHourUnit)=>string}
 */
const formatTimeline = ({ hour, minute, second }) =>
    `${String(hour).padStart(2, '0')}:${String(minute).padStart(
        2,
        '0',
    )}:${String(second).padStart(2, '0')}`

/**
 * @type {()=>{
 * formattedCurrentPosition:string,
 * isDisabled:boolean,
 * totalDuration:number,
 * visualProgress:number,
 * setVisualProgress:(visualProgress:number)=>void,
 * setProgressForKeyboardUser:(progress:number)=>void,
 * lockVisualProgressSynchronization:(event:React.PointerEvent<HTMLDivElement>)=>void,
 * unlockVisualProgressSynchronization:(event:React.PointerEvent<HTMLDivElement>)=>void,
 * isFocused:boolean,
 * visualProgressSynchronizationIsLocked:boolean,
 * sliderMaskCoverageMeta:React.CSSProperties,
 * sliderDynamicMaskRef:React.MutableRefObject<null|HTMLCanvasElement>,
 * isInDynamicMode:boolean,
 * formattedTotalDuration:string,
 * }}
 */
export const useProgressUpdateBar = () => {
    const { sliderDynamicMaskRef, isFocused, isInDynamicMode } =
        useProgressUpdateBarCanvas()

    const { progress } = useProgress()

    const [visualProgress, setVisualProgress] = useState(progress)

    const [
        visualProgressSynchronizationIsLocked,
        setVisualProgressSynchronizationIsLocked,
    ] = useState(false)

    const [totalDuration, setTotalDuration] = useState(0)

    const { queueSourceType } = useQueueSourceType()

    const { queueSourceBasicInformationListIsEmpty } =
        useQueueSourceBasicInformationListIsEmpty()

    const { queueAtIdentification } = useQueueAtIdentification()

    const formattedCurrentPosition = useMemo(
        /**
         * @type {()=>string}
         */
        () =>
            formatTimeline(getStructuredTime(second(visualProgress), 'hour')),
        [visualProgress],
    )

    const formattedTotalDuration = useMemo(
        /**
         * @type {()=>string}
         */
        () =>
            formatTimeline(getStructuredTime(second(totalDuration), 'hour')),
        [totalDuration],
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
                '--slider-mask-coverage': `${
                    (totalDuration
                        ? visualProgress > totalDuration
                            ? 1
                            : visualProgress / totalDuration
                        : 0) * 100
                }%`,
            }),
        [visualProgress, totalDuration],
    )

    const setProgressForKeyboardUser = useCallback(
        /**
         * @type {(progress:number)=>void}
         */
        progress => {
            !visualProgressSynchronizationIsLocked &&
                window['rhythm::main'].setProgress(progress)
        },
        [visualProgressSynchronizationIsLocked],
    )

    const changeQueueAtHandler = useCallback(
        /**
         * @type {(
         * event:Electron.IpcRendererEvent,
         * queueAt:[string,number],
         * )=>void}
         */
        (_, queueAt) => {
            queueAt[0] !== queueAtIdentification && setVisualProgress(0)
        },
        [queueAtIdentification],
    )

    const updateProgressHandler = useCallback(
        /**
         * @type {(
         * event:Electron.IpcRendererEvent,
         * progress:number,
         * )=>void}
         */
        (_, progress) => {
            !visualProgressSynchronizationIsLocked &&
                setVisualProgress(progress)
        },
        [visualProgressSynchronizationIsLocked],
    )

    const lockVisualProgressSynchronization = useCallback(
        /**
         * @type {(event:React.PointerEvent<HTMLDivElement>)=>void}
         */
        event => {
            event.currentTarget.setPointerCapture(event.pointerId)

            setVisualProgressSynchronizationIsLocked(true)
        },
        [],
    )

    const unlockVisualProgressSynchronization = useCallback(
        /**
         * @type {(event:React.PointerEvent<HTMLDivElement>)=>void}
         */
        event => {
            event.currentTarget.releasePointerCapture(event.pointerId)

            setVisualProgressSynchronizationIsLocked(false)
        },
        [],
    )

    useEffect(() => {
        const cancelAnimationFrames = visualProgressSynchronizationIsLocked
            ? requestAnimationFrames({
                frameRate: thirty.fps,
                actionOnFrame: () => {
                    window['rhythm::main'].setProgress(visualProgress)
                },
            })
            : void null

        return () => {
            cancelAnimationFrames && cancelAnimationFrames()
        }
    }, [visualProgress, visualProgressSynchronizationIsLocked])

    useEffect(
        () =>
            window['rhythm::main'].changeQueueAt(changeQueueAtHandler),
        [changeQueueAtHandler],
    )

    useEffect(
        () =>
            window['rhythm::main'].updateProgress(updateProgressHandler),
        [updateProgressHandler],
    )

    useEffect(() => {
        const abortController = new AbortController()

        // eslint-disable-next-line semi-style
        ;(async() => {
            const currentTrackDetailedInformation = await window[
                'rhythm::main'
            ].getDetailedInformationWithUUID(
                queueSourceType,
                queueAtIdentification,
            )

            !abortController.signal.aborted &&
                setTotalDuration(
                    currentTrackDetailedInformation
                        ? currentTrackDetailedInformation.length
                        : 0,
                )
        })()

        return () => {
            abortController.abort()
        }
    }, [queueSourceType, queueAtIdentification])

    return {
        formattedCurrentPosition,
        isDisabled: queueSourceBasicInformationListIsEmpty,
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
    }
}