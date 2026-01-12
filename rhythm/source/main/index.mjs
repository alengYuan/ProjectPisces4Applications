import { EventEmitter } from 'node:events'
import { readFileSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
    app,
    BaseWindow,
    dialog,
    ipcMain,
    Menu,
    nativeImage,
    nativeTheme,
    Notification,
    shell,
    Tray,
} from 'electron'
import { one } from '@projectleo/tickerjs'
import BetterSqlite3 from 'better-sqlite3'
import { Decimal } from 'decimal.js'
import express from 'express'
import { NIL as nil } from 'uuid'
import {
    writeFileSync,
    enable,
    requestDataRootPath,
    Renderer,
    titleBarOverlayColorSchemeMap,
    titleBarOverlayHeight,
    Config,
} from './util/index.mjs'
import { handleShowContent } from './content/index.mjs'
import {
    setMetadataParserWorkerPool,
    clearMetadataParserWorkerPool,
    maintainValidTable,
    updateDatabaseByType,
    buildArtistGroupUnderRule,
} from './library/index.mjs'
import { getThumbarButtons, popUpSceneModeSwitchMenu } from './main/index.mjs'
import {
    filterValidQueueSource,
    filterValidQueueAt,
    reshapeQueueCandidateInShuffleOrderMode,
    trySwitchToPreviousQueueTarget,
    trySwitchToNextQueueTarget,
} from './manager/index.mjs'
import {
    requestDeviceList,
    requestDeviceManager,
    requestPlayer,
} from './service/player.mjs'
import { requestSMTC } from './service/smtc.mjs'
import {
    getDefaultLanguage,
    filterValidLanguage,
    filterValidTray,
    filterValidLibraryPathFLAC,
    filterValidLibraryPathMP3,
    filterValidModeCandidate,
    filterValidModeCurrent,
    filterValidRuleArtistSplit,
    filterValidRuleArtistIdentify,
    filterValidRemote,
    filterValidQueueOrderMode,
    filterValidQueueOrderLoop,
    popupInputContextMenu,
} from './setting/index.mjs'

const isDevMode = 'dev_mode' in process.env

/**
 * @type {undefined|Rhythm}
 */
globalThis.rhythm = void null

/**
 * @type {undefined|BaseWindow}
 */
let rebootFuse = void null

/**
 * @type {()=>void}
 */
const setRebootFuse = () => {
    rebootFuse = new BaseWindow({
        show: false,
        title: '-',
        focusable: false,
        frame: false,
        x: 0,
        y: 0,
        minWidth: 1,
        width: 1,
        minHeight: 1,
        height: 1,
        transparent: true,
        backgroundColor: '#00000000',
    })

    rebootFuse.setIgnoreMouseEvents(true)

    rebootFuse.setContentProtection(true)
}

/**
 * @type {()=>void}
 */
const clearRebootFuse = () => {
    if (rebootFuse) {
        rebootFuse.destroy()

        rebootFuse = void null
    }
}

/**
 * @extends {EventEmitter<{
 * 'interface-ready':[],
 * 'necessary-renderer-crash':[],
 * 'exit':[data?:{
 * hardRebootIsRequired:false|{
 * playAfterRebootIsRequired:boolean,
 * },
 * }],
 * 'exited':[],
 * }>}
 */
class Rhythm extends EventEmitter {
    #isInitialized = false

    #isInTemporaryMode = false

    #dataRootPath = (() => {
        const dataRootPath = requestDataRootPath()
        if (!dataRootPath) {
            this.#isInTemporaryMode = true

            return app.getPath('temp')
        }

        return dataRootPath
    })()

    #cacheCoverRootPath = join(this.#dataRootPath, 'cache', 'cover')

    #sourceRootPath = dirname(fileURLToPath(import.meta.url))

    #interface = (() => {
        const Interface = class {
            /**
             * @type {Rhythm}
             */
            #rhythm

            #readyRendererCount = 0

            #readyRendererTarget = 0

            /**
             * @type {Set<Electron.WebContents>}
             */
            #view = new Set()

            /**
             * @param {Rhythm} rhythm
             */
            constructor(rhythm) {
                this.#rhythm = rhythm
            }

            /**
             * @type {()=>void}
             */
            registerReadyRendererTarget() {
                this.#readyRendererTarget += 1
            }

            /**
             * @type {(renderer:Renderer)=>void}
             */
            registerNecessaryRenderer(renderer) {
                clearRebootFuse()

                this.#view.add(renderer.webContents)
            }

            /**
             * @type {()=>()=>()=>void}
             */
            init() {
                return () => {
                    const rendererReadyHandler = () => {
                        this.#readyRendererCount += 1

                        if (
                            this.#readyRendererCount ===
                            this.#readyRendererTarget
                        ) {
                            this.#rhythm.emit('interface-ready')
                        }
                    }

                    ipcMain.on(
                        'rhythm::interface::notify-ready',
                        rendererReadyHandler,
                    )

                    /**
                     * @type {(
                     * event:Electron.Event,
                     * webContents:Electron.WebContents,
                     * details:Electron.RenderProcessGoneDetails,
                     * )=>void}
                     */
                    const necessaryRendererCrashHandler = (
                        _,
                        webContents,
                        details,
                    ) => {
                        if (this.#view.has(webContents)) {
                            console.error(details)

                            this.#rhythm.emit('necessary-renderer-crash')
                        }
                    }

                    app.on('render-process-gone', necessaryRendererCrashHandler)

                    return () => {
                        app.off(
                            'render-process-gone',
                            necessaryRendererCrashHandler,
                        )

                        ipcMain.off(
                            'rhythm::interface::notify-ready',
                            rendererReadyHandler,
                        )

                        this.#view.clear()

                        // @ts-ignore
                        this.#rhythm = void null
                    }
                }
            }
        }

        return globalThis.isCoreMode ? void null : new Interface(this)
    })()

    #service = (() => {
        /**
         * @extends {EventEmitter<{
         * 'service-device-updated':[],
         * 'service-track-updated':[],
         * 'service-progress-updated':[],
         * 'service-play-state-reset':[],
         * 'service-source-check-required':[],
         * }>}
         */
        const Service = class extends EventEmitter {
            /**
             * @type {Rhythm}
             */
            #rhythm

            /**
             * @type {{
             * deviceManager:import("./service/player.mjs").DeviceManager,
             * player:import("./service/player.mjs").Player,
             * smtc:import("./service/smtc.mjs").SMTC,
             * }}
             */
            #node

            #memory = {
                device: {
                    current: '',
                    list: requestDeviceList('active'),
                },
                track: '',
                progress: 0,
                play: false,
                update: false,
                cleaner: {
                    retry: () => {
                        clearTimeout(NaN)
                    },
                    tick: () => {
                        clearTimeout(NaN)
                    },
                },
            }

            /**
             * @type {Array<{
             * id:string,
             * label:string,
             * }>}
             */
            // eslint-disable-next-line accessor-pairs
            get availableDeviceList() {
                return structuredClone(this.#memory.device.list)
            }

            /**
             * @type {Array<string>}
             */
            // eslint-disable-next-line accessor-pairs
            get availableDeviceIDList() {
                return this.#memory.device.list.map(({ id }) =>
                    id)
            }

            /**
             * @type {string}
             */
            // eslint-disable-next-line accessor-pairs
            get track() {
                return this.#memory.track
            }

            /**
             * @type {number}
             */
            // eslint-disable-next-line accessor-pairs
            get progress() {
                return this.#memory.progress
            }

            /**
             * @type {boolean}
             */
            // eslint-disable-next-line accessor-pairs
            get isPlaying() {
                return this.#memory.play
            }

            /**
             * @param {Rhythm} rhythm
             */
            constructor(rhythm) {
                super()

                this.#rhythm = rhythm

                this.#node = {
                    deviceManager: requestDeviceManager(),
                    player: requestPlayer(),
                    smtc: requestSMTC(),
                }

                this.#node.deviceManager.enable()
            }

            /**
             * @type {()=>void}
             */
            enableSMTC() {
                this.#node.smtc.enable()
            }

            /**
             * @type {()=>void}
             */
            switchToPlay() {
                this.#node.player.switchTo('play')
            }

            /**
             * @type {()=>void}
             */
            switchToPause() {
                this.#node.player.switchTo('pause')
            }

            /**
             * @type {()=>void}
             */
            switchToStop() {
                this.#node.player.switchTo('stop')
            }

            /**
             * @type {()=>()=>Promise<()=>void>}
             */
            init() {
                return async() => {
                    /**
                     * @type {()=>void}
                     */
                    const forceExit = () => {
                        app.setJumpList(null)

                        app.clearRecentDocuments()

                        app.setUserTasks([])

                        app.exit(1)
                    }

                    /**
                     * @type {(uuid:string)=>string}
                     */
                    const getFilePath = uuid => {
                        const [type] = this.#rhythm.#manager.queueSource

                        return join(
                            {
                                flac: this.#rhythm.#setting.libraryPathFLAC,
                                mp3: this.#rhythm.#setting.libraryPathMP3,
                            }[type],
                            this.#rhythm.#library.getDetailedInformationWithUUID(
                                type,
                                uuid,
                            )?.name ?? '',
                        )
                    }

                    /**
                     * @type {()=>void}
                     */
                    const selectModeOrModifyVolume = () => {
                        const uuid = this.#rhythm.#setting.modeCurrent

                        const currentMode =
                            this.#rhythm.#setting.modeCandidate[uuid]

                        if (currentMode) {
                            /**
                             * @type {'default'|{
                             * category:'custom',
                             * id:string,
                             * }}
                             */
                            const mode =
                                uuid === nil
                                    ? 'default'
                                    : {
                                        category: 'custom',
                                        id: currentMode.device,
                                    }

                            const nextDevice =
                                typeof mode === 'object' ? mode.id : mode

                            if (nextDevice !== this.#memory.device.current) {
                                this.#memory.device.current = nextDevice

                                this.#node.player.selectMode(
                                    mode,
                                    currentMode.volume,
                                )
                            } else {
                                this.#node.player.modifyVolume(
                                    currentMode.volume,
                                )
                            }
                        }
                    }

                    /**
                     * @type {(language:'en'|'zh'|'ja')=>string}
                     */
                    const getSMTCDefaultTitle = language =>
                        ({
                            en: 'Unknown Title',
                            zh: '未知标题',
                            ja: '不明なタイトル',
                        })[language]

                    /**
                     * @type {(language:'en'|'zh'|'ja')=>string}
                     */
                    const getSMTCDefaultArtist = language =>
                        ({
                            en: 'Unknown Artist',
                            zh: '未知艺术家',
                            ja: '不明なアーティスト',
                        })[language]

                    this.#node.deviceManager.on('change', () => {
                        this.#memory.device.list = requestDeviceList('active')

                        this.emit('service-device-updated')
                    })

                    this.#node.player.once('device-fatal-exception', forceExit)

                    this.#node.player.on(
                        'device-no-available-default-audio-endpoint',
                        () => {
                            const language = this.#rhythm.#setting.language

                            new Notification({
                                title: {
                                    en: 'No output devices found',
                                    zh: '未找到可用的输出设备',
                                    ja: '出力デバイスが見つかりません',
                                }[language],
                                body: {
                                    en: 'Please connect a valid device, or enable any disabled device.',
                                    zh: '请连接任意有效的设备，或启用任意已禁用的设备。',
                                    ja: '有効なデバイスを接続するか、無効になっているデバイスを有効にしてください。',
                                }[language],
                                silent: true,
                                icon: join(
                                    this.#rhythm.#sourceRootPath,
                                    `asset/image/theme-${
                                        nativeTheme.shouldUseDarkColors
                                            ? 'dark'
                                            : 'light'
                                    }-default-cover.jpg`,
                                ),
                            }).show()
                        },
                    )

                    this.#node.player.on(
                        'device-unavailable-custom-audio-endpoint',
                        () => {
                            const language = this.#rhythm.#setting.language

                            new Notification({
                                title: {
                                    en: 'The specified device is not available',
                                    zh: '指定的设备不可用',
                                    ja: '指定されたデバイスは利用できません',
                                }[language],
                                body: {
                                    en: 'The specified device may have been unplugged or disabled. Please select a different one.',
                                    zh: '指定的设备可能已被拔出或被禁用，请重新选择。',
                                    ja: '指定されたデバイスが抜かれたか、無効になっている可能性があります。再度選択してください。',
                                }[language],
                                silent: true,
                                icon: join(
                                    this.#rhythm.#sourceRootPath,
                                    `asset/image/theme-${
                                        nativeTheme.shouldUseDarkColors
                                            ? 'dark'
                                            : 'light'
                                    }-default-cover.jpg`,
                                ),
                            }).show()
                        },
                    )

                    this.#node.player.on(
                        'device-unsupported-device-format',
                        () => {
                            const language = this.#rhythm.#setting.language

                            new Notification({
                                title: {
                                    en: 'Using unsupported device format',
                                    zh: '正在使用不受支持的设备格式',
                                    ja: 'サポートされていないデバイス形式が使用されています',
                                }[language],
                                body: {
                                    en: "The current device's default format is not supported. Please change the default format or use a different device.",
                                    zh: '无法支持当前设备的默认格式，请修改默认格式或更换设备。',
                                    ja: '現在のデバイスのデフォルト形式をサポートできません。デフォルト形式を変更するか、またはデバイスを交換してください。',
                                }[language],
                                silent: true,
                                icon: join(
                                    this.#rhythm.#sourceRootPath,
                                    `asset/image/theme-${
                                        nativeTheme.shouldUseDarkColors
                                            ? 'dark'
                                            : 'light'
                                    }-default-cover.jpg`,
                                ),
                            }).show()
                        },
                    )

                    this.#node.player.on('source-invalid-file', uuid => {
                        new Notification({
                            title: {
                                en: 'Failed to play file from the specified path',
                                zh: '指定路径的文件播放失败',
                                ja: '指定されたパスからのファイル再生に失敗しました',
                            }[this.#rhythm.#setting.language],
                            body: getFilePath(uuid),
                            silent: true,
                            icon: join(
                                this.#rhythm.#sourceRootPath,
                                `asset/image/theme-${
                                    nativeTheme.shouldUseDarkColors
                                        ? 'dark'
                                        : 'light'
                                }-default-cover.jpg`,
                            ),
                        }).show()

                        if (!this.#memory.update) {
                            this.#memory.update = true

                            this.#rhythm.#library.once(
                                'library-database-updated',
                                () => {
                                    this.#memory.update = false
                                },
                            )

                            this.emit('service-source-check-required')
                        }

                        const timeoutIDOfNextSourceRetry = setTimeout(() => {
                            this.#rhythm.#manager.requestQueueNextTarget()
                        }, one.second)

                        this.#memory.cleaner.retry = () => {
                            clearTimeout(timeoutIDOfNextSourceRetry)
                        }
                    })

                    this.#node.player.on('source-incorrect-file', uuid => {
                        new Notification({
                            title: {
                                en: 'The file being played is corrupted',
                                zh: '播放的文件存在错误',
                                ja: '再生中のファイルにエラーが発生しました',
                            }[this.#rhythm.#setting.language],
                            body: getFilePath(uuid),
                            silent: true,
                            icon: join(
                                this.#rhythm.#sourceRootPath,
                                `asset/image/theme-${
                                    nativeTheme.shouldUseDarkColors
                                        ? 'dark'
                                        : 'light'
                                }-default-cover.jpg`,
                            ),
                        }).show()

                        this.#rhythm.#manager.requestQueueNextTarget()
                    })

                    this.#node.player.on('track', uuid => {
                        this.#memory.track = uuid

                        this.emit('service-track-updated')
                    })

                    this.#node.player.on('progress', second => {
                        this.#memory.progress = second

                        !second && this.emit('service-progress-updated')
                    })

                    this.#node.player.on('state', isPlaying => {
                        this.#node.smtc.playbackState = isPlaying
                            ? 'playing'
                            : 'paused'

                        this.#memory.play = isPlaying

                        this.#memory.cleaner.tick()

                        this.emit('service-progress-updated')

                        if (isPlaying) {
                            /**
                             * @type {()=>void}
                             */
                            const progressTickHandler = () => {
                                this.emit('service-progress-updated')

                                const timeoutIDOfProgressTick = setTimeout(
                                    progressTickHandler,
                                    one.second,
                                )

                                this.#memory.cleaner.tick = () => {
                                    clearTimeout(timeoutIDOfProgressTick)
                                }
                            }

                            const timeoutIDOfProgressTick = setTimeout(
                                progressTickHandler,
                                one.second,
                            )

                            this.#memory.cleaner.tick = () => {
                                clearTimeout(timeoutIDOfProgressTick)
                            }
                        }

                        this.emit('service-play-state-reset')
                    })

                    this.#node.player.on('finish', () => {
                        this.#rhythm.#manager.requestQueueNextTarget()
                    })

                    this.#node.smtc.on('previous-track', () => {
                        this.#rhythm.#manager.requestQueuePreviousTarget()
                    })

                    this.#node.smtc.on('play', () => {
                        this.switchToPlay()
                    })

                    this.#node.smtc.on('pause', () => {
                        this.switchToPause()
                    })

                    this.#node.smtc.on('next-track', () => {
                        this.#rhythm.#manager.requestQueueNextTarget()
                    })

                    this.#rhythm.#setting.on(
                        'setting-mode-candidate-updated',
                        selectModeOrModifyVolume,
                    )

                    this.#rhythm.#setting.on(
                        'setting-mode-current-changed',
                        selectModeOrModifyVolume,
                    )

                    this.#rhythm.#manager.on('manager-queue-at-changed', () => {
                        const language = this.#rhythm.#setting.language

                        const [type] = this.#rhythm.#manager.queueSource

                        const [uuid, progress] = this.#rhythm.#manager.queueAt

                        if (uuid !== this.#memory.track) {
                            const { name, title, artist, cover } =
                                this.#rhythm.#library.getDetailedInformationWithUUID(
                                    type,
                                    uuid,
                                ) ?? {
                                    name: '',
                                    title: '',
                                    artist: '',
                                    cover: '',
                                }

                            const path = name
                                ? join(
                                    {
                                        flac: this.#rhythm.#setting
                                            .libraryPathFLAC,
                                        mp3: this.#rhythm.#setting
                                            .libraryPathMP3,
                                    }[type],
                                    name,
                                )
                                : ''

                            const thumbnail = cover
                                ? join(
                                    this.#rhythm.#cacheCoverRootPath,
                                    type,
                                    cover,
                                )
                                : ''

                            this.#node.player.selectFile(path, uuid)

                            this.#node.smtc.metadata = {
                                title: title || getSMTCDefaultTitle(language),
                                artist:
                                    artist || getSMTCDefaultArtist(language),
                                thumbnail,
                            }
                        }

                        uuid !== nil &&
                            this.#node.player.seekTo(Math.floor(progress))
                    })

                    /**
                     * @type {()=>void}
                     */
                    const nativeThemeUpdatedHandler = () => {
                        const language = this.#rhythm.#setting.language

                        const [type] = this.#rhythm.#manager.queueSource

                        const [uuid] = this.#rhythm.#manager.queueAt

                        const { title, artist, cover } =
                            this.#rhythm.#library.getDetailedInformationWithUUID(
                                type,
                                uuid,
                            ) ?? {
                                title: '',
                                artist: '',
                                cover: '',
                            }

                        const thumbnail = cover
                            ? join(
                                this.#rhythm.#cacheCoverRootPath,
                                type,
                                cover,
                            )
                            : ''

                        this.#node.smtc.metadata = {
                            title: title || getSMTCDefaultTitle(language),
                            artist: artist || getSMTCDefaultArtist(language),
                            thumbnail,
                        }
                    }

                    nativeTheme.on('updated', nativeThemeUpdatedHandler)

                    if (
                        typeof this.#node.player.initializationIsSuccessful !==
                        'undefined'
                    ) {
                        if (!this.#node.player.initializationIsSuccessful) {
                            forceExit()
                        }
                    } else {
                        try {
                            await new Promise(
                                /**
                                 * @type {(resolve:(value:void)=>void,reject:(reason?:any)=>void)=>void}
                                 */
                                (resolve, reject) => {
                                    this.#node.player.once(
                                        'initialization',
                                        isSuccessful => {
                                            if (isSuccessful) {
                                                resolve()
                                            } else {
                                                reject()
                                            }
                                        },
                                    )
                                },
                            )
                        } catch (_) {
                            forceExit()
                        }
                    }

                    return () => {
                        nativeTheme.off('updated', nativeThemeUpdatedHandler)

                        this.#memory.cleaner.tick()

                        this.#memory.cleaner.retry()

                        this.#node.smtc.close()

                        this.#node.player.close()

                        this.#node.deviceManager.close()

                        // @ts-ignore
                        this.#rhythm = void null
                    }
                }
            }
        }

        return new Service(this)
    })()

    #setting = (() => {
        /**
         * @extends {EventEmitter<{
         * 'setting-language-changed':[],
         * 'setting-tray-reset':[],
         * 'setting-library-path-updated':[data:{
         * type:import("./library/index.mjs").Format,
         * }],
         * 'setting-mode-candidate-updated':[],
         * 'setting-mode-current-changed':[],
         * 'setting-rule-artist-updated':[data:{
         * type:'split'|'identify',
         * }],
         * 'setting-remote-reset':[],
         * 'setting-queue-order-mode-changed':[],
         * 'setting-queue-order-loop-changed':[],
         * 'panel-visibility-changed':[data:{
         * type:'show'|'hide',
         * }],
         * }>}
         */
        const Setting = class extends EventEmitter {
            /**
             * @type {Rhythm}
             */
            #rhythm

            /**
             * @type {Config}
             */
            #storage

            /**
             * @type {undefined|Renderer}
             */
            #renderer

            #dialog = false

            /**
             * @type {'en'|'zh'|'ja'}
             */
            // eslint-disable-next-line accessor-pairs
            get language() {
                const language =
                    /**
                     * @type {'en'|'zh'|'ja'}
                     */
                    // eslint-disable-next-line no-extra-parens
                    (this.#storage.select('general.language'))

                return language ?? getDefaultLanguage()
            }

            /**
             * @type {boolean}
             */
            // eslint-disable-next-line accessor-pairs
            get tray() {
                const tray =
                    /**
                     * @type {boolean}
                     */
                    // eslint-disable-next-line no-extra-parens
                    (this.#storage.select('general.tray'))

                return tray ?? false
            }

            /**
             * @type {string}
             */
            // eslint-disable-next-line accessor-pairs
            get libraryPathFLAC() {
                const libraryPathFLAC =
                    /**
                     * @type {string}
                     */
                    // eslint-disable-next-line no-extra-parens
                    (this.#storage.select('library.path.flac'))

                return libraryPathFLAC ?? ''
            }

            /**
             * @type {string}
             */
            // eslint-disable-next-line accessor-pairs
            get libraryPathMP3() {
                const libraryPathMP3 =
                    /**
                     * @type {string}
                     */
                    // eslint-disable-next-line no-extra-parens
                    (this.#storage.select('library.path.mp3'))

                return libraryPathMP3 ?? ''
            }

            /**
             * @type {{[uuid:string]:{
             * label:string,
             * device:string,
             * volume:number,
             * }}}
             */
            // eslint-disable-next-line accessor-pairs
            get modeCandidate() {
                const modeCandidate =
                    /**
                     * @type {{[uuid:string]:{
                     * label:string,
                     * device:string,
                     * volume:number,
                     * }}}
                     */
                    // eslint-disable-next-line no-extra-parens
                    (this.#storage.select('mode.candidate'))

                return modeCandidate ?? {}
            }

            /**
             * @type {string}
             */
            // eslint-disable-next-line accessor-pairs
            get modeCurrent() {
                const modeCurrent =
                    /**
                     * @type {string}
                     */
                    // eslint-disable-next-line no-extra-parens
                    (this.#storage.select('mode.current'))

                return modeCurrent ?? ''
            }

            /**
             * @type {{
             * split:false|string,
             * identify:false|{[uuid:string]:{
             * group:string,
             * member:Array<string>,
             * }},
             * }}
             */
            // eslint-disable-next-line accessor-pairs
            get ruleArtist() {
                const split =
                    /**
                     * @type {false|string}
                     */
                    // eslint-disable-next-line no-extra-parens
                    (this.#storage.select('other.rule.artist.split'))

                const identify =
                    /**
                     * @type {false|{[uuid:string]:{
                     * group:string,
                     * member:Array<string>,
                     * }}}
                     */
                    // eslint-disable-next-line no-extra-parens
                    (this.#storage.select('other.rule.artist.identify'))

                return {
                    split: split ?? false,
                    identify: identify ?? false,
                }
            }

            /**
             * @type {boolean}
             */
            // eslint-disable-next-line accessor-pairs
            get remote() {
                const remote =
                    /**
                     * @type {boolean}
                     */
                    // eslint-disable-next-line no-extra-parens
                    (this.#storage.select('other.remote'))

                return remote ?? false
            }

            /**
             * @type {'sequential'|'shuffle'|'random'}
             */
            // eslint-disable-next-line accessor-pairs
            get queueOrderMode() {
                const queueOrderMode =
                    /**
                     * @type {'sequential'|'shuffle'|'random'}
                     */
                    // eslint-disable-next-line no-extra-parens
                    (this.#storage.select('queue.order.mode'))

                return queueOrderMode ?? 'sequential'
            }

            /**
             * @type {'all'|'single'|'off'}
             */
            // eslint-disable-next-line accessor-pairs
            get queueOrderLoop() {
                const queueOrderLoop =
                    /**
                     * @type {'all'|'single'|'off'}
                     */
                    // eslint-disable-next-line no-extra-parens
                    (this.#storage.select('queue.order.loop'))

                return queueOrderLoop ?? 'all'
            }

            /**
             * @param {Rhythm} rhythm
             */
            constructor(rhythm) {
                super()

                this.#rhythm = rhythm

                this.#storage = new Config(
                    this.#rhythm.#dataRootPath,
                    'preference',
                )

                if (globalThis.isCoreMode) {
                    this.#renderer = void null
                } else {
                    this.#rhythm.#interface?.registerReadyRendererTarget()

                    const iconPath = join(
                        this.#rhythm.#sourceRootPath,
                        `asset/image/theme-${nativeTheme.shouldUseDarkColors ? 'dark' : 'light'}-window-icon.png`,
                    )

                    const preloadPath = join(
                        this.#rhythm.#sourceRootPath,
                        'preload/setting.mjs',
                    )

                    const titleBarOverlayColorScheme =
                        titleBarOverlayColorSchemeMap[
                            nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
                        ]

                    this.#renderer = new Renderer(
                        'Rhythm::Setting',
                        null,
                        'manually-call',
                        {
                            ...Renderer.getOptions(
                                iconPath,
                                preloadPath,
                                {
                                    color: titleBarOverlayColorScheme.color[
                                        this.#dialog ? 'smoke' : 'normal'
                                    ],
                                    symbolColor:
                                        titleBarOverlayColorScheme.symbolColor
                                            .blur,
                                    height: titleBarOverlayHeight,
                                },
                                {
                                    browserWindowOptions: {
                                        minWidth: 768,
                                        minHeight: 402,
                                        backgroundColor:
                                            titleBarOverlayColorScheme.color[
                                                this.#dialog
                                                    ? 'smoke'
                                                    : 'normal'
                                            ],
                                    },
                                    webPreferencesOptions: {
                                        additionalArguments: [
                                            '--source-identifier=setting',
                                        ],
                                    },
                                },
                            ),
                        },
                    )

                    this.#rhythm.#interface?.registerNecessaryRenderer(
                        this.#renderer,
                    )
                }
            }

            /**
             * @type {(language:unknown,forceUpdateIsRequested?:true)=>void}
             */
            #setLanguage(language, forceUpdateIsRequested) {
                const oldLanguage = this.language

                const newLanguage = filterValidLanguage(language)

                if (forceUpdateIsRequested || newLanguage !== oldLanguage) {
                    this.#storage.update('general.language', newLanguage)

                    this.emit('setting-language-changed')
                }
            }

            /**
             * @type {(tray:unknown,forceUpdateIsRequested?:true)=>void}
             */
            #setTray(tray, forceUpdateIsRequested) {
                const oldTray = this.tray

                const newTray = filterValidTray(tray)

                if (forceUpdateIsRequested || newTray !== oldTray) {
                    this.#storage.update('general.tray', newTray)

                    this.emit('setting-tray-reset')
                }
            }

            /**
             * @type {(libraryPathFLAC:unknown,forceUpdateIsRequested?:true)=>void}
             */
            #setLibraryPathFLAC(libraryPathFLAC, forceUpdateIsRequested) {
                const oldLibraryPathFLAC = this.libraryPathFLAC

                const newLibraryPathFLAC =
                    filterValidLibraryPathFLAC(libraryPathFLAC)

                if (
                    forceUpdateIsRequested ||
                    newLibraryPathFLAC !== oldLibraryPathFLAC
                ) {
                    this.#storage.update(
                        'library.path.flac',
                        newLibraryPathFLAC,
                    )

                    this.emit('setting-library-path-updated', { type: 'flac' })
                }
            }

            /**
             * @type {(libraryPathMP3:unknown,forceUpdateIsRequested?:true)=>void}
             */
            #setLibraryPathMP3(libraryPathMP3, forceUpdateIsRequested) {
                const oldLibraryPathMP3 = this.libraryPathMP3

                const newLibraryPathMP3 =
                    filterValidLibraryPathMP3(libraryPathMP3)

                if (
                    forceUpdateIsRequested ||
                    newLibraryPathMP3 !== oldLibraryPathMP3
                ) {
                    this.#storage.update('library.path.mp3', newLibraryPathMP3)

                    this.emit('setting-library-path-updated', { type: 'mp3' })
                }
            }

            /**
             * @type {(modeCandidate:unknown,forceUpdateIsRequested?:true)=>void}
             */
            #setModeCandidate(modeCandidate, forceUpdateIsRequested) {
                const oldModeCandidate = this.modeCandidate

                const newModeCandidate = filterValidModeCandidate(modeCandidate)

                if (
                    forceUpdateIsRequested ||
                    (() => {
                        const newModeCandidateEntries = Object.entries(
                            newModeCandidate,
                        ).map(
                            ([uuid, { label, device, volume }]) =>
                                `${uuid}::${label}::${device}::${volume}`,
                        )

                        const oldModeCandidateEntries = Object.entries(
                            oldModeCandidate,
                        ).map(
                            ([uuid, { label, device, volume }]) =>
                                `${uuid}::${label}::${device}::${volume}`,
                        )

                        return (
                            newModeCandidateEntries.length !==
                                oldModeCandidateEntries.length ||
                            (() => {
                                const sortedOldModeCandidateEntries =
                                    oldModeCandidateEntries.toSorted()

                                return newModeCandidateEntries
                                    .toSorted()
                                    .some(
                                        (entry, index) =>
                                            entry !==
                                            sortedOldModeCandidateEntries[index],
                                    )
                            })()
                        )
                    })()
                ) {
                    this.#storage.update('mode.candidate', newModeCandidate)

                    this.emit('setting-mode-candidate-updated')
                }
            }

            /**
             * @type {(modeCurrent:unknown,forceUpdateIsRequested?:true)=>void}
             */
            #setModeCurrent(modeCurrent, forceUpdateIsRequested) {
                const oldModeCurrent = this.modeCurrent

                const newModeCurrent = filterValidModeCurrent(
                    modeCurrent,
                    this.modeCandidate,
                    this.#rhythm.#service.availableDeviceIDList,
                )

                if (
                    forceUpdateIsRequested ||
                    newModeCurrent !== oldModeCurrent
                ) {
                    this.#storage.update('mode.current', newModeCurrent)

                    this.emit('setting-mode-current-changed')
                }
            }

            /**
             * @type {(ruleArtistSplit:unknown,forceUpdateIsRequested?:true)=>void}
             */
            #setRuleArtistSplit(ruleArtistSplit, forceUpdateIsRequested) {
                const oldRuleArtistSplit = this.ruleArtist.split

                const newRuleArtistSplit =
                    filterValidRuleArtistSplit(ruleArtistSplit)

                if (
                    forceUpdateIsRequested ||
                    newRuleArtistSplit !== oldRuleArtistSplit
                ) {
                    this.#storage.update(
                        'other.rule.artist.split',
                        newRuleArtistSplit,
                    )

                    this.emit('setting-rule-artist-updated', { type: 'split' })
                }
            }

            /**
             * @type {(ruleArtistIdentify:unknown,forceUpdateIsRequested?:true)=>void}
             */
            #setRuleArtistIdentify(ruleArtistIdentify, forceUpdateIsRequested) {
                const oldRuleArtistIdentify = this.ruleArtist.identify

                const newRuleArtistIdentify =
                    filterValidRuleArtistIdentify(ruleArtistIdentify)

                if (
                    forceUpdateIsRequested ||
                    (() => {
                        const newRuleArtistIdentifyEntries = Object.entries(
                            newRuleArtistIdentify || {
                                nil: {
                                    group: String(false),
                                    member: [String(false)],
                                },
                            },
                        ).map(
                            ([uuid, { group, member }]) =>
                                `${uuid}::${group}::${member.toSorted().join('::')}`,
                        )

                        const oldRuleArtistIdentifyEntries = Object.entries(
                            oldRuleArtistIdentify || {
                                nil: {
                                    group: String(false),
                                    member: [String(false)],
                                },
                            },
                        ).map(
                            ([uuid, { group, member }]) =>
                                `${uuid}::${group}::${member.toSorted().join('::')}`,
                        )

                        return (
                            newRuleArtistIdentifyEntries.length !==
                                oldRuleArtistIdentifyEntries.length ||
                            (() => {
                                const sortedOldRuleArtistIdentifyEntries =
                                    oldRuleArtistIdentifyEntries.toSorted()

                                return newRuleArtistIdentifyEntries
                                    .toSorted()
                                    .some(
                                        (entry, index) =>
                                            entry !==
                                            sortedOldRuleArtistIdentifyEntries[
                                                index
                                            ],
                                    )
                            })()
                        )
                    })()
                ) {
                    this.#storage.update(
                        'other.rule.artist.identify',
                        newRuleArtistIdentify,
                    )

                    this.emit('setting-rule-artist-updated', {
                        type: 'identify',
                    })
                }
            }

            /**
             * @type {(remote:unknown,forceUpdateIsRequested?:true)=>void}
             */
            #setRemote(remote, forceUpdateIsRequested) {
                const oldRemote = this.remote

                const newRemote = filterValidRemote(remote)

                if (forceUpdateIsRequested || newRemote !== oldRemote) {
                    this.#storage.update('other.remote', newRemote)

                    this.emit('setting-remote-reset')
                }
            }

            /**
             * @type {(queueOrderMode:unknown,forceUpdateIsRequested?:true)=>void}
             */
            #setQueueOrderMode(queueOrderMode, forceUpdateIsRequested) {
                const oldQueueOrderMode = this.queueOrderMode

                const newQueueOrderMode =
                    filterValidQueueOrderMode(queueOrderMode)

                if (
                    forceUpdateIsRequested ||
                    newQueueOrderMode !== oldQueueOrderMode
                ) {
                    this.#storage.update('queue.order.mode', newQueueOrderMode)

                    this.emit('setting-queue-order-mode-changed')
                }
            }

            /**
             * @type {(queueOrderLoop:unknown,forceUpdateIsRequested?:true)=>void}
             */
            #setQueueOrderLoop(queueOrderLoop, forceUpdateIsRequested) {
                const oldQueueOrderLoop = this.queueOrderLoop

                const queueOrderMode = this.queueOrderMode

                const newQueueOrderLoop = filterValidQueueOrderLoop(
                    queueOrderLoop,
                    queueOrderMode,
                )

                if (
                    forceUpdateIsRequested ||
                    newQueueOrderLoop !== oldQueueOrderLoop
                ) {
                    this.#storage.update('queue.order.loop', newQueueOrderLoop)

                    this.emit('setting-queue-order-loop-changed')
                }
            }

            /**
             * @type {(volume:number)=>void}
             */
            updateCurrentModeVolume(volume) {
                const newVolume =
                    volume < 0
                        ? 0
                        : volume > 1
                            ? 1
                            : new Decimal(volume).toDecimalPlaces(2)
                                .toNumber()

                const newModeCandidate = this.modeCandidate

                const currentMode = newModeCandidate[this.modeCurrent]
                if (currentMode) {
                    currentMode.volume = newVolume

                    this.#setModeCandidate(newModeCandidate)
                }
            }

            /**
             * @type {(uuid:string)=>void}
             */
            changeCurrentMode(uuid) {
                this.#setModeCurrent(uuid)
            }

            /**
             * @type {(mode:'sequential'|'shuffle'|'random')=>void}
             */
            changeQueueOrderMode(mode) {
                this.#setQueueOrderMode(mode)
            }

            /**
             * @type {(loop:'all'|'single'|'off')=>void}
             */
            changeQueueOrderLoop(loop) {
                this.#setQueueOrderLoop(loop)
            }

            /**
             * @type {(page?:'library'|'mode'|'other'|'about')=>void}
             */
            requestShowPanel(page) {
                page &&
                    this.#renderer?.webContents.send(
                        'rhythm::setting::pre-push-page-stack',
                        page,
                    )

                this.#renderer?.show()
            }

            /**
             * @type {()=>()=>()=>void}
             */
            init() {
                return () => {
                    this.#setLanguage(this.language, true)

                    this.#setTray(this.tray, true)

                    this.#setLibraryPathFLAC(this.libraryPathFLAC, true)

                    this.#setLibraryPathMP3(this.libraryPathMP3, true)

                    this.#setModeCandidate(this.modeCandidate, true)

                    this.#setModeCurrent(this.modeCurrent, true)

                    const {
                        split: ruleArtistSplit,
                        identify: ruleArtistIdentify,
                    } = this.ruleArtist

                    this.#setRuleArtistSplit(ruleArtistSplit, true)

                    this.#setRuleArtistIdentify(ruleArtistIdentify, true)

                    this.#setRemote(this.remote, true)

                    this.#setQueueOrderMode(this.queueOrderMode, true)

                    this.#setQueueOrderLoop(this.queueOrderLoop, true)

                    this.#rhythm.#service.on('service-device-updated', () => {
                        this.#setModeCurrent(this.modeCurrent)
                    })

                    this.on('setting-mode-candidate-updated', () => {
                        this.#setModeCurrent(this.modeCurrent)
                    })

                    this.on('setting-queue-order-mode-changed', () => {
                        this.#setQueueOrderLoop(this.queueOrderLoop)
                    })

                    /**
                     * @type {undefined|(()=>void)}
                     */
                    let clearForRenderer = void null

                    if (this.#renderer) {
                        this.on('setting-tray-reset', () => {
                            this.#renderer?.webContents.send(
                                'rhythm::setting::update-setting-storage',
                                ['general.tray', this.tray],
                            )
                        })

                        this.on('setting-library-path-updated', ({ type }) => {
                            switch (type) {
                                case 'flac':
                                    this.#renderer?.webContents.send(
                                        'rhythm::setting::update-setting-storage',
                                        [
                                            'library.path.flac',
                                            this.libraryPathFLAC,
                                        ],
                                    )

                                    break
                                case 'mp3':
                                    this.#renderer?.webContents.send(
                                        'rhythm::setting::update-setting-storage',
                                        [
                                            'library.path.mp3',
                                            this.libraryPathMP3,
                                        ],
                                    )

                                    break
                                default:
                            }
                        })

                        this.on('setting-mode-candidate-updated', () => {
                            this.#renderer?.webContents.send(
                                'rhythm::setting::update-setting-storage',
                                ['mode.candidate', this.modeCandidate],
                            )
                        })

                        this.on('setting-rule-artist-updated', ({ type }) => {
                            switch (type) {
                                case 'split':
                                    this.#renderer?.webContents.send(
                                        'rhythm::setting::update-setting-storage',
                                        [
                                            'other.rule.artist.split',
                                            this.ruleArtist.split,
                                        ],
                                    )

                                    break
                                case 'identify':
                                    this.#renderer?.webContents.send(
                                        'rhythm::setting::update-setting-storage',
                                        [
                                            'other.rule.artist.identify',
                                            this.ruleArtist.identify,
                                        ],
                                    )

                                    break
                                default:
                            }
                        })

                        this.#renderer.on('show', () => {
                            this.emit('panel-visibility-changed', {
                                type: 'show',
                            })
                        })

                        this.#renderer.on('focus', () => {
                            this.#renderer?.webContents.send(
                                'rhythm::setting::focus-window',
                            )

                            const titleBarOverlayColorScheme =
                                titleBarOverlayColorSchemeMap[
                                    nativeTheme.shouldUseDarkColors
                                        ? 'dark'
                                        : 'light'
                                ]

                            this.#renderer?.setTitleBarOverlay({
                                color: titleBarOverlayColorScheme.color[
                                    this.#dialog ? 'smoke' : 'normal'
                                ],
                                symbolColor:
                                    titleBarOverlayColorScheme.symbolColor
                                        .focus,
                                height: titleBarOverlayHeight,
                            })
                        })

                        this.#renderer.on('blur', () => {
                            this.#renderer?.webContents.send(
                                'rhythm::setting::blur-window',
                            )

                            const titleBarOverlayColorScheme =
                                titleBarOverlayColorSchemeMap[
                                    nativeTheme.shouldUseDarkColors
                                        ? 'dark'
                                        : 'light'
                                ]

                            this.#renderer?.setTitleBarOverlay({
                                color: titleBarOverlayColorScheme.color[
                                    this.#dialog ? 'smoke' : 'normal'
                                ],
                                symbolColor:
                                    titleBarOverlayColorScheme.symbolColor.blur,
                                height: titleBarOverlayHeight,
                            })
                        })

                        this.#renderer.on('hide', () => {
                            this.#renderer?.webContents.send(
                                'rhythm::setting::pre-clear-page-stack',
                            )

                            this.emit('panel-visibility-changed', {
                                type: 'hide',
                            })
                        })

                        this.#renderer.on('close', event => {
                            event.preventDefault()

                            this.#renderer?.hide()
                        })

                        /**
                         * @type {()=>void}
                         */
                        const nativeThemeUpdatedHandler = () => {
                            this.#renderer?.setIcon(
                                nativeImage.createFromPath(
                                    join(
                                        this.#rhythm.#sourceRootPath,
                                        `asset/image/theme-${nativeTheme.shouldUseDarkColors ? 'dark' : 'light'}-window-icon.png`,
                                    ),
                                ),
                            )

                            const titleBarOverlayColorScheme =
                                titleBarOverlayColorSchemeMap[
                                    nativeTheme.shouldUseDarkColors
                                        ? 'dark'
                                        : 'light'
                                ]

                            this.#renderer?.setTitleBarOverlay({
                                color: titleBarOverlayColorScheme.color[
                                    this.#dialog ? 'smoke' : 'normal'
                                ],
                                symbolColor:
                                    titleBarOverlayColorScheme.symbolColor[
                                        this.#renderer.isFocused()
                                            ? 'focus'
                                            : 'blur'
                                    ],
                                height: titleBarOverlayHeight,
                            })

                            this.#renderer?.setBackgroundColor(
                                titleBarOverlayColorScheme.color[
                                    this.#dialog ? 'smoke' : 'normal'
                                ],
                            )
                        }

                        nativeTheme.on('updated', nativeThemeUpdatedHandler)

                        /**
                         * @type {(event:Electron.IpcMainEvent,isVisible:boolean)=>void}
                         */
                        const switchDialogVisibilityHandler = (
                            _,
                            isVisible,
                        ) => {
                            this.#dialog = isVisible

                            const titleBarOverlayColorScheme =
                                titleBarOverlayColorSchemeMap[
                                    nativeTheme.shouldUseDarkColors
                                        ? 'dark'
                                        : 'light'
                                ]

                            this.#renderer?.setTitleBarOverlay({
                                color: titleBarOverlayColorScheme.color[
                                    this.#dialog ? 'smoke' : 'normal'
                                ],
                                symbolColor:
                                    titleBarOverlayColorScheme.symbolColor[
                                        this.#renderer.isFocused()
                                            ? 'focus'
                                            : 'blur'
                                    ],
                                height: titleBarOverlayHeight,
                            })

                            this.#renderer?.setBackgroundColor(
                                titleBarOverlayColorScheme.color[
                                    this.#dialog ? 'smoke' : 'normal'
                                ],
                            )
                        }

                        ipcMain.on(
                            'rhythm::setting::switch-dialog-visibility',
                            switchDialogVisibilityHandler,
                        )

                        /**
                         * @type {(event:Electron.IpcMainInvokeEvent)=>'en'|'zh'|'ja'}
                         */
                        const getLanguageHandler = () =>
                            this.language

                        ipcMain.handle(
                            'rhythm::setting::get-language',
                            getLanguageHandler,
                        )

                        /**
                         * @type {(event:Electron.IpcMainInvokeEvent)=>import("../renderer/setting/index").SettingStorage}
                         */
                        const getSettingStorageHandler = () => {
                            const {
                                split: ruleArtistSplit,
                                identify: ruleArtistIdentify,
                            } = this.ruleArtist

                            return {
                                'general.language': this.language,
                                'general.tray': this.tray,
                                'library.path.flac': this.libraryPathFLAC,
                                'library.path.mp3': this.libraryPathMP3,
                                'mode.candidate': this.modeCandidate,
                                'other.rule.artist.split': ruleArtistSplit,
                                'other.rule.artist.identify':
                                    ruleArtistIdentify,
                                'other.remote': this.remote,
                            }
                        }

                        ipcMain.handle(
                            'rhythm::setting::get-setting-storage',
                            getSettingStorageHandler,
                        )

                        /**
                         * @type {(
                         * event:Electron.IpcMainEvent,
                         * key:keyof import("../renderer/setting/index").SettingStorage,
                         * value:unknown,
                         * )=>void}
                         */
                        const setSettingStorageHandler = (_, key, value) => {
                            switch (key) {
                                case 'general.language':
                                    this.#setLanguage(value)

                                    setRebootFuse()

                                    this.#rhythm.emit('exit')

                                    break
                                case 'general.tray':
                                    this.#setTray(value)

                                    break
                                case 'library.path.flac':
                                    this.#setLibraryPathFLAC(value)

                                    break
                                case 'library.path.mp3':
                                    this.#setLibraryPathMP3(value)

                                    break
                                case 'mode.candidate':
                                    this.#setModeCandidate(value)

                                    break
                                case 'other.rule.artist.split':
                                    this.#setRuleArtistSplit(value)

                                    break
                                case 'other.rule.artist.identify':
                                    this.#setRuleArtistIdentify(value)

                                    break
                                case 'other.remote':
                                    this.#setRemote(value)

                                    setRebootFuse()

                                    this.#rhythm.emit('exit')

                                    break
                                default:
                            }
                        }

                        ipcMain.on(
                            'rhythm::setting::set-setting-storage',
                            setSettingStorageHandler,
                        )

                        /**
                         * @type {(event:Electron.IpcMainInvokeEvent,title:string,confirmLabel?:string)=>Promise<false|string>}
                         */
                        const selectDirectoryPathHandler = async(
                            _,
                            title,
                            confirmLabel,
                        ) => {
                            if (this.#renderer) {
                                const { canceled, filePaths } =
                                    await dialog.showOpenDialog(
                                        this.#renderer,
                                        {
                                            title,
                                            defaultPath:
                                                process.env.USERPROFILE,
                                            buttonLabel: confirmLabel,
                                            properties: [
                                                'openDirectory',
                                                'dontAddToRecent',
                                            ],
                                        },
                                    )

                                return canceled
                                    ? false
                                    : filePaths[0] ?? false
                            }

                            return false
                        }

                        ipcMain.handle(
                            'rhythm::setting::select-directory-path',
                            selectDirectoryPathHandler,
                        )

                        /**
                         * @type {(
                         * event:Electron.IpcMainEvent,
                         * clientX:number,
                         * clientY:number,
                         * textIsSelected:boolean,
                         * )=>void}
                         */
                        const popupInputContextMenuHandler = (
                            _,
                            clientX,
                            clientY,
                            textIsSelected,
                        ) => {
                            this.#renderer &&
                                popupInputContextMenu(
                                    textIsSelected,
                                    this.language,
                                    this.#renderer,
                                    clientX,
                                    clientY,
                                )
                        }

                        ipcMain.on(
                            'rhythm::setting::popup-input-context-menu',
                            popupInputContextMenuHandler,
                        )

                        /**
                         * @type {(event:Electron.IpcMainInvokeEvent)=>Array<{
                         * id:string,
                         * label:string,
                         * }>}
                         */
                        const getKnownDeviceListHandler = () =>
                            requestDeviceList('all')

                        ipcMain.handle(
                            'rhythm::setting::get-known-device-list',
                            getKnownDeviceListHandler,
                        )

                        /**
                         * @type {(event:Electron.IpcMainEvent)=>void}
                         */
                        const viewInFileExplorerHandler = () => {
                            shell.showItemInFolder(this.#rhythm.#dataRootPath)
                        }

                        ipcMain.on(
                            'rhythm::setting::view-in-file-explorer',
                            viewInFileExplorerHandler,
                        )

                        /**
                         * @type {(event:Electron.IpcMainEvent,protocolURL:string)=>Promise<void>}
                         */
                        const openURLWithProtocolHandler = async(
                            _,
                            protocolURL,
                        ) => {
                            await shell.openExternal(protocolURL)
                        }

                        ipcMain.on(
                            'rhythm::setting::open-url-with-protocol',
                            openURLWithProtocolHandler,
                        )

                        /**
                         * @type {(event:Electron.IpcMainEvent,content:string)=>void}
                         */
                        const requestShowContentHandler = (_, content) => {
                            this.#rhythm.#content?.requestShowContent(content)
                        }

                        ipcMain.on(
                            'rhythm::setting::request-show-content',
                            requestShowContentHandler,
                        )

                        /**
                         * @type {()=>void}
                         */
                        const cancelShowContentHandler = () => {
                            this.#rhythm.#content?.cancelShowContent()
                        }

                        ipcMain.on(
                            'rhythm::setting::cancel-show-content',
                            cancelShowContentHandler,
                        )

                        this.#renderer.loadPage(
                            join(this.#rhythm.#sourceRootPath, 'setting.html'),
                        )

                        clearForRenderer = () => {
                            if (this.#renderer) {
                                this.#renderer.destroy()

                                ipcMain.off(
                                    'rhythm::setting::cancel-show-content',
                                    cancelShowContentHandler,
                                )

                                ipcMain.off(
                                    'rhythm::setting::request-show-content',
                                    requestShowContentHandler,
                                )

                                ipcMain.off(
                                    'rhythm::setting::open-url-with-protocol',
                                    openURLWithProtocolHandler,
                                )

                                ipcMain.off(
                                    'rhythm::setting::view-in-file-explorer',
                                    viewInFileExplorerHandler,
                                )

                                ipcMain.removeHandler(
                                    'rhythm::setting::get-known-device-list',
                                )

                                ipcMain.off(
                                    'rhythm::setting::popup-input-context-menu',
                                    popupInputContextMenuHandler,
                                )

                                ipcMain.removeHandler(
                                    'rhythm::setting::select-directory-path',
                                )

                                ipcMain.off(
                                    'rhythm::setting::set-setting-storage',
                                    setSettingStorageHandler,
                                )

                                ipcMain.removeHandler(
                                    'rhythm::setting::get-setting-storage',
                                )

                                ipcMain.removeHandler(
                                    'rhythm::setting::get-language',
                                )

                                ipcMain.off(
                                    'rhythm::setting::switch-dialog-visibility',
                                    switchDialogVisibilityHandler,
                                )

                                nativeTheme.off(
                                    'updated',
                                    nativeThemeUpdatedHandler,
                                )
                            }
                        }
                    }

                    /**
                     * @type {()=>void}
                     */
                    const secondInstanceHandler = () => {
                        const language = this.language

                        setImmediate(() => {
                            new Notification({
                                title: {
                                    en: 'Application already running',
                                    zh: '应用已启动',
                                    ja: 'アプリは起動しています',
                                }[language],
                                body: {
                                    en: 'Find the running application on the system taskbar or in the tray.',
                                    zh: '在系统任务栏或托盘中可以找到正在运行的应用。',
                                    ja: 'システムタスクバーまたはトレイで、実行中のアプリを探してください。',
                                }[language],
                                silent: true,
                                icon: join(
                                    this.#rhythm.#sourceRootPath,
                                    `asset/image/theme-${
                                        nativeTheme.shouldUseDarkColors
                                            ? 'dark'
                                            : 'light'
                                    }-default-cover.jpg`,
                                ),
                            }).show()
                        })
                    }

                    app.on('second-instance', secondInstanceHandler)

                    return () => {
                        app.off('second-instance', secondInstanceHandler)

                        clearForRenderer && clearForRenderer()

                        this.#storage.update('_generated', true)

                        this.#storage.close()

                        // @ts-ignore
                        this.#rhythm = void null
                    }
                }
            }
        }

        return new Setting(this)
    })()

    #library = (() => {
        /**
         * @extends {EventEmitter<{
         * 'library-database-updated':[data:{
         * type?:import("./library/index.mjs").Format,
         * }],
         * 'library-group-updated':[data:{
         * type?:import("./library/index.mjs").Format,
         * }],
         * 'library-group-artist-updated':[],
         * }>}
         */
        const Library = class extends EventEmitter {
            /**
             * @type {Rhythm}
             */
            #rhythm

            /**
             * @type {string}
             */
            #storageFilePath

            /**
             * @type {import("better-sqlite3").Database}
             */
            #storage

            #memory = {
                /**
                 * @type {{[type in import("./library/index.mjs").Format]:{
                 * album:Array<string>,
                 * artist:{[artist:string]:Array<string>},
                 * }}}
                 */
                group: {
                    flac: {
                        album: [],
                        artist: {},
                    },
                    mp3: {
                        album: [],
                        artist: {},
                    },
                },
            }

            /**
             * @type {{[type in import("./library/index.mjs").Format]:{[by in 'album'|'artist']:Array<string>}}}
             */
            // eslint-disable-next-line accessor-pairs
            get group() {
                return structuredClone({
                    flac: {
                        album: this.#memory.group.flac.album,
                        artist: Object.keys(this.#memory.group.flac.artist),
                    },
                    mp3: {
                        album: this.#memory.group.mp3.album,
                        artist: Object.keys(this.#memory.group.mp3.artist),
                    },
                })
            }

            /**
             * @param {Rhythm} rhythm
             */
            constructor(rhythm) {
                super()

                this.#rhythm = rhythm

                this.#storageFilePath = join(
                    this.#rhythm.#dataRootPath,
                    'library.db',
                )

                const betterSqlite3NativeBinding = join(
                    this.#rhythm.#sourceRootPath,
                    '../module/better-sqlite3.node',
                )

                try {
                    new BetterSqlite3(this.#storageFilePath, {
                        nativeBinding: betterSqlite3NativeBinding,
                    }).close()

                    this.#storage = new BetterSqlite3(
                        readFileSync(this.#storageFilePath),
                        { nativeBinding: betterSqlite3NativeBinding },
                    )

                    this.#storage.exec(
                        'DROP INDEX IF EXISTS index_file_type_test;',
                    )
                } catch (error) {
                    console.error(error)

                    this.#storage = new BetterSqlite3(':memory:', {
                        nativeBinding: betterSqlite3NativeBinding,
                    })
                }
            }

            /**
             * @type {(type?:import("./library/index.mjs").Format)=>Promise<void>}
             */
            async #updateDatabase(type) {
                const language = this.#rhythm.#setting.language

                const entryNotification = new Notification({
                    title: {
                        en: 'Library status change',
                        zh: '库状态变更',
                        ja: 'ライブラリ状態変更',
                    }[language],
                    body: {
                        en: 'Starting scan of tracks in library.',
                        zh: '开始扫描库中曲目。',
                        ja: 'ライブラリの曲をスキャン開始。',
                    }[language],
                    silent: true,
                    icon: join(
                        this.#rhythm.#sourceRootPath,
                        `asset/image/theme-${
                            nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
                        }-default-cover.jpg`,
                    ),
                })

                entryNotification.show()

                /**
                 * @type {Array<import("./library/index.mjs").Format>}
                 */
                const formatList = type ? [type] : ['flac', 'mp3']

                /**
                 * @type {{
                 * create:number,
                 * update:number,
                 * delete:number,
                 * }}
                 */
                const result = {
                    create: 0,
                    update: 0,
                    delete: 0,
                }

                setMetadataParserWorkerPool()

                await Promise.allSettled(
                    formatList.map(
                        async format =>
                            await updateDatabaseByType(
                                format,
                                {
                                    flac: this.#rhythm.#setting.libraryPathFLAC,
                                    mp3: this.#rhythm.#setting.libraryPathMP3,
                                }[format],
                                this.#storage,
                                this.#rhythm.#cacheCoverRootPath,
                                result,
                            ),
                    ),
                )

                clearMetadataParserWorkerPool()

                this.emit('library-database-updated', { type })

                entryNotification.close()

                new Notification({
                    title: {
                        en: 'Library status change',
                        zh: '库状态变更',
                        ja: 'ライブラリ状態変更',
                    }[language],
                    body: {
                        en: `Library tracks scan complete: added ${result.create} item${result.create > 1 ? 's' : ''}, updated ${result.update} item${result.update > 1 ? 's' : ''}, removed ${result.delete} item${result.delete > 1 ? 's' : ''}.`,
                        zh: `库中曲目扫描完毕：新增 ${result.create} 项，更新 ${result.update} 项，移除 ${result.delete} 项。`,
                        ja: `ライブラリ スキャン完了：追加 ${result.create} 件、更新 ${result.update} 件、削除 ${result.delete} 件。`,
                    }[language],
                    silent: true,
                    icon: join(
                        this.#rhythm.#sourceRootPath,
                        `asset/image/theme-${
                            nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
                        }-default-cover.jpg`,
                    ),
                }).show()
            }

            /**
             * @type {(cause:'setting-rule-artist-updated'|{
             * event:'library-database-updated',
             * type?:import("./library/index.mjs").Format,
             * })=>void}
             */
            #updateGroup(cause) {
                const type =
                    cause === 'setting-rule-artist-updated'
                        ? void null
                        : cause.type

                /**
                 * @type {Array<import("./library/index.mjs").Format>}
                 */
                const formatList = type ? [type] : ['flac', 'mp3']

                /**
                 * @type {()=>void}
                 */
                const updateAlbumGroup = () => {
                    for (const format of formatList) {
                        this.#memory.group[format].album =
                            /**
                             * @type {Array<{
                             * album:string,
                             * }>}
                             */
                            // eslint-disable-next-line no-extra-parens
                            (
                                this.#storage
                                    .prepare(
                                        `SELECT DISTINCT album
FROM ${format}
WHERE album <> ''
ORDER BY album`,
                                    )
                                    .all()
                            ).map(({ album }) =>
                                album)
                    }
                }

                /**
                 * @type {()=>void}
                 */
                const updateArtistGroup = () => {
                    for (const format of formatList) {
                        const artistRecordList =
                            /**
                             * @type {Array<{
                             * artist:string,
                             * }>}
                             */
                            // eslint-disable-next-line no-extra-parens
                            (
                                this.#storage
                                    .prepare(
                                        `SELECT DISTINCT artist
FROM ${format}
WHERE artist <> ''
ORDER BY artist`,
                                    )
                                    .all()
                            ).map(({ artist }) =>
                                artist)

                        const {
                            split: ruleArtistSplit,
                            identify: ruleArtistIdentify,
                        } = this.#rhythm.#setting.ruleArtist
                        if (ruleArtistSplit || ruleArtistIdentify) {
                            this.#memory.group[format].artist =
                                buildArtistGroupUnderRule(
                                    artistRecordList,
                                    ruleArtistSplit,
                                    ruleArtistIdentify,
                                )
                        } else {
                            this.#memory.group[format].artist =
                                Object.fromEntries(
                                    artistRecordList.map(artist =>
                                        [
                                            artist,
                                            [artist],
                                        ]),
                                )
                        }
                    }
                }

                if (cause === 'setting-rule-artist-updated') {
                    updateArtistGroup()

                    this.emit('library-group-artist-updated')

                    const language = this.#rhythm.#setting.language

                    new Notification({
                        title: {
                            en: 'Library status change',
                            zh: '库状态变更',
                            ja: 'ライブラリ状態変更',
                        }[language],
                        body: {
                            en: 'Artist group items updated.',
                            zh: '艺术家分组条目已更新。',
                            ja: 'アーティスト グループ更新。',
                        }[language],
                        silent: true,
                        icon: join(
                            this.#rhythm.#sourceRootPath,
                            `asset/image/theme-${
                                nativeTheme.shouldUseDarkColors
                                    ? 'dark'
                                    : 'light'
                            }-default-cover.jpg`,
                        ),
                    }).show()
                } else {
                    updateAlbumGroup()

                    updateArtistGroup()

                    this.emit('library-group-updated', { type: cause.type })
                }
            }

            /**
             * @type {()=>Promise<void>}
             */
            async refreshDatabase() {
                await this.#updateDatabase()
            }

            /**
             * @type {(type:import("./library/index.mjs").Format,group:'all'|{
             * by:'album'|'artist',
             * name:string,
             * })=>Array<{
             * type:import("./library/index.mjs").Format,
             * uuid:string,
             * size:number,
             * modified:number,
             * title:string,
             * artist:string,
             * album:string,
             * length:number,
             * bit:number,
             * depth?:number,
             * sample:number,
             * cover:string,
             * }>}
             */
            getBasicInformationListUnderGroup(type, group) {
                const basicInformationList =
                    /**
                     * @type {Array<{
                     * type:import("./library/index.mjs").Format,
                     * uuid:string,
                     * size:number,
                     * modified:number,
                     * title:string,
                     * artist:string,
                     * album:string,
                     * length:number,
                     * bit:number,
                     * depth?:number,
                     * sample:number,
                     * cover:string,
                     * }>}
                     */
                    // eslint-disable-next-line no-extra-parens
                    (
                        this.#storage
                            .prepare(
                                `SELECT
'${type}' AS type,
uuid,
size,
modified,
title,
artist,
album,
length,
bit,${
                        type === 'flac'
                            ? `
depth,`
                            : ''
                        }
sample,
cover
FROM ${type}${
                            group === 'all'
                                ? ''
                                : group.by === 'album'
                                    ? `
WHERE album = ?`
                                    : group.by === 'artist'
                                        ? `
WHERE artist IN (SELECT value FROM json_each(?))`
                                        : ''
                        }
ORDER BY artist, album,${
                        type === 'flac'
                            ? " CAST(SUBSTR(record, 1, INSTR(record, '/') - 1) AS INTEGER), CAST(SUBSTR(track, 1, INSTR(track, '/') - 1) AS INTEGER),"
                            : ''
                        } title`,
                            )
                            .all(
                                ...group === 'all'
                                    ? []
                                    : group.by === 'album'
                                        ? [group.name]
                                        : group.by === 'artist'
                                            ? [
                                                JSON.stringify(
                                                    this.#memory.group[type]
                                                        .artist[group.name] ?? [
                                                        group.name,
                                                    ],
                                                ),
                                            ]
                                            : [],
                            )
                    )

                return basicInformationList
            }

            /**
             * @type {<TYPE extends import("./library/index.mjs").Format>(type:TYPE,uuid:string)=>undefined|{
             * flac:{
             * uuid:string,
             * name:string,
             * size:number,
             * modified:number,
             * title:string,
             * artist:string,
             * album:string,
             * length:number,
             * bit:number,
             * depth:number,
             * sample:number,
             * cover:string,
             * record:string,
             * track:string,
             * year:string,
             * genre:string,
             * artists:string,
             * composer:string,
             * lyricist:string,
             * copyright:string,
             * isrc:string,
             * },
             * mp3:{
             * uuid:string,
             * name:string,
             * size:number,
             * modified:number,
             * title:string,
             * artist:string,
             * album:string,
             * length:number,
             * bit:number,
             * sample:number,
             * cover:string,
             * },
             * }[TYPE]}
             */
            getDetailedInformationWithUUID(type, uuid) {
                const detailedInformation =
                    /**
                     * @type {undefined|{
                     * flac:{
                     * uuid:string,
                     * name:string,
                     * size:number,
                     * modified:number,
                     * title:string,
                     * artist:string,
                     * album:string,
                     * length:number,
                     * bit:number,
                     * depth:number,
                     * sample:number,
                     * cover:string,
                     * record:string,
                     * track:string,
                     * year:string,
                     * genre:string,
                     * artists:string,
                     * composer:string,
                     * lyricist:string,
                     * copyright:string,
                     * isrc:string,
                     * },
                     * mp3:{
                     * uuid:string,
                     * name:string,
                     * size:number,
                     * modified:number,
                     * title:string,
                     * artist:string,
                     * album:string,
                     * length:number,
                     * bit:number,
                     * sample:number,
                     * cover:string,
                     * },
                     * }[typeof type]}
                     */
                    // eslint-disable-next-line no-extra-parens
                    (
                        this.#storage
                            .prepare(
                                `SELECT *
FROM ${type}
WHERE uuid = ?`,
                            )
                            .get(uuid)
                    )

                return detailedInformation
            }

            /**
             * @type {()=>()=>Promise<()=>Promise<void>>}
             */
            init() {
                return async() => {
                    maintainValidTable(this.#storage)

                    await this.#updateDatabase()

                    this.#updateGroup({ event: 'library-database-updated' })

                    this.#rhythm.#setting.on(
                        'setting-rule-artist-updated',
                        () => {
                            this.#updateGroup('setting-rule-artist-updated')
                        },
                    )

                    this.on('library-database-updated', ({ type }) => {
                        this.#updateGroup({
                            event: 'library-database-updated',
                            type,
                        })
                    })

                    this.#rhythm.#service.on(
                        'service-source-check-required',
                        async() => {
                            await this.#updateDatabase()
                        },
                    )

                    this.#rhythm.#setting.on(
                        'setting-library-path-updated',
                        async({ type }) => {
                            await this.#updateDatabase(type)
                        },
                    )

                    return async() => {
                        rmSync(this.#storageFilePath, {
                            force: true,
                            recursive: true,
                        })

                        try {
                            await this.#storage.backup(this.#storageFilePath)
                        } catch (error) {
                            console.error(error)
                        }

                        this.#storage.close()

                        // @ts-ignore
                        this.#rhythm = void null
                    }
                }
            }
        }

        return new Library(this)
    })()

    #manager = (() => {
        /**
         * @extends {EventEmitter<{
         * 'manager-queue-source-changed':[],
         * 'manager-queue-at-changed':[],
         * }>}
         */
        const Manager = class extends EventEmitter {
            /**
             * @type {Rhythm}
             */
            #rhythm

            /**
             * @type {Config}
             */
            #storage

            #memory = {
                queue: {
                    /**
                     * @type {[import("./library/index.mjs").Format,'all'|{
                     * by:'album'|'artist',
                     * name:string,
                     * }]}
                     */
                    source: ['flac', 'all'],
                    /**
                     * @type {[string,number]}
                     */
                    at: [nil, 0],
                    /**
                     * @type {Array<string>}
                     */
                    candidate: [],
                },
            }

            /**
             * @type {[import("./library/index.mjs").Format,'all'|{
             * by:'album'|'artist',
             * name:string,
             * }]}
             */
            // eslint-disable-next-line accessor-pairs
            get queueSource() {
                return structuredClone(this.#memory.queue.source)
            }

            /**
             * @type {[string,number]}
             */
            // eslint-disable-next-line accessor-pairs
            get queueAt() {
                return structuredClone(this.#memory.queue.at)
            }

            /**
             * @type {[number,number]}
             */
            // eslint-disable-next-line accessor-pairs
            get queueCursor() {
                const candidate = this.#memory.queue.candidate

                return [
                    candidate.indexOf(this.queueAt[0]) + 1,
                    candidate.length,
                ]
            }

            /**
             * @param {Rhythm} rhythm
             */
            constructor(rhythm) {
                super()

                this.#rhythm = rhythm

                this.#storage = new Config(this.#rhythm.#dataRootPath, 'state')
            }

            /**
             * @type {(
             * type:unknown,
             * group:unknown,
             * forceUpdateIsRequested?:true,
             * )=>void}
             */
            #setQueueSource(type, group, forceUpdateIsRequested) {
                const oldQueueSource = this.queueSource

                /**
                 * @type {Array<import("./library/index.mjs").Format>}
                 */
                const availableTypeList = []

                if (this.#rhythm.#setting.libraryPathFLAC) {
                    availableTypeList.push('flac')
                }

                if (this.#rhythm.#setting.libraryPathMP3) {
                    availableTypeList.push('mp3')
                }

                const newQueueSource = filterValidQueueSource(
                    type,
                    group,
                    availableTypeList,
                    this.#rhythm.#library.group,
                )

                if (
                    forceUpdateIsRequested ||
                    `${newQueueSource[0]}::${
                        newQueueSource[1] === 'all'
                            ? 'all'
                            : `${newQueueSource[1].by}::${newQueueSource[1].name}`
                    }` !==
                        `${oldQueueSource[0]}::${
                            oldQueueSource[1] === 'all'
                                ? 'all'
                                : `${oldQueueSource[1].by}::${oldQueueSource[1].name}`
                        }`
                ) {
                    this.#memory.queue.source = newQueueSource

                    this.emit('manager-queue-source-changed')
                }
            }

            /**
             * @type {(
             * uuid:unknown,
             * progress:unknown,
             * forceUpdateIsRequested?:true,
             * )=>void}
             */
            #setQueueAt(uuid, progress, forceUpdateIsRequested) {
                const oldQueueAt = this.queueAt

                const [type, group] = this.queueSource

                const availableUUIDList = this.#rhythm.#library
                    .getBasicInformationListUnderGroup(type, group)
                    .map(({ uuid }) =>
                        uuid)

                const newQueueAt = filterValidQueueAt(
                    uuid,
                    progress,
                    availableUUIDList,
                    this.#rhythm.#setting.queueOrderMode,
                    /**
                     * @type {(uuid:string)=>undefined|number}
                     */
                    uuid =>
                        this.#rhythm.#library.getDetailedInformationWithUUID(
                            type,
                            uuid,
                        )?.length,
                )

                if (
                    forceUpdateIsRequested ||
                    `${newQueueAt[0]}::${newQueueAt[1]}` !==
                        `${oldQueueAt[0]}::${oldQueueAt[1]}`
                ) {
                    this.#memory.queue.at = newQueueAt

                    this.emit('manager-queue-at-changed')
                }
            }

            /**
             * @type {(standbyShuffledQueue:unknown)=>void}
             */
            #reshapeQueueCandidate(standbyShuffledQueue) {
                const sequentialQueueCandidate = this.#rhythm.#library
                    .getBasicInformationListUnderGroup(...this.queueSource)
                    .map(({ uuid }) =>
                        uuid)

                switch (this.#rhythm.#setting.queueOrderMode) {
                    case 'sequential':
                    case 'random':
                        this.#memory.queue.candidate = sequentialQueueCandidate

                        break
                    case 'shuffle':
                        this.#memory.queue.candidate =
                            reshapeQueueCandidateInShuffleOrderMode(
                                standbyShuffledQueue,
                                sequentialQueueCandidate,
                                this.queueAt[0],
                            )

                        break
                    default:
                }
            }

            /**
             * @type {()=>void}
             */
            #loadFromStorage() {
                this.#setQueueSource(
                    this.#storage.select('queue.type'),
                    this.#storage.select('queue.group'),
                    true,
                )

                this.#setQueueAt(
                    this.#storage.select('queue.uuid'),
                    this.#storage.select('queue.progress'),
                    true,
                )

                this.#reshapeQueueCandidate(
                    this.#storage.select('queue.candidate'),
                )
            }

            /**
             * @type {()=>void}
             */
            #saveToStorage() {
                const [type, group] = this.queueSource

                this.#storage.update('queue.type', type)

                this.#storage.update('queue.group', group)

                const [uuid] = this.queueAt

                this.#storage.update('queue.uuid', uuid)

                this.#storage.update(
                    'queue.progress',
                    this.#rhythm.#service.progress,
                )

                this.#storage.update(
                    'queue.candidate',
                    this.#memory.queue.candidate,
                )

                this.#storage.update('_generated', true)
            }

            /**
             * @type {(type:import("./library/index.mjs").Format,group:'all'|{
             * by:'album'|'artist',
             * name:string,
             * },uuid:string)=>void}
             */
            changeQueueSourceTarget(type, group, uuid) {
                this.#setQueueSource(type, group)

                this.#setQueueAt(uuid, 0, true)

                this.#reshapeQueueCandidate(void null)
            }

            /**
             * @type {(progress:number)=>void}
             */
            changeQueueTargetProgress(progress) {
                this.#setQueueAt(this.queueAt[0], progress, true)
            }

            /**
             * @type {()=>void}
             */
            requestQueuePreviousTarget() {
                const [uuid] = this.queueAt

                if (uuid === nil) {
                    return
                }

                const candidate = this.#memory.queue.candidate

                const indexOfQueueCursor = candidate.indexOf(uuid)

                if (indexOfQueueCursor < 0) {
                    this.changeQueueSourceTarget(...this.queueSource, uuid)

                    this.requestQueuePreviousTarget()

                    return
                }

                const queueOrderLoop = this.#rhythm.#setting.queueOrderLoop

                if (queueOrderLoop === 'single') {
                    this.changeQueueTargetProgress(0)

                    return
                }

                trySwitchToPreviousQueueTarget(
                    this.#rhythm.#setting.queueOrderMode,
                    queueOrderLoop,
                    indexOfQueueCursor,
                    /**
                     * @type {(uuid:unknown)=>void}
                     */
                    uuid => {
                        this.#setQueueAt(uuid, 0, true)
                    },
                    candidate,
                    this.#rhythm.#setting.language,
                    this.#rhythm.#sourceRootPath,
                )
            }

            /**
             * @type {()=>void}
             */
            requestQueueNextTarget() {
                const [uuid] = this.queueAt

                if (uuid === nil) {
                    return
                }

                const candidate = this.#memory.queue.candidate

                const indexOfQueueCursor = candidate.indexOf(uuid)

                if (indexOfQueueCursor < 0) {
                    this.changeQueueSourceTarget(...this.queueSource, uuid)

                    this.requestQueueNextTarget()

                    return
                }

                const queueOrderLoop = this.#rhythm.#setting.queueOrderLoop

                if (queueOrderLoop === 'single') {
                    this.changeQueueTargetProgress(0)

                    return
                }

                trySwitchToNextQueueTarget(
                    this.#rhythm.#setting.queueOrderMode,
                    queueOrderLoop,
                    /**
                     * @type {(uuid:unknown)=>void}
                     */
                    uuid => {
                        this.#setQueueAt(uuid, 0, true)
                    },
                    candidate,
                    indexOfQueueCursor,
                    () => {
                        this.#rhythm.#service.switchToPause()
                    },
                    /**
                     * @type {(standbyShuffledQueue:unknown)=>Array<string>}
                     */
                    standbyShuffledQueue => {
                        this.#reshapeQueueCandidate(standbyShuffledQueue)

                        return this.#memory.queue.candidate
                    },
                )
            }

            /**
             * @type {()=>()=>()=>void}
             */
            init() {
                return () => {
                    this.#loadFromStorage()

                    const intervalIDOfStateAutoSave = setInterval(() => {
                        this.#saveToStorage()
                    }, one.minute)

                    this.#rhythm.#setting.on(
                        'setting-queue-order-mode-changed',
                        () => {
                            this.#reshapeQueueCandidate(
                                this.#memory.queue.candidate,
                            )
                        },
                    )

                    this.#rhythm.#library.on(
                        'library-group-updated',
                        ({ type }) => {
                            const [currentType, group] = this.queueSource

                            /**
                             * @type {Array<import("./library/index.mjs").Format>}
                             */
                            const availableTypeList = []

                            if (this.#rhythm.#setting.libraryPathFLAC) {
                                availableTypeList.push('flac')
                            }

                            if (this.#rhythm.#setting.libraryPathMP3) {
                                availableTypeList.push('mp3')
                            }

                            if (
                                !availableTypeList.includes(currentType) ||
                                (type ?? currentType) === currentType
                            ) {
                                this.#setQueueSource(currentType, group, true)

                                this.#reshapeQueueCandidate(
                                    this.#memory.queue.candidate,
                                )
                            }
                        },
                    )

                    this.#rhythm.#library.on(
                        'library-group-artist-updated',
                        () => {
                            const [type, group] = this.queueSource

                            if (group !== 'all' && group.by === 'artist') {
                                this.#setQueueSource(type, group, true)

                                this.#reshapeQueueCandidate(
                                    this.#memory.queue.candidate,
                                )
                            }
                        },
                    )

                    this.on('manager-queue-source-changed', () => {
                        this.#setQueueAt(...this.queueAt)
                    })

                    return () => {
                        clearInterval(intervalIDOfStateAutoSave)

                        this.#saveToStorage()

                        this.#storage.close()

                        // @ts-ignore
                        this.#rhythm = void null
                    }
                }
            }
        }

        return new Manager(this)
    })()

    #main = (() => {
        const Main = class {
            /**
             * @type {Rhythm}
             */
            #rhythm

            /**
             * @type {undefined|Tray}
             */
            #tray = void null

            /**
             * @type {Renderer}
             */
            #renderer

            /**
             * @param {Rhythm} rhythm
             */
            constructor(rhythm) {
                this.#rhythm = rhythm

                this.#rhythm.#interface?.registerReadyRendererTarget()

                const iconPath = join(
                    this.#rhythm.#sourceRootPath,
                    `asset/image/theme-${nativeTheme.shouldUseDarkColors ? 'dark' : 'light'}-window-icon.png`,
                )

                const preloadPath = join(
                    this.#rhythm.#sourceRootPath,
                    'preload/main.mjs',
                )

                const titleBarOverlayColorScheme =
                    titleBarOverlayColorSchemeMap[
                        nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
                    ]

                this.#renderer = new Renderer(
                    'Rhythm::Main',
                    null,
                    'manually-call',
                    {
                        ...Renderer.getOptions(
                            iconPath,
                            preloadPath,
                            {
                                color: titleBarOverlayColorScheme.color.normal,
                                symbolColor:
                                    titleBarOverlayColorScheme.symbolColor.blur,
                                height: titleBarOverlayHeight,
                            },
                            {
                                browserWindowOptions: {
                                    minWidth: 768,
                                    minHeight: 402,
                                    backgroundColor:
                                        titleBarOverlayColorScheme.color.normal,
                                },
                                webPreferencesOptions: {
                                    additionalArguments: [
                                        '--source-identifier=main',
                                    ],
                                },
                            },
                        ),
                    },
                )

                this.#rhythm.#interface?.registerNecessaryRenderer(
                    this.#renderer,
                )

                this.#rhythm.once('interface-ready', () => {
                    this.#renderer.show()

                    this.#rhythm.#service.enableSMTC()

                    if (this.#rhythm.#setting.remote) {
                        this.#rhythm.#rmtc.enableServer()
                    }

                    process.argv.includes('--autoplay') &&
                        this.#rhythm.#service.switchToPlay()
                })
            }

            /**
             * @type {()=>void}
             */
            #updateThumbarButtons() {
                this.#renderer.setThumbarButtons(
                    getThumbarButtons(
                        this.#rhythm.#sourceRootPath,
                        () => {
                            this.#rhythm.#manager.requestQueuePreviousTarget()
                        },
                        () => {
                            this.#rhythm.#service.switchToPlay()
                        },
                        () => {
                            this.#rhythm.#service.switchToPause()
                        },
                        () => {
                            this.#rhythm.#manager.requestQueueNextTarget()
                        },
                        this.#rhythm.#setting.language,
                        this.#rhythm.#service.isPlaying,
                    ),
                )
            }

            /**
             * @type {()=>()=>()=>void}
             */
            init() {
                return () => {
                    this.#rhythm.#service.on('service-progress-updated', () => {
                        this.#renderer.webContents.send(
                            'rhythm::main::update-progress',
                            this.#rhythm.#service.progress,
                        )
                    })

                    this.#rhythm.#service.on('service-play-state-reset', () => {
                        this.#renderer.webContents.send(
                            'rhythm::main::reset-play-state',
                            this.#rhythm.#service.isPlaying,
                        )

                        this.#updateThumbarButtons()
                    })

                    this.#rhythm.#setting.on(
                        'setting-library-path-updated',
                        () => {
                            this.#renderer.webContents.send(
                                'rhythm::main::update-library-path-state',
                                {
                                    flac: {
                                        isFilled: Boolean(
                                            this.#rhythm.#setting
                                                .libraryPathFLAC,
                                        ),
                                    },
                                    mp3: {
                                        isFilled: Boolean(
                                            this.#rhythm.#setting.libraryPathMP3,
                                        ),
                                    },
                                },
                            )
                        },
                    )

                    /**
                     * @type {()=>void}
                     */
                    const updateCurrentModeVolumeHandler = () => {
                        this.#renderer.webContents.send(
                            'rhythm::main::update-current-mode-volume',
                            Math.floor(
                                Decimal.mul(
                                    this.#rhythm.#setting.modeCandidate[
                                        this.#rhythm.#setting.modeCurrent
                                    ]?.volume ?? 1,
                                    100,
                                ).toNumber(),
                            ),
                        )
                    }

                    this.#rhythm.#setting.on(
                        'setting-mode-candidate-updated',
                        updateCurrentModeVolumeHandler,
                    )

                    this.#rhythm.#setting.on(
                        'setting-mode-current-changed',
                        updateCurrentModeVolumeHandler,
                    )

                    this.#rhythm.#setting.on(
                        'setting-queue-order-mode-changed',
                        () => {
                            this.#renderer.webContents.send(
                                'rhythm::main::change-queue-order-mode',
                                this.#rhythm.#setting.queueOrderMode,
                            )
                        },
                    )

                    this.#rhythm.#setting.on(
                        'setting-queue-order-loop-changed',
                        () => {
                            this.#renderer.webContents.send(
                                'rhythm::main::change-queue-order-loop',
                                this.#rhythm.#setting.queueOrderLoop,
                            )
                        },
                    )

                    this.#rhythm.#setting.on(
                        'panel-visibility-changed',
                        ({ type }) => {
                            this.#tray?.destroy()

                            switch (type) {
                                case 'show':
                                    this.#renderer.hide()

                                    break
                                case 'hide':
                                    this.#renderer.show()

                                    break
                                default:
                            }
                        },
                    )

                    this.#rhythm.#library.on('library-database-updated', () => {
                        this.#renderer.webContents.send(
                            'rhythm::main::update-library-database',
                        )
                    })

                    this.#rhythm.#library.on('library-group-updated', () => {
                        this.#renderer.webContents.send(
                            'rhythm::main::update-library-group',
                            this.#rhythm.#library.group,
                        )
                    })

                    this.#rhythm.#library.on(
                        'library-group-artist-updated',
                        () => {
                            this.#renderer.webContents.send(
                                'rhythm::main::update-library-group',
                                this.#rhythm.#library.group,
                            )
                        },
                    )

                    this.#rhythm.#manager.on(
                        'manager-queue-source-changed',
                        () => {
                            this.#renderer.webContents.send(
                                'rhythm::main::update-queue-source',
                                this.#rhythm.#manager.queueSource,
                            )
                        },
                    )

                    this.#rhythm.#manager.on('manager-queue-at-changed', () => {
                        this.#renderer.webContents.send(
                            'rhythm::main::change-queue-at',
                            this.#rhythm.#manager.queueAt,
                        )
                    })

                    this.#renderer.on('show', () => {
                        this.#updateThumbarButtons()
                    })

                    this.#renderer.on('focus', () => {
                        this.#renderer.webContents.send(
                            'rhythm::main::focus-window',
                        )

                        const titleBarOverlayColorScheme =
                            titleBarOverlayColorSchemeMap[
                                nativeTheme.shouldUseDarkColors
                                    ? 'dark'
                                    : 'light'
                            ]

                        this.#renderer.setTitleBarOverlay({
                            color: titleBarOverlayColorScheme.color.normal,
                            symbolColor:
                                titleBarOverlayColorScheme.symbolColor.focus,
                            height: titleBarOverlayHeight,
                        })
                    })

                    this.#renderer.on('blur', () => {
                        this.#renderer.webContents.send(
                            'rhythm::main::blur-window',
                        )

                        const titleBarOverlayColorScheme =
                            titleBarOverlayColorSchemeMap[
                                nativeTheme.shouldUseDarkColors
                                    ? 'dark'
                                    : 'light'
                            ]

                        this.#renderer.setTitleBarOverlay({
                            color: titleBarOverlayColorScheme.color.normal,
                            symbolColor:
                                titleBarOverlayColorScheme.symbolColor.blur,
                            height: titleBarOverlayHeight,
                        })
                    })

                    this.#renderer.on('minimize', () => {
                        this.#rhythm.#setting.tray &&
                            setTimeout(() => {
                                this.#renderer.setOpacity(0)

                                this.#renderer.restore()

                                this.#renderer.hide()

                                this.#renderer.setOpacity(1)

                                this.#tray = new Tray(
                                    nativeImage.createFromPath(
                                        join(
                                            this.#rhythm.#sourceRootPath,
                                            `asset/image/theme-${nativeTheme.shouldUseDarkColors ? 'dark' : 'light'}-tray-icon.png`,
                                        ),
                                    ),
                                )

                                this.#tray.setToolTip(
                                    {
                                        en: 'Rhythm - Show panel',
                                        zh: '聆声 - 显示面板',
                                        ja: 'リズム - パネルを表示',
                                    }[this.#rhythm.#setting.language],
                                )

                                this.#tray.setContextMenu(
                                    Menu.buildFromTemplate([
                                        {
                                            label: {
                                                en: 'Quit Rhythm',
                                                zh: '退出聆声',
                                                ja: 'リズムを終了',
                                            }[this.#rhythm.#setting.language],
                                            click: () => {
                                                this.#rhythm.emit('exit')
                                            },
                                        },
                                    ]),
                                )

                                this.#tray.on('click', () => {
                                    this.#tray?.destroy()

                                    this.#tray = void null

                                    this.#renderer.show()
                                })
                            }, 100)
                    })

                    this.#renderer.on('close', event => {
                        event.preventDefault()

                        this.#renderer.hide()

                        this.#rhythm.emit('exit')
                    })

                    /**
                     * @type {()=>void}
                     */
                    const nativeThemeUpdatedHandler = () => {
                        this.#tray?.setImage(
                            nativeImage.createFromPath(
                                join(
                                    this.#rhythm.#sourceRootPath,
                                    `asset/image/theme-${nativeTheme.shouldUseDarkColors ? 'dark' : 'light'}-tray-icon.png`,
                                ),
                            ),
                        )

                        this.#renderer.setIcon(
                            nativeImage.createFromPath(
                                join(
                                    this.#rhythm.#sourceRootPath,
                                    `asset/image/theme-${nativeTheme.shouldUseDarkColors ? 'dark' : 'light'}-window-icon.png`,
                                ),
                            ),
                        )

                        const titleBarOverlayColorScheme =
                            titleBarOverlayColorSchemeMap[
                                nativeTheme.shouldUseDarkColors
                                    ? 'dark'
                                    : 'light'
                            ]

                        this.#renderer.setTitleBarOverlay({
                            color: titleBarOverlayColorScheme.color.normal,
                            symbolColor:
                                titleBarOverlayColorScheme.symbolColor[
                                    this.#renderer.isFocused()
                                        ? 'focus'
                                        : 'blur'
                                ],
                            height: titleBarOverlayHeight,
                        })

                        this.#renderer.setBackgroundColor(
                            titleBarOverlayColorScheme.color.normal,
                        )

                        this.#updateThumbarButtons()
                    }

                    nativeTheme.on('updated', nativeThemeUpdatedHandler)

                    /**
                     * @type {(event:Electron.IpcMainEvent)=>void}
                     */
                    const rebootInCoreModeHandler = () => {
                        writeFileSync(
                            join(this.#rhythm.#dataRootPath ?? '', 'cast_off'),
                            '',
                        )

                        this.#rhythm.emit('exit', {
                            hardRebootIsRequired: {
                                playAfterRebootIsRequired:
                                    this.#rhythm.#service.isPlaying,
                            },
                        })
                    }

                    ipcMain.on(
                        'rhythm::main::reboot-in-core-mode',
                        rebootInCoreModeHandler,
                    )

                    /**
                     * @type {(event:Electron.IpcMainInvokeEvent)=>string}
                     */
                    const getCoverRootPathHandler = () =>
                        this.#rhythm.#cacheCoverRootPath

                    ipcMain.handle(
                        'rhythm::main::get-cover-root-path',
                        getCoverRootPathHandler,
                    )

                    /**
                     * @type {(event:Electron.IpcMainInvokeEvent)=>'en'|'zh'|'ja'}
                     */
                    const getLanguageHandler = () =>
                        this.#rhythm.#setting.language

                    ipcMain.handle(
                        'rhythm::main::get-language',
                        getLanguageHandler,
                    )

                    /**
                     * @type {(event:Electron.IpcMainInvokeEvent)=>{[type in import("./library/index.mjs").Format]:{
                     * isFilled:boolean,
                     * }}}
                     */
                    const getLibraryPathStateHandler = () =>
                        ({
                            flac: {
                                isFilled: Boolean(
                                    this.#rhythm.#setting.libraryPathFLAC,
                                ),
                            },
                            mp3: {
                                isFilled: Boolean(
                                    this.#rhythm.#setting.libraryPathMP3,
                                ),
                            },
                        })

                    ipcMain.handle(
                        'rhythm::main::get-library-path-state',
                        getLibraryPathStateHandler,
                    )

                    /**
                     * @type {(event:Electron.IpcMainInvokeEvent)=>number}
                     */
                    const getCurrentModeVolumeHandler = () =>
                        Math.floor(
                            Decimal.mul(
                                this.#rhythm.#setting.modeCandidate[
                                    this.#rhythm.#setting.modeCurrent
                                ]?.volume ?? 1,
                                100,
                            ).toNumber(),
                        )

                    ipcMain.handle(
                        'rhythm::main::get-current-mode-volume',
                        getCurrentModeVolumeHandler,
                    )

                    /**
                     * @type {(event:Electron.IpcMainEvent,volume:number)=>void}
                     */
                    const setCurrentModeVolumeHandler = (_, volume) => {
                        this.#rhythm.#setting.updateCurrentModeVolume(
                            Decimal.div(volume, 100).toNumber(),
                        )
                    }

                    ipcMain.on(
                        'rhythm::main::set-current-mode-volume',
                        setCurrentModeVolumeHandler,
                    )

                    /**
                     * @type {(event:Electron.IpcMainInvokeEvent)=>'sequential'|'shuffle'|'random'}
                     */
                    const getQueueOrderModeHandler = () =>
                        this.#rhythm.#setting.queueOrderMode

                    ipcMain.handle(
                        'rhythm::main::get-queue-order-mode',
                        getQueueOrderModeHandler,
                    )

                    /**
                     * @type {(event:Electron.IpcMainInvokeEvent)=>'all'|'single'|'off'}
                     */
                    const getQueueOrderLoopHandler = () =>
                        this.#rhythm.#setting.queueOrderLoop

                    ipcMain.handle(
                        'rhythm::main::get-queue-order-loop',
                        getQueueOrderLoopHandler,
                    )

                    /**
                     * @type {(event:Electron.IpcMainInvokeEvent)=>{
                     * [type in import("./library/index.mjs").Format]:{[by in 'album'|'artist']:Array<string>}
                     * }}
                     */
                    const getLibraryGroupHandler = () =>
                        this.#rhythm.#library.group

                    ipcMain.handle(
                        'rhythm::main::get-library-group',
                        getLibraryGroupHandler,
                    )

                    /**
                     * @type {(event:Electron.IpcMainInvokeEvent,type:import("./library/index.mjs").Format,group:'all'|{
                     * by:'album'|'artist',
                     * name:string,
                     * })=>Array<{
                     * type:import("./library/index.mjs").Format,
                     * uuid:string,
                     * size:number,
                     * modified:number,
                     * title:string,
                     * artist:string,
                     * album:string,
                     * length:number,
                     * bit:number,
                     * depth?:number,
                     * sample:number,
                     * cover:string,
                     * }>}
                     */
                    const getBasicInformationListUnderGroupHandler = (
                        _,
                        type,
                        group,
                    ) =>
                        this.#rhythm.#library.getBasicInformationListUnderGroup(
                            type,
                            group,
                        )

                    ipcMain.handle(
                        'rhythm::main::get-basic-information-list-under-group',
                        getBasicInformationListUnderGroupHandler,
                    )

                    /**
                     * @type {<TYPE extends import("./library/index.mjs").Format>(
                     * event:Electron.IpcMainInvokeEvent,
                     * type:TYPE,
                     * uuid:string,
                     * )=>undefined|{
                     * flac:{
                     * uuid:string,
                     * name:string,
                     * size:number,
                     * modified:number,
                     * title:string,
                     * artist:string,
                     * album:string,
                     * length:number,
                     * bit:number,
                     * depth:number,
                     * sample:number,
                     * cover:string,
                     * record:string,
                     * track:string,
                     * year:string,
                     * genre:string,
                     * artists:string,
                     * composer:string,
                     * lyricist:string,
                     * copyright:string,
                     * isrc:string,
                     * },
                     * mp3:{
                     * uuid:string,
                     * name:string,
                     * size:number,
                     * modified:number,
                     * title:string,
                     * artist:string,
                     * album:string,
                     * length:number,
                     * bit:number,
                     * sample:number,
                     * cover:string,
                     * },
                     * }[TYPE]}
                     */
                    const getDetailedInformationWithUUIDHandler = (
                        _,
                        type,
                        uuid,
                    ) =>
                        this.#rhythm.#library.getDetailedInformationWithUUID(
                            type,
                            uuid,
                        )

                    ipcMain.handle(
                        'rhythm::main::get-detailed-information-with-uuid',
                        getDetailedInformationWithUUIDHandler,
                    )

                    /**
                     * @type {(event:Electron.IpcMainInvokeEvent)=>[import("./library/index.mjs").Format,'all'|{
                     * by:'album'|'artist',
                     * name:string,
                     * }]}
                     */
                    const getQueueSourceHandler = () =>
                        this.#rhythm.#manager.queueSource

                    ipcMain.handle(
                        'rhythm::main::get-queue-source',
                        getQueueSourceHandler,
                    )

                    /**
                     * @type {(event:Electron.IpcMainInvokeEvent)=>[string,number]}
                     */
                    const getQueueAtHandler = () =>
                        this.#rhythm.#manager.queueAt

                    ipcMain.handle(
                        'rhythm::main::get-queue-at',
                        getQueueAtHandler,
                    )

                    /**
                     * @type {(event:Electron.IpcMainInvokeEvent)=>number}
                     */
                    const getProgressHandler = () =>
                        this.#rhythm.#service.progress

                    ipcMain.handle(
                        'rhythm::main::get-progress',
                        getProgressHandler,
                    )

                    /**
                     * @type {(event:Electron.IpcMainEvent,progress:number)=>void}
                     */
                    const setProgressHandler = (_, progress) => {
                        this.#rhythm.#manager.changeQueueTargetProgress(
                            progress,
                        )
                    }

                    ipcMain.on('rhythm::main::set-progress', setProgressHandler)

                    /**
                     * @type {(event:Electron.IpcMainInvokeEvent)=>boolean}
                     */
                    const getPlayStateHandler = () =>
                        this.#rhythm.#service.isPlaying

                    ipcMain.handle(
                        'rhythm::main::get-play-state',
                        getPlayStateHandler,
                    )

                    /**
                     * @type {(event:Electron.IpcMainEvent)=>Promise<void>}
                     */
                    const rescanLibraryHandler = async() => {
                        await this.#rhythm.#library.refreshDatabase()
                    }

                    ipcMain.on(
                        'rhythm::main::rescan-library',
                        rescanLibraryHandler,
                    )

                    /**
                     * @type {(event:Electron.IpcMainEvent)=>void}
                     */
                    const switchSceneModeHandler = () => {
                        popUpSceneModeSwitchMenu(
                            this.#rhythm.#setting.modeCandidate,
                            this.#rhythm.#service.availableDeviceIDList,
                            this.#rhythm.#setting.modeCurrent,
                            this.#rhythm.#sourceRootPath,
                            this.#rhythm.#setting.language,
                            /**
                             * @type {(uuid:string)=>void}
                             */
                            uuid => {
                                this.#rhythm.#setting.changeCurrentMode(uuid)
                            },
                            this.#renderer,
                        )

                        this.#rhythm.#content?.cancelShowContent()
                    }

                    ipcMain.on(
                        'rhythm::main::switch-scene-mode',
                        switchSceneModeHandler,
                    )

                    /**
                     * @type {(event:Electron.IpcMainEvent,page?:'library'|'mode'|'other'|'about')=>void}
                     */
                    const openSettingPageHandler = (_, page) => {
                        this.#rhythm.#setting.requestShowPanel(page)
                    }

                    ipcMain.on(
                        'rhythm::main::open-setting-page',
                        openSettingPageHandler,
                    )

                    /**
                     * @type {(event:Electron.IpcMainEvent,type:import("./library/index.mjs").Format,group:'all'|{
                     * by:'album'|'artist',
                     * name:string,
                     * },uuid?:string)=>void}
                     */
                    const playFromHereHandler = (_, type, group, uuid) => {
                        this.#rhythm.#manager.changeQueueSourceTarget(
                            type,
                            group,
                            uuid ?? '',
                        )

                        this.#rhythm.#service.switchToPlay()
                    }

                    ipcMain.on(
                        'rhythm::main::play-from-here',
                        playFromHereHandler,
                    )

                    /**
                     * @type {(event:Electron.IpcMainEvent)=>void}
                     */
                    const stopFromHereHandler = () => {
                        this.#rhythm.#service.switchToStop()
                    }

                    ipcMain.on(
                        'rhythm::main::stop-from-here',
                        stopFromHereHandler,
                    )

                    /**
                     * @type {(event:Electron.IpcMainEvent)=>void}
                     */
                    const requestPreviousTrackHandler = () => {
                        this.#rhythm.#manager.requestQueuePreviousTarget()
                    }

                    ipcMain.on(
                        'rhythm::main::request-previous-track',
                        requestPreviousTrackHandler,
                    )

                    /**
                     * @type {(event:Electron.IpcMainEvent)=>void}
                     */
                    const requestNextTrackHandler = () => {
                        this.#rhythm.#manager.requestQueueNextTarget()
                    }

                    ipcMain.on(
                        'rhythm::main::request-next-track',
                        requestNextTrackHandler,
                    )

                    /**
                     * @type {(event:Electron.IpcMainEvent)=>void}
                     */
                    const switchQueueOrderModeHandler = () => {
                        /**
                         * @type {['sequential','shuffle','random']}
                         */
                        const queueOrderModeCandidate = [
                            'sequential',
                            'shuffle',
                            'random',
                        ]

                        this.#rhythm.#setting.changeQueueOrderMode(
                            queueOrderModeCandidate[
                                (queueOrderModeCandidate.indexOf(
                                    this.#rhythm.#setting.queueOrderMode,
                                ) +
                                    1) %
                                    3
                            ] ?? 'sequential',
                        )
                    }

                    ipcMain.on(
                        'rhythm::main::switch-queue-order-mode',
                        switchQueueOrderModeHandler,
                    )

                    /**
                     * @type {(event:Electron.IpcMainEvent)=>void}
                     */
                    const switchQueueOrderLoopHandler = () => {
                        /**
                         * @type {['all','single','off']}
                         */
                        const queueOrderLoopCandidate = ['all', 'single', 'off']

                        this.#rhythm.#setting.changeQueueOrderLoop(
                            queueOrderLoopCandidate[
                                (queueOrderLoopCandidate.indexOf(
                                    this.#rhythm.#setting.queueOrderLoop,
                                ) +
                                    1) %
                                    3
                            ] ?? 'all',
                        )
                    }

                    ipcMain.on(
                        'rhythm::main::switch-queue-order-loop',
                        switchQueueOrderLoopHandler,
                    )

                    /**
                     * @type {(event:Electron.IpcMainEvent)=>void}
                     */
                    const playHandler = () => {
                        this.#rhythm.#service.switchToPlay()
                    }

                    ipcMain.on('rhythm::main::play', playHandler)

                    /**
                     * @type {(event:Electron.IpcMainEvent)=>void}
                     */
                    const pauseHandler = () => {
                        this.#rhythm.#service.switchToPause()
                    }

                    ipcMain.on('rhythm::main::pause', pauseHandler)

                    /**
                     * @type {(event:Electron.IpcMainEvent,content:string)=>void}
                     */
                    const requestShowContentHandler = (_, content) => {
                        this.#rhythm.#content?.requestShowContent(content)
                    }

                    ipcMain.on(
                        'rhythm::main::request-show-content',
                        requestShowContentHandler,
                    )

                    /**
                     * @type {(event:Electron.IpcMainEvent)=>void}
                     */
                    const cancelShowContentHandler = () => {
                        this.#rhythm.#content?.cancelShowContent()
                    }

                    ipcMain.on(
                        'rhythm::main::cancel-show-content',
                        cancelShowContentHandler,
                    )

                    this.#renderer.loadPage(
                        join(this.#rhythm.#sourceRootPath, 'main.html'),
                    )

                    return () => {
                        this.#renderer.destroy()

                        ipcMain.off(
                            'rhythm::main::cancel-show-content',
                            cancelShowContentHandler,
                        )

                        ipcMain.off(
                            'rhythm::main::request-show-content',
                            requestShowContentHandler,
                        )

                        ipcMain.off('rhythm::main::pause', pauseHandler)

                        ipcMain.off('rhythm::main::play', playHandler)

                        ipcMain.off(
                            'rhythm::main::switch-queue-order-loop',
                            switchQueueOrderLoopHandler,
                        )

                        ipcMain.off(
                            'rhythm::main::switch-queue-order-mode',
                            switchQueueOrderModeHandler,
                        )

                        ipcMain.off(
                            'rhythm::main::request-next-track',
                            requestNextTrackHandler,
                        )

                        ipcMain.off(
                            'rhythm::main::request-previous-track',
                            requestPreviousTrackHandler,
                        )

                        ipcMain.off(
                            'rhythm::main::stop-from-here',
                            stopFromHereHandler,
                        )

                        ipcMain.off(
                            'rhythm::main::play-from-here',
                            playFromHereHandler,
                        )

                        ipcMain.off(
                            'rhythm::main::open-setting-page',
                            openSettingPageHandler,
                        )

                        ipcMain.off(
                            'rhythm::main::switch-scene-mode',
                            switchSceneModeHandler,
                        )

                        ipcMain.off(
                            'rhythm::main::rescan-library',
                            rescanLibraryHandler,
                        )

                        ipcMain.removeHandler('rhythm::main::get-play-state')

                        ipcMain.off(
                            'rhythm::main::set-progress',
                            setProgressHandler,
                        )

                        ipcMain.removeHandler('rhythm::main::get-progress')

                        ipcMain.removeHandler('rhythm::main::get-queue-at')

                        ipcMain.removeHandler('rhythm::main::get-queue-source')

                        ipcMain.removeHandler(
                            'rhythm::main::get-detailed-information-with-uuid',
                        )

                        ipcMain.removeHandler(
                            'rhythm::main::get-basic-information-list-under-group',
                        )

                        ipcMain.removeHandler('rhythm::main::get-library-group')

                        ipcMain.removeHandler(
                            'rhythm::main::get-queue-order-loop',
                        )

                        ipcMain.removeHandler(
                            'rhythm::main::get-queue-order-mode',
                        )

                        ipcMain.off(
                            'rhythm::main::set-current-mode-volume',
                            setCurrentModeVolumeHandler,
                        )

                        ipcMain.removeHandler(
                            'rhythm::main::get-current-mode-volume',
                        )

                        ipcMain.removeHandler(
                            'rhythm::main::get-library-path-state',
                        )

                        ipcMain.removeHandler('rhythm::main::get-language')

                        ipcMain.removeHandler(
                            'rhythm::main::get-cover-root-path',
                        )

                        ipcMain.off(
                            'rhythm::main::reboot-in-core-mode',
                            rebootInCoreModeHandler,
                        )

                        nativeTheme.off('updated', nativeThemeUpdatedHandler)

                        this.#tray?.destroy()

                        // @ts-ignore
                        this.#rhythm = void null
                    }
                }
            }
        }

        return globalThis.isCoreMode ? void null : new Main(this)
    })()

    #content = (() => {
        const Content = class {
            /**
             * @type {Rhythm}
             */
            #rhythm

            /**
             * @type {Renderer}
             */
            #renderer

            #memory = {
                terminator: () => {
                    clearImmediate(void null)
                },
                cleaner: () => {
                    clearTimeout(NaN)
                },
            }

            /**
             * @param {Rhythm} rhythm
             */
            constructor(rhythm) {
                this.#rhythm = rhythm

                this.#rhythm.#interface?.registerReadyRendererTarget()

                const iconPath = join(this.#rhythm.#sourceRootPath, 'icon.ico')

                const preloadPath = join(
                    this.#rhythm.#sourceRootPath,
                    'preload/content.mjs',
                )

                this.#renderer = new Renderer(
                    'Rhythm::Content',
                    null,
                    'manually-call',
                    {
                        ...Renderer.getOptions(iconPath, preloadPath, false, {
                            browserWindowOptions: {
                                focusable: false,
                                frame: false,
                                center: false,
                                x: 0,
                                y: 0,
                                minWidth: 1,
                                width: 1,
                                minHeight: 40,
                                height: 40,
                                transparent: true,
                                backgroundColor: '#00000000',
                                opacity: 0,
                            },
                            webPreferencesOptions: {
                                additionalArguments: [
                                    '--source-identifier=content',
                                ],
                            },
                        }),
                    },
                )

                this.#renderer.setIgnoreMouseEvents(true)

                this.#renderer.setAlwaysOnTop(true, 'pop-up-menu')

                this.#renderer.showInactive()
            }

            /**
             * @type {(content:string)=>void}
             */
            #updateContent(content) {
                /**
                 * @type {(event:Electron.IpcMainEvent,width:number)=>void}
                 */
                const updateWindowWidthHandler = (_, width) => {
                    this.#renderer.setSize(Math.ceil(width) || 1, 40)
                }

                ipcMain.once(
                    'rhythm::content::update-window-width',
                    updateWindowWidthHandler,
                )

                this.#renderer.webContents.send(
                    'rhythm::content::update-content',
                    content,
                )
            }

            /**
             * @type {(content:string)=>void}
             */
            requestShowContent(content) {
                this.cancelShowContent()

                this.#updateContent(content)

                const { cleaner, terminator } = handleShowContent(
                    this.#renderer,
                )

                this.#memory.cleaner = cleaner

                this.#memory.terminator = terminator
            }

            /**
             * @type {()=>void}
             */
            cancelShowContent() {
                this.#memory.terminator()

                this.#renderer.setOpacity(0)

                this.#memory.cleaner()
            }

            /**
             * @type {()=>()=>()=>void}
             */
            init() {
                return () => {
                    this.#renderer.loadPage(
                        join(this.#rhythm.#sourceRootPath, 'content.html'),
                    )

                    return () => {
                        this.#renderer.destroy()

                        // @ts-ignore
                        this.#rhythm = void null
                    }
                }
            }
        }

        return globalThis.isCoreMode ? void null : new Content(this)
    })()

    #rmtc = (() => {
        const RMTC = class {
            /**
             * @type {Rhythm}
             */
            #rhythm

            /**
             * @type {import("express").Express}
             */
            #application

            #memory = {
                /**
                 * @type {undefined|import("node:http").Server}
                 */
                server: void null,
            }

            /**
             * @param {Rhythm} rhythm
             */
            constructor(rhythm) {
                this.#rhythm = rhythm

                this.#application = express()

                this.#application.get('/previous-track', (_, response) => {
                    this.#rhythm.#manager.requestQueuePreviousTarget()

                    response.send('Done')
                })

                this.#application.get('/play', (_, response) => {
                    this.#rhythm.#service.switchToPlay()

                    response.send('Done')
                })

                this.#application.get('/pause', (_, response) => {
                    this.#rhythm.#service.switchToPause()

                    response.send('Done')
                })

                this.#application.get('/next-track', (_, response) => {
                    this.#rhythm.#manager.requestQueueNextTarget()

                    response.send('Done')
                })

                this.#application.get(/.*$/u, (request, response) => {
                    const language = this.#rhythm.#setting.language

                    const socketAddress = `http://${request.socket.localAddress}:${request.socket.localPort}`

                    response.json({
                        [{
                            en: 'Previous',
                            zh: '上一首',
                            ja: '前へ',
                        }[language]]: `${socketAddress}/previous-track`,
                        [{
                            en: 'Play',
                            zh: '播放',
                            ja: '再生',
                        }[language]]: `${socketAddress}/play`,
                        [{
                            en: 'Pause',
                            zh: '暂停',
                            ja: '一時停止',
                        }[language]]: `${socketAddress}/pause`,
                        [{
                            en: 'Next',
                            zh: '下一首',
                            ja: '次へ',
                        }[language]]: `${socketAddress}/next-track`,
                    })
                })
            }

            /**
             * @type {()=>void}
             */
            enableServer() {
                const port = isDevMode ? 26897 : 6897

                const server = this.#application.listen(
                    port,
                    '0.0.0.0',
                    error => {
                        const language = this.#rhythm.#setting.language

                        if (error instanceof Error) {
                            console.error(error)

                            new Notification({
                                title: {
                                    en: 'RMTC failed to enable',
                                    zh: '远程媒体传输控制启用失败',
                                    ja: 'RMTC が有効にできませんでした',
                                }[language],
                                body: {
                                    en: 'Please reboot the application or the operating system to try again.',
                                    zh: '请重启应用或重启操作系统以重试。',
                                    ja: '再試行するには、アプリまたは OS を再起動してください。',
                                }[language],
                                silent: true,
                                icon: join(
                                    this.#rhythm.#sourceRootPath,
                                    `asset/image/theme-${
                                        nativeTheme.shouldUseDarkColors
                                            ? 'dark'
                                            : 'light'
                                    }-default-cover.jpg`,
                                ),
                            }).show()
                        } else {
                            this.#memory.server = server

                            new Notification({
                                title: {
                                    en: 'RMTC enabled',
                                    zh: '远程媒体传输控制已开启',
                                    ja: 'RMTC が有効です',
                                }[language],
                                body: {
                                    en: `The service can be accessed via port "${port}".`,
                                    zh: `可通过端口“${port}”访问服务。`,
                                    ja: `サービスはポート「${port}」経由でアクセス可能です。`,
                                }[language],
                                silent: true,
                                icon: join(
                                    this.#rhythm.#sourceRootPath,
                                    `asset/image/theme-${
                                        nativeTheme.shouldUseDarkColors
                                            ? 'dark'
                                            : 'light'
                                    }-default-cover.jpg`,
                                ),
                            }).show()
                        }
                    },
                )
            }

            /**
             * @type {()=>()=>()=>Promise<void>}
             */
            init() {
                return () =>
                    async() => {
                        const server = this.#memory.server
                        if (server) {
                            await new Promise(resolve => {
                                server.close(resolve)

                                server.closeAllConnections()
                            })
                        }

                        // @ts-ignore
                        this.#rhythm = void null
                    }
            }
        }

        return new RMTC(this)
    })()

    #core = (() => {
        const Core = class {
            /**
             * @type {Rhythm}
             */
            #rhythm

            /**
             * @type {Tray}
             */
            #tray

            /**
             * @param {Rhythm} rhythm
             */
            constructor(rhythm) {
                this.#rhythm = rhythm

                this.#tray = new Tray(
                    nativeImage.createFromPath(
                        join(
                            this.#rhythm.#sourceRootPath,
                            `asset/image/theme-${nativeTheme.shouldUseDarkColors ? 'dark' : 'light'}-tray-icon.png`,
                        ),
                    ),
                )

                const language = getDefaultLanguage()

                this.#tray.setToolTip(
                    {
                        en: 'Rhythm - Initializing...',
                        zh: '聆声 - 初始化中…',
                        ja: 'リズム - 初期化中…',
                    }[language],
                )

                this.#tray.setContextMenu(
                    Menu.buildFromTemplate([
                        {
                            label: {
                                en: 'Quit Rhythm',
                                zh: '退出聆声',
                                ja: 'リズムを終了',
                            }[language],
                            click: () => {
                                this.#rhythm.emit('exit')
                            },
                        },
                    ]),
                )
            }

            /**
             * @type {()=>()=>()=>void}
             */
            init() {
                return () => {
                    if (this.#rhythm.#setting.queueOrderLoop === 'off') {
                        this.#rhythm.#setting.changeQueueOrderLoop('all')
                    }

                    const [type, group] = this.#rhythm.#manager.queueSource
                    if (group !== 'all') {
                        const [uuid, progressAnchor] =
                            this.#rhythm.#manager.queueAt

                        this.#rhythm.#manager.changeQueueSourceTarget(
                            type,
                            'all',
                            uuid,
                        )

                        this.#rhythm.#manager.changeQueueTargetProgress(
                            progressAnchor,
                        )
                    }

                    /**
                     * @type {()=>void}
                     */
                    const updateTrayContextMenu = () => {
                        const checkedIndicatorIcon = nativeImage.createFromPath(
                            join(
                                this.#rhythm.#sourceRootPath,
                                `asset/image/theme-${nativeTheme.shouldUseDarkColors ? 'dark' : 'light'}-context-button-checkmark.png`,
                            ),
                        )

                        const activeIndicatorIcon = nativeImage.createFromPath(
                            join(
                                this.#rhythm.#sourceRootPath,
                                `asset/image/theme-${nativeTheme.shouldUseDarkColors ? 'dark' : 'light'}-context-button-source.png`,
                            ),
                        )

                        const availableDeviceIDList =
                            this.#rhythm.#service.availableDeviceIDList

                        const language = this.#rhythm.#setting.language

                        const modeCurrent = this.#rhythm.#setting.modeCurrent

                        const queueOrderMode =
                            this.#rhythm.#setting.queueOrderMode

                        const queueOrderLoop =
                            this.#rhythm.#setting.queueOrderLoop

                        const [type] = this.#rhythm.#manager.queueSource

                        this.#tray.setContextMenu(
                            Menu.buildFromTemplate([
                                {
                                    label: {
                                        en: 'Reboot application in full mode',
                                        zh: '以完整模式重启应用',
                                        ja: 'アプリを完全モードで再起動',
                                    }[language],
                                    click: () => {
                                        rmSync(
                                            join(
                                                this.#rhythm.#dataRootPath ??
                                                    '',
                                                'cast_off',
                                            ),
                                            {
                                                force: true,
                                                recursive: true,
                                            },
                                        )

                                        this.#rhythm.emit('exit', {
                                            hardRebootIsRequired: {
                                                playAfterRebootIsRequired:
                                                    this.#rhythm.#service
                                                        .isPlaying,
                                            },
                                        })
                                    },
                                },
                                { type: 'separator' },
                                {
                                    label: {
                                        en: 'Rescan library',
                                        zh: '重新扫描库',
                                        ja: 'ライブラリ再スキャン',
                                    }[language],
                                    click: async() => {
                                        await this.#rhythm.#library.refreshDatabase()
                                    },
                                },
                                {
                                    label: {
                                        en: 'Library type',
                                        zh: '库类型',
                                        ja: 'ライブラリの種類',
                                    }[language],
                                    submenu: [
                                        {
                                            ...type === 'flac'
                                                ? {
                                                    icon: checkedIndicatorIcon,
                                                }
                                                : {},
                                            label: 'FLAC',
                                            click: () => {
                                                type !== 'flac' &&
                                                    this.#rhythm.#manager.changeQueueSourceTarget(
                                                        'flac',
                                                        'all',
                                                        '',
                                                    )
                                            },
                                        },
                                        {
                                            ...type === 'mp3'
                                                ? {
                                                    icon: checkedIndicatorIcon,
                                                }
                                                : {},
                                            label: 'MP3',
                                            click: () => {
                                                type !== 'mp3' &&
                                                    this.#rhythm.#manager.changeQueueSourceTarget(
                                                        'mp3',
                                                        'all',
                                                        '',
                                                    )
                                            },
                                        },
                                    ],
                                },
                                { type: 'separator' },
                                {
                                    label: {
                                        en: 'Scene mode',
                                        zh: '情景模式',
                                        ja: 'シーンモード',
                                    }[language],
                                    submenu: Object.entries(
                                        this.#rhythm.#setting.modeCandidate,
                                    ).map(([uuid, mode]) => {
                                        const enabled =
                                            uuid === nil ||
                                            availableDeviceIDList.includes(
                                                mode.device,
                                            )

                                        return {
                                            enabled,
                                            ...uuid === modeCurrent
                                                ? {
                                                    icon: activeIndicatorIcon,
                                                }
                                                : {},
                                            label:
                                                uuid === nil
                                                    ? {
                                                        en: 'Default',
                                                        zh: '默认',
                                                        ja: 'デフォルト',
                                                    }[language]
                                                    : enabled
                                                        ? mode.label
                                                        : `${mode.label} (${
                                                            {
                                                                en: 'Unavailable',
                                                                zh: '不可用',
                                                                ja: '使用できません',
                                                            }[language]
                                                        })`,
                                            click: () => {
                                                this.#rhythm.#setting.changeCurrentMode(
                                                    uuid,
                                                )
                                            },
                                        }
                                    }),
                                },
                                {
                                    label: {
                                        en: 'Order',
                                        zh: '队列',
                                        ja: '並び',
                                    }[language],
                                    submenu: [
                                        {
                                            ...queueOrderMode === 'sequential'
                                                ? {
                                                    icon: checkedIndicatorIcon,
                                                }
                                                : {},
                                            label: {
                                                en: 'Sequential',
                                                zh: '顺序',
                                                ja: '順番',
                                            }[language],
                                            click: () => {
                                                this.#rhythm.#setting.changeQueueOrderMode(
                                                    'sequential',
                                                )
                                            },
                                        },
                                        {
                                            ...queueOrderMode === 'shuffle'
                                                ? {
                                                    icon: checkedIndicatorIcon,
                                                }
                                                : {},
                                            label: {
                                                en: 'Shuffle',
                                                zh: '乱序',
                                                ja: '乱序',
                                            }[language],
                                            click: () => {
                                                this.#rhythm.#setting.changeQueueOrderMode(
                                                    'shuffle',
                                                )
                                            },
                                        },
                                        {
                                            ...queueOrderMode === 'random'
                                                ? {
                                                    icon: checkedIndicatorIcon,
                                                }
                                                : {},
                                            label: {
                                                en: 'Random',
                                                zh: '随机',
                                                ja: 'ランダム',
                                            }[language],
                                            click: () => {
                                                this.#rhythm.#setting.changeQueueOrderMode(
                                                    'random',
                                                )
                                            },
                                        },
                                    ],
                                },
                                {
                                    label: {
                                        en: 'Repeat',
                                        zh: '循环',
                                        ja: 'リピート',
                                    }[language],
                                    submenu: [
                                        {
                                            ...queueOrderLoop === 'all'
                                                ? {
                                                    icon: checkedIndicatorIcon,
                                                }
                                                : {},
                                            label: {
                                                en: 'All',
                                                zh: '全部',
                                                ja: '全て',
                                            }[language],
                                            click: () => {
                                                this.#rhythm.#setting.changeQueueOrderLoop(
                                                    'all',
                                                )
                                            },
                                        },
                                        {
                                            ...queueOrderLoop === 'single'
                                                ? {
                                                    icon: checkedIndicatorIcon,
                                                }
                                                : {},
                                            label: {
                                                en: 'Single',
                                                zh: '单曲',
                                                ja: '一曲',
                                            }[language],
                                            click: () => {
                                                this.#rhythm.#setting.changeQueueOrderLoop(
                                                    'single',
                                                )
                                            },
                                        },
                                    ],
                                },
                                { type: 'separator' },
                                {
                                    label: {
                                        en: 'Quit Rhythm',
                                        zh: '退出聆声',
                                        ja: 'リズムを終了',
                                    }[language],
                                    click: () => {
                                        this.#rhythm.emit('exit')
                                    },
                                },
                            ]),
                        )
                    }

                    this.#rhythm.#setting.on(
                        'setting-mode-current-changed',
                        updateTrayContextMenu,
                    )

                    this.#rhythm.#setting.on(
                        'setting-queue-order-mode-changed',
                        updateTrayContextMenu,
                    )

                    this.#rhythm.#setting.on(
                        'setting-queue-order-loop-changed',
                        updateTrayContextMenu,
                    )

                    this.#rhythm.#manager.on(
                        'manager-queue-source-changed',
                        updateTrayContextMenu,
                    )

                    /**
                     * @type {()=>void}
                     */
                    const nativeThemeUpdatedHandler = () => {
                        this.#tray.setImage(
                            nativeImage.createFromPath(
                                join(
                                    this.#rhythm.#sourceRootPath,
                                    `asset/image/theme-${nativeTheme.shouldUseDarkColors ? 'dark' : 'light'}-tray-icon.png`,
                                ),
                            ),
                        )

                        updateTrayContextMenu()
                    }

                    nativeTheme.on('updated', nativeThemeUpdatedHandler)

                    this.#rhythm.#service.enableSMTC()

                    if (this.#rhythm.#setting.remote) {
                        this.#rhythm.#rmtc.enableServer()
                    }

                    process.argv.includes('--autoplay') &&
                        this.#rhythm.#service.switchToPlay()

                    updateTrayContextMenu()

                    this.#tray.on('click', () => {
                        if (this.#rhythm.#service.isPlaying) {
                            this.#rhythm.#service.switchToPause()
                        } else {
                            this.#rhythm.#service.switchToPlay()
                        }
                    })

                    this.#tray.setToolTip(
                        {
                            en: 'Rhythm - Core mode',
                            zh: '聆声 - 核心模式',
                            ja: 'リズム - コアモード',
                        }[this.#rhythm.#setting.language],
                    )

                    return () => {
                        nativeTheme.off('updated', nativeThemeUpdatedHandler)

                        this.#tray.destroy()

                        // @ts-ignore
                        this.#rhythm = void null
                    }
                }
            }
        }

        return globalThis.isCoreMode ? new Core(this) : void null
    })()

    /**
     * @type {()=>Promise<this>}
     */
    async init() {
        if (!this.#isInitialized) {
            this.#isInitialized = true

            /**
             * @type {Array<void|(()=>void)|(()=>Promise<void>)>}
             */
            const exitHandlerList = []

            this.once(
                'exit',
                async(
                    { hardRebootIsRequired } = { hardRebootIsRequired: false },
                ) => {
                    for (const exitHandler of exitHandlerList) {
                        const returns =
                            typeof exitHandler === 'function'
                                ? exitHandler()
                                : void null
                        if (returns instanceof Promise) {
                            await returns
                        }
                    }

                    if (rebootFuse) {
                        this.emit('exited')
                    } else {
                        hardRebootIsRequired &&
                            app.relaunch({
                                args: process.argv
                                    .slice(1)
                                    .filter(arg =>
                                        arg !== '--autoplay')
                                    .concat(
                                        hardRebootIsRequired.playAfterRebootIsRequired
                                            ? ['--autoplay']
                                            : [],
                                    ),
                            })

                        app.exit(0)
                    }
                },
            )

            this.once('necessary-renderer-crash', () => {
                this.emit('exit')
            })

            /**
             * @type {Array<()=>(void|(()=>void)|(()=>Promise<void>))|Promise<
             * void|(()=>void)|(()=>Promise<void>)
             * >>}
             */
            const initHandlerList = [
                ...this.#interface ? [this.#interface.init()] : [],
                this.#service.init(),
                this.#setting.init(),
                this.#library.init(),
                this.#manager.init(),
                ...this.#main ? [this.#main.init()] : [],
                ...this.#content ? [this.#content.init()] : [],
                this.#rmtc.init(),
                ...this.#core ? [this.#core.init()] : [],
            ]

            for (const initHandler of initHandlerList) {
                const returns = initHandler()
                if (returns instanceof Promise) {
                    exitHandlerList.unshift(await returns)
                } else {
                    exitHandlerList.unshift(returns)
                }
            }

            if (this.#isInTemporaryMode) {
                const language = this.#setting.language

                new Notification({
                    title: {
                        en: 'Currently in temporary mode',
                        zh: '当前处于临时模式',
                        ja: '現在一時モードです',
                    }[language],
                    body: {
                        en: 'The application has entered temporary mode because it was unable to store data in the expected location. Your data might not be saved permanently.',
                        zh: '由于应用程序无法将数据存储在预期位置，已切换至临时模式。您的数据可能无法永久保存。',
                        ja: 'アプリケーションは、予期された場所にデータを保存できなかったため、一時モードに切り替わりました。お客様のデータは永続的に保存されない可能性があります。',
                    }[language],
                    silent: false,
                    icon: join(
                        this.#sourceRootPath,
                        `asset/image/theme-${
                            nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
                        }-default-cover.jpg`,
                    ),
                }).show()
            }
        }

        return this
    }
}

let appGlobalConfigIsInited = false

/**
 * @type {()=>Promise<void>}
 */
export const createApp = async() => {
    if (!appGlobalConfigIsInited) {
        appGlobalConfigIsInited = true

        enable.windowControl()
        enable.accentColor()
    }

    globalThis.rhythm = await (() => {
        const rhythm = new Rhythm()

        rhythm.once('exited', async() => {
            if (rebootFuse) {
                await createApp()

                clearRebootFuse()
            } else {
                app.exit(0)
            }
        })

        return rhythm
    })().init()
}