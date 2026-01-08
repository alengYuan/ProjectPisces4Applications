/* eslint-disable max-classes-per-file */

import { EventEmitter } from 'node:events'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { NIL as nil } from 'uuid'

/**
 * @type {(importAnchor:string,shiftPath:string)=>import("./player.d.ts")}
 */
export const requestDynamicLibrary = (importAnchor, shiftPath) =>
    /**
     * @type {import("./player.d.ts")}
     */
    // eslint-disable-next-line no-extra-parens
    (
        createRequire(importAnchor)(
            join(
                dirname(fileURLToPath(importAnchor)),
                shiftPath,
                'rhythm-native-player.node',
            ),
        )
    )

const theOnlyInstance = {
    /**
     * @type {undefined|DeviceManager}
     */
    deviceManager: void null,
    /**
     * @type {undefined|Player}
     */
    player: void null,
}

/**
 * @extends {EventEmitter<{
 * 'change':[],
 * }>}
 */
export class DeviceManager extends EventEmitter {
    /**
     * @type {undefined|import("./player.d.ts").DeviceManager}
     */
    #deviceManager = void null

    /**
     * @type {boolean}
     */
    // eslint-disable-next-line accessor-pairs
    get open() {
        return Boolean(this.#deviceManager?.isOpen)
    }

    /**
     * @param {typeof import("./player.d.ts").DeviceManager} ClassDeviceManager
     */
    constructor(ClassDeviceManager) {
        super()

        if (theOnlyInstance.deviceManager) {
            // eslint-disable-next-line no-constructor-return
            return theOnlyInstance.deviceManager
        }

        theOnlyInstance.deviceManager = this

        this.#deviceManager = new ClassDeviceManager((_, eventName) => {
            this.emit(eventName)
        })
    }

    /**
     * @type {()=>void}
     */
    enable() {
        this.#deviceManager?.enable()
    }

    /**
     * @type {()=>this}
     */
    close() {
        if (this.open) {
            this.#deviceManager?.close()

            theOnlyInstance.deviceManager = void null
        }

        return this
    }
}

/**
 * @extends {EventEmitter<{
 * 'initialization':[isSuccessful:boolean],
 * 'device-fatal-exception':[],
 * 'device-no-available-default-audio-endpoint':[],
 * 'device-unavailable-custom-audio-endpoint':[],
 * 'device-unsupported-device-format':[],
 * 'device-silent-exception':[],
 * 'source-invalid-file':[uuid:string],
 * 'source-incorrect-file':[uuid:string],
 * 'track':[uuid:string],
 * 'progress':[second:number],
 * 'state':[isPlaying:boolean],
 * 'finish':[],
 * }>}
 */
export class Player extends EventEmitter {
    /**
     * @type {undefined|import("./player.d.ts").Player}
     */
    #player = void null

    /**
     * @type {undefined|boolean}
     */
    #initializationIsSuccessful = void null

    /**
     * @type {boolean}
     */
    // eslint-disable-next-line accessor-pairs
    get open() {
        return Boolean(this.#player?.isOpen)
    }

    /**
     * @type {undefined|boolean}
     */
    // eslint-disable-next-line accessor-pairs
    get initializationIsSuccessful() {
        return this.#initializationIsSuccessful
    }

    /**
     * @param {typeof import("./player.d.ts").Player} ClassPlayer
     */
    constructor(ClassPlayer) {
        super()

        if (theOnlyInstance.player) {
            // eslint-disable-next-line no-constructor-return
            return theOnlyInstance.player
        }

        theOnlyInstance.player = this

        this.once('initialization', this.#initializationHandler)

        this.#player = new ClassPlayer((_, eventName, dataJSON) => {
            switch (eventName) {
                case 'initialization':
                    this.emit('initialization', JSON.parse(dataJSON))

                    break
                case 'exception':
                    {
                        const dataList =
                            /**
                             * @type {string}
                             */
                            // eslint-disable-next-line no-extra-parens
                            (JSON.parse(dataJSON)).split('::')

                        const [type, variant, uuid] =
                            /**
                             * @type {['DeviceException'|'SourceException',string,string]}
                             */
                            // eslint-disable-next-line no-extra-parens
                            (dataList)

                        switch (type) {
                            case 'DeviceException':
                                {
                                    const eventName =
                                        /**
                                         * @type {'device-fatal-exception'|'device-no-available-default-audio-endpoint'|'device-unavailable-custom-audio-endpoint'|'device-unsupported-device-format'|'device-silent-exception'}
                                         */
                                        // eslint-disable-next-line no-extra-parens
                                        (
                                            {
                                                FatalException:
                                                    'device-fatal-exception',
                                                NoAvailableDefaultAudioEndpoint:
                                                    'device-no-available-default-audio-endpoint',
                                                UnavailableCustomAudioEndpoint:
                                                    'device-unavailable-custom-audio-endpoint',
                                                UnsupportedDeviceFormat:
                                                    'device-unsupported-device-format',
                                                SilentException:
                                                    'device-silent-exception',
                                            }[
                                                /**
                                                 * @type {'FatalException'|'NoAvailableDefaultAudioEndpoint'|'UnavailableCustomAudioEndpoint'|'UnsupportedDeviceFormat'|'SilentException'}
                                                 */
                                                // eslint-disable-next-line no-extra-parens
                                                (variant)
                                            ]
                                        )

                                    this.emit(eventName)
                                }

                                break
                            case 'SourceException':
                                {
                                    const eventName =
                                        /**
                                         * @type {'source-invalid-file'|'source-incorrect-file'}
                                         */
                                        // eslint-disable-next-line no-extra-parens
                                        (
                                            {
                                                InvalidFile:
                                                    'source-invalid-file',
                                                IncorrectFile:
                                                    'source-incorrect-file',
                                            }[
                                                /**
                                                 * @type {'InvalidFile'|'IncorrectFile'}
                                                 */
                                                // eslint-disable-next-line no-extra-parens
                                                (variant)
                                            ]
                                        )

                                    this.emit(
                                        eventName,
                                        uuid === 'NIL' ? nil : uuid,
                                    )
                                }

                                break
                            default:
                        }
                    }

                    break
                case 'track':
                    {
                        /**
                         * @type {string}
                         */
                        const uuid = JSON.parse(dataJSON)

                        this.emit('track', uuid === 'NIL' ? nil : uuid)
                    }

                    break
                case 'progress':
                    this.emit('progress', JSON.parse(dataJSON))

                    break
                case 'state':
                    this.emit(
                        'state',
                        {
                            play: true,
                            pause: false,
                        }[
                            /**
                             * @type {'play'|'pause'}
                             */
                            // eslint-disable-next-line no-extra-parens
                            (JSON.parse(dataJSON))
                        ],
                    )

                    break
                case 'finish':
                    this.emit('finish')

                    break
                default:
            }
        })
    }

    /**
     * @type {(isSuccessful:boolean)=>void}
     */
    #initializationHandler(isSuccessful) {
        this.#initializationIsSuccessful = isSuccessful
    }

    /**
     * @type {(mode:'default'|{
     * category:'custom',
     * id:string,
     * },volume:number)=>void}
     */
    selectMode(mode, volume) {
        const { category, id } =
            mode === 'default' ? { category: mode, id: '' } : mode

        this.#player?.selectMode(category, id, volume)
    }

    /**
     * @type {(value:number)=>void}
     */
    modifyVolume(value) {
        this.#player?.modifyVolume(value)
    }

    /**
     * @type {(path:string,identifier:string)=>void}
     */
    selectFile(path, identifier) {
        this.#player?.selectFile(path, identifier)
    }

    /**
     * @type {(second:number)=>void}
     */
    seekTo(second) {
        this.#player?.seekTo(second)
    }

    /**
     * @type {(state:'play'|'pause'|'stop')=>void}
     */
    switchTo(state) {
        this.#player?.switchTo(state)
    }

    /**
     * @type {()=>this}
     */
    close() {
        if (this.open) {
            this.#player?.close()

            this.off('initialization', this.#initializationHandler)

            theOnlyInstance.player = void null
        }

        return this
    }
}

/**
 * @type {undefined|import("./player.d.ts")}
 */
let moduleSlot = void null

export const moduleWrapper = {
    /**
     * @type {import("./player.d.ts")}
     */
    // eslint-disable-next-line accessor-pairs
    get core() {
        moduleSlot ??= requestDynamicLibrary(import.meta.url, '../module')

        return moduleSlot
    },
}