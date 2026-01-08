import { EventEmitter } from 'node:events'
import {
    one,
    thirty,
    sixty,
    specifyAnimationFrameManager,
    requestAnimationFrames,
} from '@projectleo/tickerjs'
import {
    registerIsGoingToQuitListener,
    emitIsGoingToQuit,
    activateIsRenderedListenerForState,
    renderIsNecessary,
    minDisplaySize,
    requestDisplay,
    requestState,
    initStdinDataListener,
    requestInput,
} from './state.mjs'

/**
 * @type {EventEmitter<{
 * 'is-rendered':[],
 * }>}
 */
const isRenderedEmitter = new EventEmitter()

/**
 * @type {(isRenderedHandler:()=>void)=>void}
 */
export const registerIsRenderedListener = isRenderedHandler => {
    isRenderedEmitter.on('is-rendered', isRenderedHandler)
}

class PatchedString extends String {
    /**
     * @type {number}
     */
    // eslint-disable-next-line accessor-pairs
    get count() {
        return [...super.valueOf()].length
    }

    /**
     * @type {(maxLength:number)=>PatchedString}
     */
    padTail(maxLength) {
        return new PatchedString(
            super.length === this.count
                ? super.padEnd(maxLength, ' ')
                : `${super.valueOf()}${' '.repeat(maxLength - this.count)}`,
        )
    }

    /**
     * @type {(start:number,end?:number)=>PatchedString}
     */
    sliceChar(start, end) {
        if (super.length === this.count) {
            return new PatchedString(super.substring(start, end))
        }

        return new PatchedString(
            [...super.valueOf()]
                .slice(
                    ...typeof end === 'number'
                        ? start > end
                            ? [Math.max(0, end), Math.max(0, start)]
                            : [Math.max(0, start), Math.max(0, end)]
                        : [Math.max(0, start)],
                )
                .join(''),
        )
    }
}

/**
 * @type {(string:string)=>PatchedString}
 */
const p = string =>
    new PatchedString(string)

/**
 * @type {(
 * stringList:TemplateStringsArray,
 * ...expressionList:Array<any>
 * )=>Array<string>}
 */
export const tlc = (stringList, ...expressionList) => {
    const originColumn = stringList
        .reduce(
            (accumulator, currentValue, currentIndex) =>
                `${accumulator}${
                    expressionList[currentIndex - 1] ?? ''
                }${currentValue}`,
        )
        .split('\n')

    if (originColumn[0] === '') {
        originColumn.shift()
    }

    return originColumn.length > 1
        ? (() => {
            const standardLength = Math.max(
                ...originColumn.map(string =>
                    p(string).count),
            )

            return originColumn.map(string =>
                p(string).padTail(standardLength)
                    .toString())
        })()
        : originColumn
}

/**
 * @type {(position:number)=>boolean}
 */
const determinePositionIsValid = position =>
    !isNaN(position) &&
    Math.abs(position) !== Infinity &&
    Number.isInteger(position)

/**
 * @type {(
 * parentLength:number,
 * childLength:number,
 * position:number,
 * )=>{
 * cuttingPointPair:[number,number],
 * isOutOfBounds:boolean,
 * }}
 */
const getPositionMeta = (parentLength, childLength, position) => {
    const isStartBased = (position || 1 / position) > 0

    const startCuttingPoint = isStartBased
        ? position
        : parentLength + position - childLength

    const endCuttingPoint = isStartBased
        ? position + childLength
        : parentLength + position

    const isOutOfBounds =
        isStartBased && startCuttingPoint >= parentLength ||
        !isStartBased && endCuttingPoint <= 0

    return {
        cuttingPointPair: [startCuttingPoint, endCuttingPoint],
        isOutOfBounds,
    }
}

/**
 * @type {(
 * parent:string,
 * child:string,
 * leftCuttingPoint:number,
 * rightCuttingPoint:number,
 * alphaIsEnabled?:boolean,
 * )=>string}
 */
const overwriteTextLine = (
    _parent,
    _child,
    leftCuttingPoint,
    rightCuttingPoint,
    alphaIsEnabled,
) => {
    const parent = p(_parent)

    const child = p(_child)

    const effectiveChild = child.sliceChar(
        Math.max(0, -leftCuttingPoint),
        child.count - Math.max(0, rightCuttingPoint - parent.count),
    )

    const toBeOverwrittenParentSliceCharList = [
        ...parent.sliceChar(leftCuttingPoint, rightCuttingPoint),
    ]

    return [
        parent.sliceChar(0, leftCuttingPoint),
        alphaIsEnabled
            ? [...effectiveChild]
                .map((char, index) =>
                    char === ' '
                        ? toBeOverwrittenParentSliceCharList[index]
                        : char)
                .join('')
            : effectiveChild,
        parent.sliceChar(rightCuttingPoint),
    ].join('')
}

/**
 * @type {(
 * parent:string,
 * child:string,
 * horizontalPosition:number,
 * alphaIsEnabled?:boolean,
 * )=>string}
 */
export const standaloneOverwriteTextLineForTest = (
    parent,
    child,
    horizontalPosition,
    alphaIsEnabled,
) => {
    if (!determinePositionIsValid(horizontalPosition)) {
        return parent
    }

    const {
        cuttingPointPair: [leftCuttingPoint, rightCuttingPoint],
        isOutOfBounds,
    } = getPositionMeta(p(parent).count, p(child).count, horizontalPosition)

    if (isOutOfBounds) {
        return parent
    }

    return overwriteTextLine(
        parent,
        child,
        leftCuttingPoint,
        rightCuttingPoint,
        alphaIsEnabled,
    )
}

/**
 * @type {(
 * parent:Array<string>,
 * child:Array<string>,
 * horizontalPosition:number,
 * verticalPosition:number,
 * alphaIsEnabled?:boolean,
 * )=>Array<string>}
 */
export const overwriteTextLineColumn = (
    parent,
    child,
    horizontalPosition,
    verticalPosition,
    alphaIsEnabled,
) => {
    if (
        !determinePositionIsValid(horizontalPosition) ||
        !determinePositionIsValid(verticalPosition)
    ) {
        return parent
    }

    const parentSample = parent[0]

    const childSample = child[0]

    if (
        !parentSample ||
        !childSample ||
        !parentSample.length ||
        !childSample.length
    ) {
        return parent
    }

    const {
        cuttingPointPair: [topCuttingPoint, bottomCuttingPoint],
        isOutOfBounds: isOutOfVerticalBounds,
    } = getPositionMeta(parent.length, child.length, verticalPosition)

    const {
        cuttingPointPair: [leftCuttingPoint, rightCuttingPoint],
        isOutOfBounds: isOutOfHorizontalBounds,
    } = getPositionMeta(
        p(parentSample).count,
        p(childSample).count,
        horizontalPosition,
    )

    if (isOutOfHorizontalBounds || isOutOfVerticalBounds) {
        return parent
    }

    const effectiveChild = child.slice(
        Math.max(0, -topCuttingPoint),
        Math.max(
            0,
            child.length - Math.max(0, bottomCuttingPoint - parent.length),
        ),
    )

    const toBeOverwrittenParentSlice = parent.slice(
        Math.max(0, topCuttingPoint),
        Math.max(0, bottomCuttingPoint),
    )

    return [
        ...parent.slice(0, Math.max(0, topCuttingPoint)),
        ...effectiveChild.map((string, index) =>
            overwriteTextLine(
                toBeOverwrittenParentSlice[index] ?? '',
                string,
                leftCuttingPoint,
                rightCuttingPoint,
                alphaIsEnabled,
            )),
        ...parent.slice(Math.max(0, bottomCuttingPoint)),
    ]
}

/**
 * @typedef {(...children:Array<[
 * child:Array<string>|MergeHandler,
 * horizontalPosition:number,
 * verticalPosition:number,
 * alphaIsEnabled?:boolean,
 * ]>)=>Array<string>} MergeHandler
 * @type {(
 * stringList:TemplateStringsArray,
 * ...expressionList:Array<any>
 * )=>MergeHandler}
 */
export const c =
    (stringList, ...expressionList) =>
        (...children) =>
            !children.length
                ? tlc(stringList, ...expressionList)
                : children.reduce(
                    (
                        accumulator,
                        [
                            child,
                            horizontalPosition,
                            verticalPosition,
                            alphaIsEnabled,
                        ],
                    ) =>
                        overwriteTextLineColumn(
                            accumulator,
                            typeof child === 'function' ? child() : child,
                            horizontalPosition,
                            verticalPosition,
                            alphaIsEnabled,
                        ),
                    tlc(stringList, ...expressionList),
                )

/**
 * @typedef {{
 * requestState:typeof requestState,
 * requestInput:typeof requestInput,
 * requestEffect:(effectHandler:(args:{
 * frameCount:number,
 * delta:number,
 * time:number,
 * })=>void)=>void,
 * }} Tool
 * @typedef {typeof c} C
 * @type {<
 * T extends {[key:string]:import("./state.mjs").State<any>},
 * U extends false|((tool:Tool)=>void|T),
 * >(
 * allowedMinSize:[width:number,height:number],
 * hooks:{
 * init:U,
 * loop:(c:C,args:{
 * frameCount:number,
 * delta:number,
 * time:number,
 * displaySize:{
 * width:number,
 * height:number,
 * },
 * state:U extends (tool:Tool)=>void|T
 * ?ReturnType<U>
 * :void,
 * },components:{
 * nc:(width:number,height:number)=>ReturnType<C>,
 * bc:(width:number,height:number)=>ReturnType<C>,
 * })=>Parameters<ReturnType<C>>,
 * clean?:()=>void|Promise<void>,
 * },
 * schedulingOptimizationIsDisabled?:boolean,
 * )=>void}
 */
export const render = (
    [allowedMinWidth, allowedMinHeight],
    { init, loop, clean },
    schedulingOptimizationIsDisabled,
) => {
    /**
     * @type {(string:string)=>boolean}
     */
    const w = string =>
        process.stdout.write(string)

    /**
     * @type {()=>void}
     */
    const enterAlternateScreenBuffer = () => {
        w('\x1B[?1049h')

        w('\x1B[?25l')
    }

    /**
     * @type {()=>void}
     */
    const leaveAlternateScreenBuffer = () => {
        w('\x1B[?25h')

        w('\x1B[?1049l')
    }

    /**
     * @type {(width:number,height:number)=>ReturnType<C>}
     */
    const nc = (width, height) =>
        c`${Array.from({ length: height }).fill(' '.repeat(width))
            .join('\n')}`

    /**
     * @type {(width:number,height:number)=>ReturnType<C>}
     */
    const bc = (width, height) =>
        c`
┌${'─'.repeat(width - 2)}┐
${Array.from({ length: height - 2 })
        .fill(`│${' '.repeat(width - 2)}│`)
        .join('\n')}
└${'─'.repeat(width - 2)}┘`

    const { displaySize } = requestDisplay({
        width: allowedMinWidth,
        height: allowedMinHeight,
    })

    /**
     * @type {(frame:Parameters<ReturnType<C>>)=>void}
     */
    const drawFrame = frame => {
        w(
            `\x1B[1;1H${nc(
                displaySize.width,
                displaySize.height,
            )(...frame).join('')}`,
        )
    }

    process.once('uncaughtException', error => {
        emitIsGoingToQuit(error)
    })

    process.once('unhandledRejection', reason => {
        emitIsGoingToQuit(new Error(String(reason)))
    })

    /**
     * @type {void|{[key:string]:import("./state.mjs").State<any>}}
     */
    let state =
        /**
         * @type {void}
         */
        // eslint-disable-next-line no-extra-parens
        (void null)

    /**
     * @type {number}
     */
    let frameCountSnapshot = NaN

    /**
     * @type {number}
     */
    let deltaSnapshot = NaN

    /**
     * @type {number}
     */
    let timeSnapshot = NaN

    /**
     * @type {()=>void}
     */
    const actionOnStart = () => {
        enterAlternateScreenBuffer()

        initStdinDataListener()

        activateIsRenderedListenerForState()

        if (init) {
            /**
             * @type {(effectHandler:(args:{
             * frameCount:number,
             * delta:number,
             * time:number,
             * })=>void)=>void}
             */
            const requestEffect = effectHandler => {
                registerIsRenderedListener(() => {
                    setTimeout(() => {
                        effectHandler({
                            frameCount: frameCountSnapshot,
                            delta: deltaSnapshot,
                            time: timeSnapshot,
                        })
                    })
                })
            }

            state = init({
                requestState,
                requestInput,
                requestEffect,
            })
        }
    }

    /**
     * @type {(args:{
     * frameCount:number,
     * delta:number,
     * time:number,
     * })=>void}
     */
    const actionOnFrame = ({ frameCount, delta, time }) => {
        if (
            displaySize.width < minDisplaySize.width ||
            displaySize.height < minDisplaySize.height
        ) {
            emitIsGoingToQuit(
                new Error(
                    "Terminal size doesn't meet the rendering requirements.",
                ),
            )
        }

        frameCountSnapshot = frameCount

        deltaSnapshot = delta

        timeSnapshot = time

        if (renderIsNecessary.on) {
            drawFrame(
                loop(
                    c,
                    {
                        frameCount,
                        delta,
                        time,
                        displaySize,
                        // eslint-disable-next-line object-shorthand
                        state:
                            /**
                             * @type {any}
                             */
                            // eslint-disable-next-line no-extra-parens
                            (state),
                    },
                    {
                        nc,
                        bc,
                    },
                ),
            )

            isRenderedEmitter.emit('is-rendered')
        }
    }

    !schedulingOptimizationIsDisabled &&
        specifyAnimationFrameManager({
            requestAnimationFrame: callback =>
                setTimeout(
                    () =>
                        callback(performance.now()),
                    Math.floor(one.second / sixty.fps),
                ),
            cancelAnimationFrame: handle => {
                clearTimeout(handle)
            },
        })

    const cancelAnimationFrames = requestAnimationFrames({
        frameRate: thirty.fps,
        actionOnStart,
        actionOnFrame,
    })

    registerIsGoingToQuitListener(async data => {
        cancelAnimationFrames()

        leaveAlternateScreenBuffer()

        /**
         * @type {0|1}
         */
        let exitCode = 0

        if (data) {
            exitCode = 1

            console.error(data.error)
        }

        try {
            if (clean) {
                const returns = clean()
                if (returns instanceof Promise) {
                    await returns
                }
            }
        } catch (error) {
            exitCode = 1

            console.error(error)
        }

        process.exit(exitCode)
    })
}