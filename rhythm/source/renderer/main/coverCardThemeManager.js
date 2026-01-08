import { initedValueObject } from './index'

const workerPoolMaxCount = 8

const workerPoolCount = Math.min(
    Math.max((navigator.hardwareConcurrency || 1) - 4, 1),
    workerPoolMaxCount,
)

/**
 * @type {Array<Worker>}
 */
const workerPool = []

/**
 * @type {Map<string,{
 * coverObjectURL:string,
 * colorScheme:{
 * colorOnPrimaryContainer:string,
 * colorPrimary:string,
 * colorOnPrimary:string,
 * },
 * }>}
 */
const themeCacheMap = new Map()

/**
 * @type {Map<string,React.Dispatch<React.SetStateAction<{
 * coverObjectURL:string,
 * colorScheme:{
 * colorOnPrimaryContainer:string,
 * colorPrimary:string,
 * colorOnPrimary:string,
 * },
 * }>>>}
 */
const reactDispatchMap = new Map()

/**
 * @type {undefined|React.Dispatch<React.SetStateAction<{
 * coverObjectURL:string,
 * colorScheme:{
 * colorOnPrimaryContainer:string,
 * colorPrimary:string,
 * colorOnPrimary:string,
 * },
 * }>>}
 */
let theOneReactDispatch = void null

/**
 * @type {()=>void}
 */
export const initCoverCardThemeManager = () => {
    for (let count = 0; count < workerPoolCount; count += 1) {
        const worker = new Worker(
            './renderer/coverCardThemeManager.main.worker.js',
        )

        worker.addEventListener(
            'message',
            /**
             * @type {(event:MessageEvent<{
             * key:string,
             * coverArrayBuffer:ArrayBuffer,
             * colorScheme:{
             * colorOnPrimaryContainer:string,
             * colorPrimary:string,
             * colorOnPrimary:string,
             * },
             * }>)=>void}
             */
            // eslint-disable-next-line no-loop-func
            ({ data: { key, coverArrayBuffer, colorScheme } }) => {
                requestAnimationFrame(() => {
                    const isTheOne = key.startsWith('+')

                    if (coverArrayBuffer.byteLength > 0) {
                        const generalKey = isTheOne ? key.slice(1) : key

                        const themeCache = {
                            coverObjectURL: URL.createObjectURL(
                                new Blob([coverArrayBuffer], {
                                    type: 'image/webp',
                                }),
                            ),
                            colorScheme,
                        }

                        const oldThemeCache = themeCacheMap.get(generalKey)

                        themeCacheMap.set(generalKey, themeCache)

                        if (isTheOne) {
                            if (theOneReactDispatch) {
                                theOneReactDispatch(themeCache)

                                theOneReactDispatch = void null
                            }
                        } else {
                            const reactDispatch = reactDispatchMap.get(key)

                            if (reactDispatch) {
                                reactDispatchMap.delete(key)

                                reactDispatch(themeCache)
                            }
                        }

                        if (oldThemeCache) {
                            URL.revokeObjectURL(oldThemeCache.coverObjectURL)
                        }
                    } else if (isTheOne) {
                        theOneReactDispatch = void null
                    } else {
                        reactDispatchMap.delete(key)
                    }
                })
            },
        )

        workerPool.push(worker)
    }
}

/**
 * @type {(key:string)=>undefined|{
 * coverObjectURL:string,
 * colorScheme:{
 * colorOnPrimaryContainer:string,
 * colorPrimary:string,
 * colorOnPrimary:string,
 * },
 * }}
 */
export const tryGetThemeCache = key =>
    themeCacheMap.get(key)

export const emptyTheme = {
    coverObjectURL: '',
    colorScheme: {
        colorOnPrimaryContainer: '',
        colorPrimary: '',
        colorOnPrimary: '',
    },
}

/**
 * @type {()=>Generator<number,never,unknown>}
 */
const workerShiftNumberGenerator = function *() {
    let workerShiftNumber = 0

    for (;;) {
        yield workerShiftNumber

        workerShiftNumber += 1

        if (workerShiftNumber >= workerPoolCount) {
            workerShiftNumber = 0
        }
    }
}

const workerShiftNumber = workerShiftNumberGenerator()

/**
 * @type {(key:string,coverSource:string,reactDispatch:React.Dispatch<React.SetStateAction<{
 * coverObjectURL:string,
 * colorScheme:{
 * colorOnPrimaryContainer:string,
 * colorPrimary:string,
 * colorOnPrimary:string,
 * },
 * }>>)=>void}
 */
export const requestCoverCardTheme = (key, coverSource, reactDispatch) => {
    const isTheOne = key.startsWith('+')

    const themeCache = themeCacheMap.get(isTheOne ? key.slice(1) : key)
    if (themeCache) {
        reactDispatch(themeCache)
    } else {
        reactDispatch(emptyTheme)

        if (isTheOne) {
            theOneReactDispatch = reactDispatch
        } else {
            reactDispatchMap.set(key, reactDispatch)
        }

        workerPool[workerShiftNumber.next().value]?.postMessage({
            key,
            fileURL: `file://${[initedValueObject.coverRootPath, coverSource]
                .join('/')
                .replaceAll('\\', '/')}`,
        })
    }
}

/**
 * @type {(key:string)=>void}
 */
export const cancelCoverCardTheme = key => {
    if (key.startsWith('+')) {
        theOneReactDispatch = void null
    } else {
        reactDispatchMap.delete(key)
    }
}