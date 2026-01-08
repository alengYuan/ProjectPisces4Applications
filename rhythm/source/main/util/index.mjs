/* eslint-disable max-classes-per-file */

import {
    existsSync,
    mkdirSync,
    readFileSync,
    statSync,
    writeFileSync as _writeFileSync,
} from 'node:fs'
import { mkdir, writeFile as _writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import {
    app,
    BrowserWindow,
    ipcMain,
    nativeImage,
    systemPreferences,
} from 'electron'

const isDevMode = 'dev_mode' in process.env

/**
 * @type {(
 * file:import("node:fs").PathOrFileDescriptor,
 * data:string|NodeJS.ArrayBufferView,
 * options?:import("node:fs").WriteFileOptions,
 * )=>void}
 */
export const writeFileSync = (file, data, options) => {
    if (typeof file === 'string') {
        try {
            mkdirSync(dirname(file), { recursive: true })
        } catch (error) {
            console.error(error)
        }
    }

    _writeFileSync(file, data, options)
}

/**
 * @type {(
 * file:import("node:fs").PathLike,
 * data:string|NodeJS.ArrayBufferView,
 * options?:import("node:fs").WriteFileOptions,
 * )=>Promise<void>}
 */
export const writeFile = async(file, data, options) => {
    if (typeof file === 'string') {
        try {
            await mkdir(dirname(file), { recursive: true })
        } catch (error) {
            console.error(error)
        }
    }

    await _writeFile(file, data, options)
}

/**
 * @type {Set<Renderer>}
 */
const rendererSet = new Set()

let windowControlIsEnabled = false

/**
 * @type {<KEY extends import("./type").BrowserWindowAllowedMethodKey>(
 * event:Electron.IpcMainInvokeEvent,
 * key:KEY,
 * ...args:Parameters<import("./type").BrowserWindowMethods[KEY]>
 * )=>undefined|ReturnType<import("./type").BrowserWindowMethods[KEY]>}
 */
const controlWindowHandler = ({ sender }, key, ...args) => {
    const win = BrowserWindow.fromWebContents(sender)

    try {
        if (!(win instanceof BrowserWindow)) {
            throw new Error('Invalid sender.')
        } else {
            const returns =
                /**
                 * @type {ReturnType<import("./type").BrowserWindowMethods[typeof key]>}
                 */
                // eslint-disable-next-line no-extra-parens
                (
                    /**
                     * @type {Function}
                     */
                    // eslint-disable-next-line no-extra-parens
                    (win[key])(...args)
                )

            return returns
        }
    } catch (error) {
        console.error(error)

        return void null
    }
}

/**
 * @type {(event:Electron.IpcMainEvent,options?:Electron.OpenDevToolsOptions)=>void}
 */
const openDevToolsHandler = ({ sender }, options) => {
    BrowserWindow.fromWebContents(sender)?.webContents.openDevTools(options)
}

let accentColorIsEnabled = false

/**
 * @type {(event:Electron.IpcMainInvokeEvent)=>string}
 */
const getAccentColorHandler = () =>
    systemPreferences.getAccentColor().substring(0, 6)

/**
 * @type {(event:Electron.Event,accentColor:string)=>void}
 */
const accentColorChangedHandler = (_, accentColor) => {
    Promise.all(
        [...rendererSet].map(
            renderer =>
                new Promise(resolve => {
                    setTimeout(() => {
                        try {
                            renderer.webContents.send(
                                'update-accent-color',
                                accentColor.substring(0, 6),
                            )
                        } catch (error) {
                            console.error(error)
                        } finally {
                            resolve(void null)
                        }
                    })
                }),
        ),
    )
}

export const enable = {
    /**
     * @type {()=>void}
     */
    windowControl: () => {
        if (!windowControlIsEnabled) {
            windowControlIsEnabled = true

            ipcMain.handle('control-window', controlWindowHandler)

            ipcMain.on('open-dev-tools', openDevToolsHandler)
        }
    },
    /**
     * @type {()=>void}
     */
    accentColor: () => {
        if (!accentColorIsEnabled) {
            accentColorIsEnabled = true

            ipcMain.handle('get-accent-color', getAccentColorHandler)

            systemPreferences.on(
                'accent-color-changed',
                accentColorChangedHandler,
            )
        }
    },
}

/**
 * @type {()=>undefined|string}
 */
export const requestDataRootPath = () => {
    const dataRootPath = join(app.getPath('userData'), 'User')

    try {
        mkdirSync(dataRootPath, { recursive: true })

        return dataRootPath
    } catch (error) {
        console.error(error)

        return void null
    }
}

export class Renderer extends BrowserWindow {
    #launcherPathIsLocked = false

    /**
     * @param {string} devToolsTitle
     * @param {null|string} launcherPath
     * @param {'ready'|'manually-call'} showOn
     * @param {Electron.BrowserWindowConstructorOptions} options
     */
    constructor(devToolsTitle, launcherPath, showOn, options) {
        super(options)

        rendererSet.add(this)

        this.once('closed', () => {
            rendererSet.delete(this)
        })

        if (typeof launcherPath === 'string') {
            this.loadPage(launcherPath)

            showOn === 'ready' &&
                this.once('ready-to-show', () => {
                    this.show()

                    if (isDevMode) {
                        this.webContents.openDevTools({
                            mode: 'detach',
                            title: `[DevTools] ${devToolsTitle}`,
                        })
                    }
                })
        }
    }

    /**
     * @type {(filePath:string)=>void}
     */
    loadPage(filePath) {
        if (!this.#launcherPathIsLocked) {
            this.#launcherPathIsLocked = true

            this.loadFile(filePath)

            this.webContents.on('will-navigate', event =>
                event.preventDefault())
        }
    }

    /**
     * @type {(
     * iconPath:string,
     * preloadPath:string,
     * titleBarOverlay?:boolean|Electron.TitleBarOverlayOptions,
     * mixin?:{
     * browserWindowOptions?:Omit<Electron.BrowserWindowConstructorOptions,'webPreferences'>,
     * webPreferencesOptions?:Electron.WebPreferences,
     * },
     * )=>Electron.BrowserWindowConstructorOptions}
     */
    static getOptions(
        iconPath,
        preloadPath,
        titleBarOverlay,
        { browserWindowOptions, webPreferencesOptions } = {},
    ) {
        return {
            show: false,
            icon: nativeImage.createFromPath(iconPath),
            center: true,
            minWidth: 480,
            width: 1280,
            minHeight: 320,
            height: 720,
            useContentSize: true,
            titleBarStyle: titleBarOverlay ? 'hidden' : 'default',
            titleBarOverlay,
            autoHideMenuBar: true,
            backgroundColor: '#000000',
            ...browserWindowOptions ?? {},
            webPreferences: {
                allowRunningInsecureContent: true,
                autoplayPolicy: 'no-user-gesture-required',
                backgroundThrottling: false,
                contextIsolation: true,
                devTools: isDevMode,
                disableDialogs: true,
                enableWebSQL: false,
                navigateOnDragDrop: false,
                plugins: false,
                preload: preloadPath,
                sandbox: false,
                spellcheck: false,
                webgl: true,
                webSecurity: false,
                ...webPreferencesOptions ?? {},
            },
        }
    }
}

/**
 * @type {{[theme in 'light'|'dark']:{
 * color:{
 * normal:string,
 * smoke:string,
 * },
 * symbolColor:{
 * focus:string,
 * blur:string,
 * },
 * }}}
 */
export const titleBarOverlayColorSchemeMap = {
    light: {
        color: {
            normal: '#f3f3f3',
            smoke: '#aaaaaa',
        },
        symbolColor: {
            focus: '#171717',
            blur: '#a4a4a4',
        },
    },
    dark: {
        color: {
            normal: '#202020',
            smoke: '#161616',
        },
        symbolColor: {
            focus: '#f2f2f2',
            blur: '#5d5d5d',
        },
    },
}

export const titleBarOverlayHeight = 31

/**
 * @type {Map<string,Config>}
 */
const configMap = new Map()

export class Config {
    /**
     * @type {string}
     */
    #key

    #isClosed = false

    /**
     * @type {{[key:string]:any}}
     */
    #valueObject = {}

    /**
     * @type {boolean}
     */
    // eslint-disable-next-line accessor-pairs
    get open() {
        return !this.#isClosed
    }

    /**
     * @param {string} storeDirPath
     * @param {string} filename
     */
    constructor(storeDirPath, filename) {
        this.#key = join(storeDirPath, `${filename}.json`)

        if (!configMap.has(this.#key)) {
            configMap.set(this.#key, this)

            try {
                if (existsSync(this.#key) && statSync(this.#key).isFile()) {
                    const value = JSON.parse(
                        readFileSync(this.#key, { encoding: 'utf8' }),
                    )

                    if (value instanceof Object) {
                        this.#valueObject = value
                    }
                }
            } catch (error) {
                console.error(error)
            }
        }

        const existingThis =
            /**
             * @type {Config}
             */
            // eslint-disable-next-line no-extra-parens
            (configMap.get(this.#key))

        // eslint-disable-next-line no-constructor-return
        return existingThis
    }

    /**
     * @type {()=>void}
     */
    #handleConnectionStatus() {
        if (this.#isClosed) {
            throw new TypeError('The config connection is not open')
        }
    }

    /**
     * @type {(key:string,value:import("./type").SerializableValue)=>{isSuccessful:boolean}}
     */
    update(key, value) {
        this.#handleConnectionStatus()

        const valueObject = {
            ...this.#valueObject,
        }

        valueObject[key] = value

        try {
            writeFileSync(this.#key, JSON.stringify(valueObject), {
                encoding: 'utf8',
            })

            this.#valueObject = valueObject

            return {
                isSuccessful: true,
            }
        } catch (error) {
            console.error(error)

            return {
                isSuccessful: false,
            }
        }
    }

    /**
     * @type {(key:string)=>undefined|unknown}
     */
    select(key) {
        this.#handleConnectionStatus()

        try {
            return structuredClone(this.#valueObject[key])
        } catch (error) {
            console.error(error)

            return void null
        }
    }

    /**
     * @type {()=>this}
     */
    close() {
        this.#isClosed = true

        configMap.delete(this.#key)

        return this
    }
}