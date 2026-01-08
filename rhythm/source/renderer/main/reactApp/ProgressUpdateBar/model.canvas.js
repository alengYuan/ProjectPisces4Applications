import { useEffect, useRef, useState } from 'react'
import { useIsPlaying } from '../model'
import { thirty, requestAnimationFrames } from '@projectleo/tickerjs'

const lineWidth = 4

const secondaryPartStartingPointX = 53.3333

const primaryPartStartingPointX = 106.6667

const lineCap = 'round'

const lineStartingPointX = lineWidth / 2

const baseAmplitude = 2

const frequency = 0.2355

const speed = 0.0267

let phaseShift = NaN

const phaseMaxShift = Math.PI * 2 - speed

const levelMap = {
    '∅': 0,
    '0': 0.016,
    '1': 0.067,
    '2': 0.154,
    '3': 0.275,
    '4': 0.422,
    '5': 0.578,
    '6': 0.724,
    '7': 0.846,
    '8': 0.933,
    '9': 0.984,
    '∞': 1,
}

const { minNumberLevel, maxNumberLevel } = (() => {
    const numberLevelList = Object.keys(levelMap)
        .map(key =>
            Number(key))
        .filter(key =>
            !isNaN(key))

    return {
        minNumberLevel: Math.min(...numberLevelList),
        maxNumberLevel: Math.max(...numberLevelList),
    }
})()

/**
 * @type {()=>undefined|CSSStyleDeclaration}
 */
const getCSSStyleDeclaration = () =>
    /**
     * @type {undefined|CSSRule&{style:CSSStyleDeclaration}}
     */
    // eslint-disable-next-line no-extra-parens
    (
        Array.from(
            /**
             * @type {null|HTMLStyleElement}
             */
            // eslint-disable-next-line no-extra-parens
            (document.querySelector('style#root-style'))?.sheet?.cssRules ?? [],
        ).find(
            cssRule =>
                /**
                 * @type {CSSRule&{selectorText:string}}
                 */
                // eslint-disable-next-line no-extra-parens
                (cssRule).selectorText === ':root',
        )
    )?.style

/**
 * @type {(
 * canvas:HTMLCanvasElement,
 * context:CanvasRenderingContext2D,
 * cssStyleDeclaration:CSSStyleDeclaration,
 * levelKey:keyof levelMap,
 * )=>void}
 */
const drawWave = (canvas, context, cssStyleDeclaration, levelKey) => {
    canvas.width = canvas.offsetWidth

    canvas.height = canvas.offsetHeight

    context.clearRect(0, 0, canvas.width, canvas.height)

    context.beginPath()

    context.lineWidth = lineWidth

    const colorPrimary = cssStyleDeclaration.getPropertyValue('--primary')

    const colorSecondary = cssStyleDeclaration.getPropertyValue('--secondary')

    const colorTertiary = cssStyleDeclaration.getPropertyValue('--tertiary')

    if (levelKey === '∅' || !canvas.width) {
        context.strokeStyle = colorPrimary
    } else {
        const gradientWidth = Math.max(
            canvas.width,
            Math.ceil(primaryPartStartingPointX * levelMap[levelKey]),
        )

        const gradient = context.createLinearGradient(0, 0, gradientWidth, 0)

        if (levelKey === '∞') {
            gradient.addColorStop(0, colorTertiary)

            gradient.addColorStop(
                secondaryPartStartingPointX / gradientWidth,
                colorSecondary,
            )

            gradient.addColorStop(
                primaryPartStartingPointX / gradientWidth,
                colorPrimary,
            )
        } else {
            gradient.addColorStop(0, colorTertiary)

            gradient.addColorStop(
                secondaryPartStartingPointX / gradientWidth *
                    levelMap[levelKey],
                colorSecondary,
            )

            gradient.addColorStop(
                primaryPartStartingPointX / gradientWidth *
                    levelMap[levelKey],
                colorPrimary,
            )
        }

        context.strokeStyle = gradient
    }

    context.lineCap = lineCap

    const verticalMidpointY = canvas.height / 2

    const amplitude =
        levelKey === '∅'
            ? 0
            : levelKey === '∞'
                ? baseAmplitude
                : baseAmplitude * levelMap[levelKey]

    phaseShift = phaseShift >= phaseMaxShift ? 0 : phaseShift + speed

    let x = lineStartingPointX

    context.moveTo(x, verticalMidpointY + amplitude * Math.sin(phaseShift))

    x += 1

    while (x < canvas.width) {
        context.lineTo(
            x,
            verticalMidpointY +
                amplitude *
                    Math.sin((x - lineStartingPointX) * frequency + phaseShift),
        )

        x += 1
    }

    context.stroke()
}

/**
 * @type {()=>{
 * sliderDynamicMaskRef:React.MutableRefObject<null|HTMLCanvasElement>,
 * isFocused:boolean,
 * isInDynamicMode:boolean,
 * }}
 */
export const useProgressUpdateBarCanvas = () => {
    const sliderDynamicMaskRef = useRef(
        /**
         * @type {null|HTMLCanvasElement}
         */
        // eslint-disable-next-line no-extra-parens
        (null),
    )

    const [isFocused, setIsFocused] = useState(false)

    const [isInDynamicMode, setIsInDynamicMode] = useState(false)

    const { isPlaying: isPlayingState } = useIsPlaying()

    const isPlayingRef = useRef(isPlayingState)

    useEffect(() => {
        phaseShift = 0

        const domLayer =
            /**
             * @type {null|HTMLDivElement}
             */
            // eslint-disable-next-line no-extra-parens
            (document.querySelector('#dom'))

        const canvas = sliderDynamicMaskRef.current

        const context = canvas?.getContext('2d')

        const cssStyleDeclaration = getCSSStyleDeclaration()

        if (domLayer && canvas && context && cssStyleDeclaration) {
            const abortController = new AbortController()

            let isFocused = domLayer.classList.contains('focused')

            setIsFocused(isFocused)

            let isPlaying = isPlayingRef.current

            /**
             * @type {undefined|(()=>void)}
             */
            let cancelAnimationFrames = void null

            const mutationObserver = new MutationObserver(mutations => {
                for (const mutation of mutations) {
                    if (
                        mutation.type === 'attributes' &&
                        mutation.attributeName === 'class'
                    ) {
                        isFocused = domLayer.classList.contains('focused')

                        isFocused && dispatchEvent(new Event('draw-wave'))

                        !abortController.signal.aborted &&
                            setIsFocused(isFocused)
                    }
                }
            })

            mutationObserver.observe(domLayer, {
                attributes: true,
                attributeFilter: ['class'],
            })

            const removeResetPlayStateHandler = window[
                'rhythm::main'
            ].resetPlayState((_, isPlayingValue) => {
                isPlaying = isPlayingValue

                isPlaying && dispatchEvent(new Event('draw-wave'))
            })

            /**
             * @type {keyof levelMap}
             */
            let level = '∅'

            /**
             * @type {()=>void}
             */
            const requestDrawWave = () => {
                if (
                    !abortController.signal.aborted &&
                    !cancelAnimationFrames &&
                    isFocused &&
                    isPlaying
                ) {
                    cancelAnimationFrames = requestAnimationFrames({
                        actionOnFrame: ({ delta }) => {
                            const vectorUnit = isFocused && isPlaying ? 1 : -1

                            if (!abortController.signal.aborted) {
                                drawWave(
                                    canvas,
                                    context,
                                    cssStyleDeclaration,
                                    level,
                                )

                                level === '∅' &&
                                    setIsInDynamicMode(vectorUnit === 1)
                            }

                            let step =
                                vectorUnit === 1
                                    ? Math.ceil(
                                        vectorUnit *
                                              thirty.fps *
                                              (delta || 1 / thirty.fps),
                                    )
                                    : Math.floor(
                                        vectorUnit *
                                              thirty.fps *
                                              (delta || 1 / thirty.fps),
                                    )

                            if (isNaN(Number(level))) {
                                if (level === '∅' && vectorUnit === 1) {
                                    level =
                                        /**
                                         * @type {keyof levelMap}
                                         */
                                        // eslint-disable-next-line no-extra-parens
                                        (String(minNumberLevel))

                                    step -= vectorUnit
                                } else if (level === '∞' && vectorUnit === -1) {
                                    level =
                                        /**
                                         * @type {keyof levelMap}
                                         */
                                        // eslint-disable-next-line no-extra-parens
                                        (String(maxNumberLevel))

                                    step -= vectorUnit
                                }
                            }

                            if (!isNaN(Number(level))) {
                                if (vectorUnit === 1) {
                                    while (step > 0) {
                                        const nextLevel = Number(level) + step

                                        if (nextLevel > maxNumberLevel) {
                                            level = '∞'

                                            break
                                        } else {
                                            level =
                                                /**
                                                 * @type {keyof levelMap}
                                                 */
                                                // eslint-disable-next-line no-extra-parens
                                                (String(nextLevel))
                                        }

                                        step -= vectorUnit
                                    }
                                } else {
                                    while (step < 0) {
                                        const nextLevel = Number(level) + step

                                        if (nextLevel < minNumberLevel) {
                                            level = '∅'

                                            break
                                        } else {
                                            level =
                                                /**
                                                 * @type {keyof levelMap}
                                                 */
                                                // eslint-disable-next-line no-extra-parens
                                                (String(nextLevel))
                                        }

                                        step -= vectorUnit
                                    }
                                }
                            }

                            return level === '∅' && vectorUnit === -1
                                ? { continueHandleFrames: false }
                                : void null
                        },
                        actionOnEnd: () => {
                            if (!abortController.signal.aborted) {
                                drawWave(
                                    canvas,
                                    context,
                                    cssStyleDeclaration,
                                    '∅',
                                )

                                setIsInDynamicMode(false)
                            }

                            cancelAnimationFrames = void null
                        },
                    })
                }
            }

            addEventListener('draw-wave', requestDrawWave)

            dispatchEvent(new Event('draw-wave'))

            return () => {
                abortController.abort()

                removeEventListener('draw-wave', requestDrawWave)

                cancelAnimationFrames && cancelAnimationFrames()

                removeResetPlayStateHandler()

                mutationObserver.disconnect()
            }
        }

        return void null
    }, [])

    return {
        sliderDynamicMaskRef,
        isFocused,
        isInDynamicMode,
    }
}