// eslint-disable-next-line spaced-comment
/// <reference lib="webworker" />

import {
    Scheme,
    QuantizerCelebi,
    Score,
    argbFromRgb,
    hexFromArgb,
    rgbaFromArgb,
} from '@material/material-color-utilities'
import { fifteen } from '@projectleo/tickerjs'

/**
 * @type {(rgb:{
 * r:number,
 * g:number,
 * b:number,
 * a?:number,
 * })=>{
 * h:number,
 * s:number,
 * l:number,
 * }}
 */
const hslFromRgb = rgb => {
    let { r, g, b } = rgb

    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)

    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
        const d = max - min

        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0)

                break
            case g:
                h = (b - r) / d + 2

                break
            case b:
                h = (r - g) / d + 4

                break
            default:
        }

        h /= 6
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    }

    return { h: h * 360, s, l }
}

/**
 * @type {(hsl:{
 * h:number,
 * s:number,
 * l:number,
 * })=>{
 * r:number,
 * g:number,
 * b:number,
 * }}
 */
const rgbFromHsl = ({ h, s, l }) => {
    let r = l
    let g = l
    let b = l

    if (s !== 0) {
        /**
         * @type {(offset:number)=>number}
         */
        const rgbFromHue = offset => {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s
            const p = 2 * l - q

            let correctedOffset = offset
            if (correctedOffset < 0) {
                correctedOffset += 1
            } else if (correctedOffset > 1) {
                correctedOffset -= 1
            }

            if (correctedOffset < 1 / 6) {
                return p + (q - p) * 6 * correctedOffset
            }

            if (correctedOffset < 1 / 2) {
                return q
            }

            if (correctedOffset < 2 / 3) {
                return p + (q - p) * (2 / 3 - correctedOffset) * 6
            }

            return p
        }

        r = rgbFromHue(h / 360 + 1 / 3)
        g = rgbFromHue(h / 360)
        b = rgbFromHue(h / 360 - 1 / 3)
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
    }
}

/**
 * @type {Array<{
 * key:string,
 * fileURL:string,
 * }>}
 */
const taskQueue = []

let isProcessing = false

let timeoutIDOfUselessOffscreenCanvasClear = NaN

/**
 * @type {undefined|OffscreenCanvas}
 */
let offscreenCanvas = void null

/**
 * @type {null|OffscreenCanvasRenderingContext2D}
 */
let offscreenCanvasContext = null

/**
 * @type {undefined|OffscreenCanvas}
 */
let auxiliaryOffscreenCanvas = void null

/**
 * @type {null|OffscreenCanvasRenderingContext2D}
 */
let auxiliaryOffscreenCanvasContext = null

const backgroundWidth = 210

const backgroundHeight = 280

const canvasAspectRatio = backgroundWidth / backgroundHeight

const foregroundContentHeight = 36

const foregroundContentPadding = 16

const foregroundHeight = foregroundContentPadding * 2 + foregroundContentHeight

const blurAmount = 12

const blurPadding = blurAmount * 3

const foregroundFilledWidth = blurPadding * 2 + backgroundWidth

const foregroundFilledHeight = blurPadding * 2 + foregroundHeight

/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * * Notice: This function is derived from the
 * "@material/material-color-utilities" library. The original function was not
 * exported.
 * * Portions of this code are modified, modifications:
 *      - Adjusted variable naming and function structure for project
 * integration.
 *      - Adapted from the original source to meet specific implementation
 * needs.
 *
 * @type {(imageBytes:Uint8ClampedArray)=>number}
 */
const sourceColorInARGBFromImageBytes = imageBytes => {
    const pixels = []

    for (let i = 0; i < imageBytes.length; i += 4) {
        const r =
            /**
             * @type {number}
             */
            // eslint-disable-next-line no-extra-parens
            (imageBytes[i])

        const g =
            /**
             * @type {number}
             */
            // eslint-disable-next-line no-extra-parens
            (imageBytes[i + 1])

        const b =
            /**
             * @type {number}
             */
            // eslint-disable-next-line no-extra-parens
            (imageBytes[i + 2])

        const a =
            /**
             * @type {number}
             */
            // eslint-disable-next-line no-extra-parens
            (imageBytes[i + 3])

        if (a < 255) {
            continue
        }

        const argb = argbFromRgb(r, g, b)

        pixels.push(argb)
    }

    const result = QuantizerCelebi.quantize(pixels, 128)

    const ranked = Score.score(result)

    const top =
        /**
         * @type {number}
         */
        // eslint-disable-next-line no-extra-parens
        (ranked[0])

    return top
}

/**
 * @type {()=>Promise<void>}
 */
const nextTaskHandler = async() => {
    const task = taskQueue.shift()

    if (task) {
        const { key, fileURL } = task

        try {
            if (!offscreenCanvasContext) {
                offscreenCanvas ||= new OffscreenCanvas(
                    backgroundWidth,
                    backgroundHeight,
                )

                offscreenCanvasContext = offscreenCanvas.getContext('2d', {
                    alpha: true,
                })

                if (offscreenCanvasContext) {
                    offscreenCanvasContext.imageSmoothingEnabled = true
                }
            } else {
                offscreenCanvasContext.clearRect(
                    0,
                    0,
                    backgroundWidth,
                    backgroundHeight,
                )
            }

            if (!auxiliaryOffscreenCanvasContext) {
                auxiliaryOffscreenCanvas ||= new OffscreenCanvas(
                    foregroundFilledWidth,
                    foregroundFilledHeight,
                )

                auxiliaryOffscreenCanvasContext =
                    auxiliaryOffscreenCanvas.getContext('2d', {
                        alpha: false,
                    })

                if (auxiliaryOffscreenCanvasContext) {
                    auxiliaryOffscreenCanvasContext.imageSmoothingEnabled = true
                }
            } else {
                auxiliaryOffscreenCanvasContext.clearRect(
                    0,
                    0,
                    foregroundFilledWidth,
                    foregroundFilledHeight,
                )
            }

            if (
                offscreenCanvas &&
                offscreenCanvasContext &&
                auxiliaryOffscreenCanvas &&
                auxiliaryOffscreenCanvasContext
            ) {
                const imageBitmap = await createImageBitmap(
                    await (await fetch(fileURL)).blob(),
                )

                try {
                    const imageAspectRatio =
                        imageBitmap.width / imageBitmap.height

                    let dx = NaN

                    let dy = NaN

                    let dw = NaN

                    let dh = NaN

                    if (imageAspectRatio > canvasAspectRatio) {
                        dw =
                            imageBitmap.width * backgroundHeight /
                            imageBitmap.height

                        dh = backgroundHeight

                        dx = (backgroundWidth - dw) / 2

                        dy = 0
                    } else {
                        dw = backgroundWidth

                        dh =
                            imageBitmap.height * backgroundWidth /
                            imageBitmap.width

                        dx = 0

                        dy = (backgroundHeight - dh) / 2
                    }

                    offscreenCanvasContext.drawImage(
                        imageBitmap,
                        dx,
                        dy,
                        dw,
                        dh,
                    )

                    const imageData = offscreenCanvasContext.getImageData(
                        0,
                        0,
                        backgroundWidth,
                        backgroundHeight,
                    )

                    const darkColorScheme = Scheme.dark(
                        sourceColorInARGBFromImageBytes(imageData.data),
                    )

                    const basicRGB = rgbaFromArgb(
                        darkColorScheme.primaryContainer,
                    )

                    const { h, s, l } = hslFromRgb(basicRGB)

                    const modifiedRGB = rgbFromHsl({
                        h,
                        s: s * 0.84,
                        l,
                    })

                    const gradientStartColor = `rgba(${modifiedRGB.r}, ${modifiedRGB.g}, ${modifiedRGB.b}, 0.05)`

                    const gradientEndColor = `rgba(${modifiedRGB.r}, ${modifiedRGB.g}, ${modifiedRGB.b}, 0.54)`

                    const solidColor = `rgba(${basicRGB.r}, ${basicRGB.g}, ${basicRGB.b}, 0.54)`

                    // eslint-disable-next-line require-atomic-updates
                    auxiliaryOffscreenCanvasContext.fillStyle = solidColor

                    auxiliaryOffscreenCanvasContext.fillRect(
                        0,
                        0,
                        foregroundFilledWidth,
                        foregroundFilledHeight,
                    )

                    auxiliaryOffscreenCanvasContext.putImageData(
                        imageData,
                        blurPadding,
                        blurPadding + foregroundHeight - backgroundHeight,
                    )

                    auxiliaryOffscreenCanvasContext.filter = `blur(${blurAmount}px)`

                    auxiliaryOffscreenCanvasContext.drawImage(
                        auxiliaryOffscreenCanvas,
                        0,
                        0,
                    )

                    offscreenCanvasContext.drawImage(
                        auxiliaryOffscreenCanvas,
                        blurPadding,
                        blurPadding,
                        backgroundWidth,
                        foregroundHeight,
                        0,
                        backgroundHeight - foregroundHeight,
                        backgroundWidth,
                        foregroundHeight,
                    )

                    const gradient =
                        offscreenCanvasContext.createRadialGradient(
                            backgroundWidth / 2,
                            backgroundHeight / 2,
                            0,
                            backgroundWidth / 2,
                            backgroundHeight / 2,
                            Math.max(backgroundWidth, backgroundHeight) / 2,
                        )

                    gradient.addColorStop(0, gradientStartColor)

                    gradient.addColorStop(1, gradientEndColor)

                    offscreenCanvasContext.fillStyle = gradient

                    offscreenCanvasContext.fillRect(
                        0,
                        0,
                        backgroundWidth,
                        backgroundHeight,
                    )

                    offscreenCanvasContext.fillStyle = solidColor

                    offscreenCanvasContext.fillRect(
                        0,
                        backgroundHeight - foregroundHeight,
                        backgroundWidth,
                        foregroundHeight,
                    )

                    const coverArrayBuffer = await (
                        await offscreenCanvas.convertToBlob({
                            type: 'image/webp',
                            quality: 0.8,
                        })
                    ).arrayBuffer()

                    self.postMessage(
                        {
                            key,
                            coverArrayBuffer,
                            colorScheme: {
                                colorOnPrimaryContainer: hexFromArgb(
                                    darkColorScheme.onPrimaryContainer,
                                ),
                                colorPrimary: hexFromArgb(
                                    darkColorScheme.primary,
                                ),
                                colorOnPrimary: hexFromArgb(
                                    darkColorScheme.onPrimary,
                                ),
                            },
                        },
                        [coverArrayBuffer],
                    )
                } finally {
                    imageBitmap.close()
                }
            } else {
                throw new Error("Can't get context of OffscreenCanvas.")
            }
        } catch (error) {
            console.error(error)

            const arrayBuffer = new ArrayBuffer(0)

            self.postMessage(
                {
                    key,
                    coverArrayBuffer: arrayBuffer,
                    colorScheme: {
                        colorOnPrimaryContainer: '',
                        colorPrimary: '',
                        colorOnPrimary: '',
                    },
                },
                [arrayBuffer],
            )
        } finally {
            nextTaskHandler()
        }
    } else {
        isProcessing = false

        timeoutIDOfUselessOffscreenCanvasClear = self.setTimeout(() => {
            auxiliaryOffscreenCanvasContext = null

            auxiliaryOffscreenCanvas = void null

            offscreenCanvasContext = null

            offscreenCanvas = void null
        }, fifteen.second)
    }
}

self.addEventListener(
    'message',
    /**
     * @type {(event:MessageEvent<{
     * key:string,
     * fileURL:string,
     * }>)=>void}
     */
    ({ data }) => {
        taskQueue.push(data)

        if (!isProcessing) {
            isProcessing = true

            clearTimeout(timeoutIDOfUselessOffscreenCanvasClear)

            nextTaskHandler()
        }
    },
)