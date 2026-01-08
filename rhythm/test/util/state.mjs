import { EventEmitter } from 'node:events'
import { registerIsRenderedListener } from './renderer.mjs'

/**
 * @type {EventEmitter<{
 * 'is-going-to-quit':[data?:{
 * error:Error,
 * }],
 * }>}
 */
const isGoingToQuitEmitter = new EventEmitter()

/**
 * @type {(isGoingToQuitHandler:(data?:{
 * error:Error,
 * })=>void)=>void}
 */
export const registerIsGoingToQuitListener = isGoingToQuitHandler => {
    isGoingToQuitEmitter.on('is-going-to-quit', isGoingToQuitHandler)
}

/**
 * @type {(error?:Error)=>void}
 */
export const emitIsGoingToQuit = error => {
    if (error instanceof Error) {
        isGoingToQuitEmitter.emit('is-going-to-quit', { error })
    } else {
        isGoingToQuitEmitter.emit('is-going-to-quit')
    }
}

let renderIsNecessaryIsOn = true

process.stdout.on('resize', () => {
    renderIsNecessaryIsOn = true
})

/**
 * @type {()=>void}
 */
export const activateIsRenderedListenerForState = () => {
    registerIsRenderedListener(() => {
        renderIsNecessaryIsOn = false
    })
}

export const renderIsNecessary = {
    /**
     * @type {boolean}
     */
    // eslint-disable-next-line accessor-pairs
    get on() {
        return renderIsNecessaryIsOn
    },
}

let minDisplayWidth = 80

let minDisplayHeight = 12

export const minDisplaySize = {
    /**
     * @type {number}
     */
    // eslint-disable-next-line accessor-pairs
    get width() {
        return minDisplayWidth
    },
    /**
     * @type {number}
     */
    // eslint-disable-next-line accessor-pairs
    get height() {
        return minDisplayHeight
    },
}

/**
 * @type {(allowedMinSize:{
 * width:number,
 * height:number,
 * })=>{
 * displaySize:{
 * width:number,
 * height:number,
 * },
 * }}
 */
export const requestDisplay = allowedMinSize => {
    if (
        !isNaN(allowedMinSize.width) &&
        Math.abs(allowedMinSize.width) !== Infinity &&
        Number.isInteger(allowedMinSize.width) &&
        allowedMinSize.width > 0 &&
        !isNaN(allowedMinSize.height) &&
        Math.abs(allowedMinSize.height) !== Infinity &&
        Number.isInteger(allowedMinSize.height) &&
        allowedMinSize.height > 0
    ) {
        minDisplayWidth = allowedMinSize.width

        minDisplayHeight = allowedMinSize.height
    }

    return {
        displaySize: {
            /**
             * @type {number}
             */
            // eslint-disable-next-line accessor-pairs
            get width() {
                return process.stdout.columns
            },
            /**
             * @type {number}
             */
            // eslint-disable-next-line accessor-pairs
            get height() {
                return process.stdout.rows
            },
        },
    }
}

/**
 * @type {Map<string,any>}
 */
const stateMap = new Map()

/**
 * @template VALUE
 */
export class State {
    /**
     * @type {string}
     */
    #key

    /**
     * @type {(state:VALUE)=>string}
     */
    // eslint-disable-next-line class-methods-use-this
    #toStringHandler = state =>
        String(state)

    /**
     * @type {VALUE}
     */
    // eslint-disable-next-line accessor-pairs
    get raw() {
        return structuredClone(stateMap.get(this.#key))
    }

    /**
     * @param {string} key
     * @param {VALUE} initialValue
     * @param {(state:VALUE)=>string} [toStringHandler]
     */
    constructor(key, initialValue, toStringHandler) {
        this.#key = key

        stateMap.set(key, structuredClone(initialValue))

        if (toStringHandler) {
            this.#toStringHandler = toStringHandler
        }
    }

    /**
     * @type {()=>string}
     */
    toString() {
        return this.#toStringHandler(structuredClone(stateMap.get(this.#key)))
    }

    /**
     * @type {()=>string}
     */
    toJSON() {
        return `State:${this}`
    }
}

/**
 * @type {(string:string)=>string}
 */
const toCapitalize = string =>
    string.charAt(0).toUpperCase() + string.slice(1)

/**
 * @type {<KEY extends string,VALUE>(
 * key:KEY,
 * initialValue:VALUE,
 * toStringHandler?:(state:VALUE)=>string,
 * )=>Record<KEY,State<VALUE>>&Record<
 * `set${Capitalize<KEY>}`,
 * (newValue:VALUE)=>void
 * >}
 */
export const requestState = (key, initialValue, toStringHandler) =>
    /**
     * @typedef {typeof key} KEY
     * @typedef {typeof initialValue} VALUE
     * @type {Record<KEY,State<VALUE>>&Record<
     * `set${Capitalize<KEY>}`,
     * (newValue:VALUE)=>void
     * >}
     */
    ({
        [key]: new State(key, initialValue, toStringHandler),
        [`set${toCapitalize(key)}`]:
            /**
             * @type {(newValue:typeof initialValue)=>void}
             */
            newValue => {
                renderIsNecessaryIsOn = true

                stateMap.set(key, structuredClone(newValue))
            },
    })

/**
 * @typedef {'`'|'1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'0'|'-'|'='
 * |'w'|'e'|'r'|'t'|'y'|'u'|'i'|'o'|'p'|'['|']'|'\\'
 * |'a'|'s'|'d'|'f'|'g'|'h'|'j'|'k'|'l'|';'|'\''
 * |'z'|'x'|'c'|'v'|'b'|'n'|'m'|','|'.'|'/'} AllowedKey
 */

/**
 * @type {Map<AllowedKey,()=>void|Promise<void>>}
 */
const inputHandlerMap = new Map()

/**
 * @type {()=>void}
 */
export const initStdinDataListener = () => {
    process.stdin
        .setEncoding('utf8')
        .setRawMode(true)
        .resume()
        .on('data', async data => {
            const key =
                /**
                 * @type {'q'|AllowedKey}
                 */
                // eslint-disable-next-line no-extra-parens
                (data.toString().toLocaleLowerCase())

            switch (key) {
                case 'q':
                    isGoingToQuitEmitter.emit('is-going-to-quit')

                    break
                default: {
                    const inputHandler = inputHandlerMap.get(key)

                    if (typeof inputHandler === 'function') {
                        try {
                            const returns = inputHandler()
                            if (returns instanceof Promise) {
                                await returns
                            }
                        } catch (error) {
                            if (error instanceof Error) {
                                isGoingToQuitEmitter.emit('is-going-to-quit', {
                                    error,
                                })
                            }
                        }
                    }
                }
            }
        })
}

/**
 * @template {AllowedKey} POOL
 * @typedef {<KEY extends POOL>(
 * key:KEY,
 * inputHandler:()=>void|Promise<void>,
 * )=>[Exclude<POOL,KEY>] extends [never]
 * ?void
 * :{
 * requestInput:RequestInput<Exclude<POOL,KEY>>,
 * }} RequestInput
 */

/**
 * @type {RequestInput<AllowedKey>}
 */
export const requestInput = (key, inputHandler) => {
    inputHandlerMap.set(key, inputHandler)

    const self =
        /**
         * @type {any}
         */
        // eslint-disable-next-line no-extra-parens
        ({
            requestInput,
        })

    return self
}