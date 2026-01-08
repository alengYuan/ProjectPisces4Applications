import { screen } from 'electron'
import { sixty, requestAnimationFrames } from '@projectleo/tickerjs'

/**
 * @type {(renderer:import("../util/index.mjs").Renderer)=>{
 * cleaner:()=>void,
 * terminator:()=>void,
 * }}
 */
export const handleShowContent = renderer => {
    let terminator = () => {
        clearImmediate(void null)
    }

    const timeoutIDOfContentShow = setTimeout(() => {
        const cursorPoint = screen.getCursorScreenPoint()

        const display = screen.getAllDisplays().find(({ bounds }) => {
            if (
                cursorPoint.x >= bounds.x &&
                cursorPoint.x < bounds.x + bounds.width &&
                cursorPoint.y >= bounds.y &&
                cursorPoint.y < bounds.y + bounds.height
            ) {
                return true
            }

            return false
        })

        if (display) {
            const [windowWidth, windowHeight] =
                /**
                 * @type {[number,number]}
                 */
                // eslint-disable-next-line no-extra-parens
                (renderer.getSize())

            const verticalSpacing = 20
            const shadowHeight = 8

            let windowX = cursorPoint.x
            let windowY = cursorPoint.y

            if (windowX - Math.ceil(windowWidth / 2) < display.bounds.x) {
                windowX = display.bounds.x
            } else if (
                windowX + Math.ceil(windowWidth / 2) >
                display.bounds.x + display.bounds.width
            ) {
                windowX = display.bounds.x + display.bounds.width - windowWidth
            } else {
                windowX -= Math.ceil(windowWidth / 2)
            }

            if (
                windowY - verticalSpacing + shadowHeight - windowHeight <
                display.bounds.y
            ) {
                windowY += verticalSpacing
            } else {
                windowY -= verticalSpacing - shadowHeight + windowHeight
            }

            terminator = requestAnimationFrames({
                frameRate: sixty.fps,
                actionOnStart: () => {
                    renderer.setPosition(windowX, windowY)
                },
                actionOnFrame: ({ frameCount }) => {
                    const opacity = [
                        0.161,
                        0.31,
                        0.449,
                        0.576,
                        0.687,
                        0.785,
                        0.867,
                        0.929,
                        0.971,
                        0.996,
                    ][frameCount - 1]

                    if (typeof opacity === 'number') {
                        renderer.setOpacity(opacity)

                        return void null
                    }

                    return {
                        continueHandleFrames: false,
                    }
                },
                actionOnEnd: () => {
                    renderer.setOpacity(1)
                },
            })
        }
    }, 800)

    return {
        cleaner: () => {
            clearTimeout(timeoutIDOfContentShow)
        },
        terminator,
    }
}