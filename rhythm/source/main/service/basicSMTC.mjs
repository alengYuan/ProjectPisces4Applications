import { EventEmitter } from 'node:events'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * @type {(importAnchor:string,shiftPath:string)=>import("./smtc.d.ts")}
 */
export const requestDynamicLibrary = (importAnchor, shiftPath) =>
    /**
     * @type {import("./smtc.d.ts")}
     */
    // eslint-disable-next-line no-extra-parens
    (
        createRequire(importAnchor)(
            join(
                dirname(fileURLToPath(importAnchor)),
                shiftPath,
                'rhythm-native-smtc.node',
            ),
        )
    )

const theOnlyInstance = {
    /**
     * @type {undefined|SMTC}
     */
    smtc: void null,
}

/**
 * @extends {EventEmitter<{
 * 'previous-track':[],
 * 'play':[],
 * 'pause':[],
 * 'next-track':[],
 * }>}
 */
export class SMTC extends EventEmitter {
    /**
     * @type {undefined|import("./smtc.d.ts").SMTC}
     */
    #smtc = void null

    /**
     * @type {boolean}
     */
    // eslint-disable-next-line accessor-pairs
    get open() {
        return Boolean(this.#smtc?.isOpen)
    }

    /**
     * @param {{
     * title:string,
     * artist:string,
     * thumbnail:string,
     * }} metadata
     */
    // eslint-disable-next-line accessor-pairs
    set metadata({ title, artist, thumbnail }) {
        this.#smtc?.updateMetadata(title, artist, thumbnail)
    }

    /**
     * @param {'playing'|'paused'} playbackState
     */
    // eslint-disable-next-line accessor-pairs
    set playbackState(playbackState) {
        this.#smtc?.updatePlaybackState(
            {
                playing: true,
                paused: false,
            }[playbackState],
        )
    }

    /**
     * @param {typeof import("./smtc.d.ts").SMTC} ClassSMTC
     */
    constructor(ClassSMTC) {
        super()

        if (theOnlyInstance.smtc) {
            // eslint-disable-next-line no-constructor-return
            return theOnlyInstance.smtc
        }

        theOnlyInstance.smtc = this

        this.#smtc = new ClassSMTC((_, eventName) => {
            eventName && this.emit(eventName)
        })
    }

    /**
     * @type {()=>void}
     */
    enable() {
        this.#smtc?.enable()
    }

    /**
     * @type {()=>this}
     */
    close() {
        if (this.open) {
            this.#smtc?.close()

            theOnlyInstance.smtc = void null
        }

        return this
    }
}

/**
 * @type {undefined|import("./smtc.d.ts")}
 */
let moduleSlot = void null

export const moduleWrapper = {
    /**
     * @type {import("./smtc.d.ts")}
     */
    // eslint-disable-next-line accessor-pairs
    get core() {
        moduleSlot ??= requestDynamicLibrary(import.meta.url, '../module')

        return moduleSlot
    },
}