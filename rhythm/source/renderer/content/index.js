import { openDevTools } from '../util'

const textElement = document.getElementById('text')

const textElementFont = getComputedStyle(
    textElement ?? document.body,
).fontFamily

const offscreenCanvas = new OffscreenCanvas(1, 1)

const offscreenCanvasContext = offscreenCanvas.getContext('2d', {
    alpha: true,
})

/**
 * @type {(text:string)=>number}
 */
const measureText = text =>
    offscreenCanvasContext ? offscreenCanvasContext.measureText(text).width : 1

/**
 * @type {()=>Promise<void>}
 */
export const main = async() => {
    if ('dev_mode' in process.env) {
        openDevTools({
            mode: 'detach',
            title: '[DevTools] Rhythm::Content',
        })
    }

    window['rhythm::content'].updateContent((_, content) => {
        if (textElement) {
            textElement.innerText = content
        }

        window['rhythm::content'].updateWindowWidth(measureText(content) + 30)
    })

    await document.fonts.ready

    if (offscreenCanvasContext) {
        offscreenCanvasContext.imageSmoothingEnabled = true

        offscreenCanvasContext.font = `12px ${textElementFont}`
    }

    window['rhythm::content'].notifyReady()
}