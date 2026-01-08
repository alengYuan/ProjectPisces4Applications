import { createElement, StrictMode } from 'react'
import { atom } from 'jotai'
import {
    Scheme,
    argbFromHex,
    hexFromArgb,
} from '@material/material-color-utilities'
import { initCoverCardThemeManager } from './coverCardThemeManager'
import { openDevTools, themeColor, accentColor } from '../util'
import { initReactApp } from '../util/react.index'
import { languagePack } from '../language.reactARIA.mjs'
import { I18nProvider } from 'react-aria'
import App from './reactApp/App/index.jsx'

export const initedValueObject = {
    coverRootPath: '',
    /**
     * @type {'en'|'zh'|'ja'}
     */
    language: 'en',
    /**
     * @type {{[type in 'flac'|'mp3']:{
     * isFilled:boolean,
     * }}}
     */
    libraryPathState: {
        flac: { isFilled: false },
        mp3: { isFilled: false },
    },
    currentModeVolume: NaN,
    /**
     * @type {'sequential'|'shuffle'|'random'}
     */
    queueOrderMode: 'sequential',
    /**
     * @type {'all'|'single'|'off'}
     */
    queueOrderLoop: 'all',
    /**
     * @type {{[type in 'flac'|'mp3']:{[by in 'album'|'artist']:Array<string>}}}
     */
    libraryGroup: {
        flac: {
            album: [],
            artist: [],
        },
        mp3: {
            album: [],
            artist: [],
        },
    },
    /**
     * @type {['flac'|'mp3','all'|{
     * by:'album'|'artist',
     * name:string,
     * }]}
     */
    queueSource: ['flac', 'all'],
    /**
     * @type {[string,number]}
     */
    queueAt: ['', NaN],
    progress: NaN,
    isPlaying: false,
}

/**
 * @type {<T>(languagePack:{[language in 'en'|'zh'|'ja']:T})=>T}
 */
export const t = languagePack =>
    languagePack[initedValueObject.language]

export const atomWrapper = {
    pageStack: atom(
        /**
         * @type {Array<[string,'flac'|'mp3','all'|{
         * by:'album'|'artist',
         * name:string,
         * }]>}
         */
        // eslint-disable-next-line no-extra-parens
        ([]),
    ),
    queueSource: atom(
        /**
         * @type {['flac'|'mp3','all'|{
         * by:'album'|'artist',
         * name:string,
         * }]}
         */
        // eslint-disable-next-line no-extra-parens
        (['flac', 'all']),
    ),
    queueAtIdentification: atom(''),
    progress: atom(NaN),
    isPlaying: atom(false),
    libraryPathIsFilled: atom({
        flac: false,
        mp3: false,
    }),
    currentModeVolume: atom(NaN),
    queueOrderMode: atom(
        /**
         * @type {'sequential'|'shuffle'|'random'}
         */
        // eslint-disable-next-line no-extra-parens
        ('sequential'),
    ),
    queueOrderLoop: atom(
        /**
         * @type {'all'|'single'|'off'}
         */
        // eslint-disable-next-line no-extra-parens
        ('all'),
    ),
    libraryGroup: atom(
        /**
         * @type {{[type in 'flac'|'mp3']:{[by in 'album'|'artist']:Array<string>}}}
         */
        // eslint-disable-next-line no-extra-parens
        ({
            flac: {
                album: [],
                artist: [],
            },
            mp3: {
                album: [],
                artist: [],
            },
        }),
    ),
}

/**
 * @type {(queueSource:['flac'|'mp3','all'|{
 * by:'album'|'artist',
 * name:string,
 * }])=>string}
 */
export const flattenQueueSource = queueSource => {
    const [type, group] = queueSource
    if (typeof group === 'string') {
        return `${type}::${group}`
    }

    return `${type}::${group.by}::${group.name}`
}

/**
 * @type {()=>Promise<void>}
 */
export const main = async() => {
    if ('dev_mode' in process.env) {
        openDevTools({
            mode: 'detach',
            title: '[DevTools] Rhythm::Main',
        })
    }

    initedValueObject.coverRootPath =
        await window['rhythm::main'].getCoverRootPath()
    initedValueObject.language = await window['rhythm::main'].getLanguage()
    initedValueObject.libraryPathState =
        await window['rhythm::main'].getLibraryPathState()
    initedValueObject.currentModeVolume =
        await window['rhythm::main'].getCurrentModeVolume()
    initedValueObject.queueOrderMode =
        await window['rhythm::main'].getQueueOrderMode()
    initedValueObject.queueOrderLoop =
        await window['rhythm::main'].getQueueOrderLoop()
    initedValueObject.libraryGroup =
        await window['rhythm::main'].getLibraryGroup()
    initedValueObject.queueSource =
        await window['rhythm::main'].getQueueSource()
    initedValueObject.queueAt = await window['rhythm::main'].getQueueAt()
    initedValueObject.progress = await window['rhythm::main'].getProgress()
    initedValueObject.isPlaying = await window['rhythm::main'].getPlayState()

    atomWrapper.pageStack = atom([
        [
            flattenQueueSource(initedValueObject.queueSource),
            ...initedValueObject.queueSource,
        ],
    ])

    atomWrapper.queueSource = atom(initedValueObject.queueSource)

    atomWrapper.queueAtIdentification = atom(initedValueObject.queueAt[0])

    atomWrapper.progress = atom(initedValueObject.progress)

    atomWrapper.isPlaying = atom(initedValueObject.isPlaying)

    atomWrapper.libraryPathIsFilled = atom({
        flac: initedValueObject.libraryPathState.flac.isFilled,
        mp3: initedValueObject.libraryPathState.mp3.isFilled,
    })

    atomWrapper.currentModeVolume = atom(initedValueObject.currentModeVolume)

    atomWrapper.queueOrderMode = atom(initedValueObject.queueOrderMode)

    atomWrapper.queueOrderLoop = atom(initedValueObject.queueOrderLoop)

    atomWrapper.libraryGroup = atom(initedValueObject.libraryGroup)

    window.addEventListener(
        'mousedown',
        event => {
            switch (event.button) {
                case 1:
                    event.preventDefault()

                    break
                case 3:
                    dispatchEvent(new Event('navigation::back'))

                    event.stopPropagation()

                    break
                default:
            }
        },
        true,
    )

    window.addEventListener(
        'pointerdown',
        event => {
            if (event.pointerType !== 'mouse' || event.button === 0) {
                window['rhythm::main'].cancelShowContent()
            }
        },
        true,
    )

    window.addEventListener(
        'keydown',
        event => {
            if (event.altKey && event.code === 'ArrowLeft') {
                dispatchEvent(new Event('navigation::back'))

                event.stopPropagation()
            }
        },
        true,
    )

    document.title = t({
        en: 'Rhythm',
        zh: '聆声',
        ja: 'リズム',
    })

    /**
     * @type {()=>Promise<void>}
     */
    const materialColorSchemeHandler = async() => {
        const accentColorHex = await accentColor.rgb

        const originScheme =
            /**
             * @type {Array<[string,string]>}
             */
            // eslint-disable-next-line no-extra-parens
            (
                Object.entries(
                    Scheme[themeColor.mode](
                        argbFromHex(accentColorHex),
                    ).toJSON(),
                ).map(([key, value]) =>
                    [key, hexFromArgb(value)])
            )

        /**
         * @type {Array<[string,string]>}
         */
        const opacity = [
            ['Dilute', '99'],
            ['MoreDilute', '4d'],
            ['MostDilute', '1a'],
        ]

        /**
         * @type {Array<[string,string]>}
         */
        let completeScheme = [...originScheme]

        for (const [suffix, alpha] of opacity) {
            const newScheme =
                /**
                 * @type {Array<[string,string]>}
                 */
                // eslint-disable-next-line no-extra-parens
                (
                    originScheme.map(([prefix, hex]) =>
                        [
                            `${prefix}${suffix}`,
                            `${hex}${alpha}`,
                        ])
                )

            completeScheme = [...completeScheme, ...newScheme]
        }

        completeScheme = [['accent', `#${accentColorHex}`], ...completeScheme]

        const cssStyleDeclaration =
            /**
             * @type {undefined|CSSRule&{style:CSSStyleDeclaration}}
             */
            // eslint-disable-next-line no-extra-parens
            (
                Array.from(
                    /**
                     * @type {null|HTMLStyleElement}
                     */
                    // eslint-disable-next-line no-extra-parens
                    (document.querySelector('style#root-style'))?.sheet
                        ?.cssRules ?? [],
                ).find(
                    cssRule =>
                        /**
                         * @type {CSSRule&{selectorText:string}}
                         */
                        // eslint-disable-next-line no-extra-parens
                        (cssRule).selectorText === ':root',
                )
            )?.style
        if (cssStyleDeclaration) {
            for (const [originKey, value] of completeScheme) {
                cssStyleDeclaration.setProperty(
                    `--${originKey
                        .replace(/(?<upperCase>[A-Z])/gu, '-$<upperCase>')
                        .toLowerCase()}`,
                    value,
                )
            }
        }
    }

    themeColor.addEventListener('change', materialColorSchemeHandler)

    accentColor.addEventListener('change', materialColorSchemeHandler)

    await materialColorSchemeHandler()

    initCoverCardThemeManager()

    const {
        reactApp: { rootRef, DOMRoot },
        domLayer,
    } = initReactApp()

    window['rhythm::main'].focusWindow(() => {
        domLayer.classList.add('focused')
    })

    window['rhythm::main'].blurWindow(() => {
        domLayer.classList.remove('focused')
    })

    rootRef.style.position = 'absolute'
    rootRef.style.top = '0'
    rootRef.style.right = '0'
    rootRef.style.bottom = '0'
    rootRef.style.left = '0'

    DOMRoot.render(
        createElement(
            StrictMode,
            null,
            // eslint-disable-next-line react/no-children-prop
            createElement(I18nProvider, {
                locale: t(languagePack),
                children: createElement(App),
            }),
        ),
    )

    await document.fonts.ready

    window['rhythm::main'].notifyReady()
}