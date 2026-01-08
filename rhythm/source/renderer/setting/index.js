import { createElement, StrictMode } from 'react'
import { atom } from 'jotai'
import {
    Scheme,
    argbFromHex,
    hexFromArgb,
} from '@material/material-color-utilities'
import { openDevTools, themeColor, accentColor } from '../util'
import { initReactApp } from '../util/react.index'
import { languagePack } from '../language.reactARIA.mjs'
import { I18nProvider } from 'react-aria'
import App from './reactApp/App/index.jsx'

/**
 * @typedef {{
 * 'general.language':'en'|'zh'|'ja',
 * 'general.tray':boolean,
 * 'library.path.flac':string,
 * 'library.path.mp3':string,
 * 'mode.candidate':{[uuid:string]:{
 * label:string,
 * device:string,
 * volume:number,
 * }},
 * 'other.rule.artist.split':false|string,
 * 'other.rule.artist.identify':false|{[uuid:string]:{
 * group:string,
 * member:Array<string>,
 * }},
 * 'other.remote':boolean,
 * }} SettingStorage
 */

/**
 * @typedef {Omit<SettingStorage,'general.language'|'other.remote'>} RewritableSettingStorage
 */

/**
 * @typedef {'general'|'library'|'mode'|'other'|'about'} PageKey
 */

export const initedValueObject = {
    /**
     * @type {'en'|'zh'|'ja'}
     */
    language: 'en',
    /**
     * @type {SettingStorage}
     */
    settingStorage: {
        'general.language': 'en',
        'general.tray': false,
        'library.path.flac': '',
        'library.path.mp3': '',
        'mode.candidate': {},
        'other.rule.artist.split': false,
        'other.rule.artist.identify': false,
        'other.remote': false,
    },
}

/**
 * @type {<T>(languagePack:{[language in 'en'|'zh'|'ja']:T})=>T}
 */
export const t = languagePack =>
    languagePack[initedValueObject.language]

export const defaultPage =
    /**
     * @type {PageKey}
     */
    // eslint-disable-next-line no-extra-parens
    ('general')

export const defaultPageStack = [defaultPage]

export const atomWrapper = {
    'pageStack': atom([...defaultPageStack]),
    'general.language': atom(
        /**
         * @type {SettingStorage['general.language']}
         */
        // eslint-disable-next-line no-extra-parens
        ('en'),
    ),
    'general.tray': atom(false),
    'library.path.flac': atom(''),
    'library.path.mp3': atom(''),
    'mode.candidate': atom(
        /**
         * @type {SettingStorage['mode.candidate']}
         */
        // eslint-disable-next-line no-extra-parens
        ({}),
    ),
    'other.rule.artist.split': atom(
        /**
         * @type {SettingStorage['other.rule.artist.split']}
         */
        // eslint-disable-next-line no-extra-parens
        (false),
    ),
    'other.rule.artist.identify': atom(
        /**
         * @type {SettingStorage['other.rule.artist.identify']}
         */
        // eslint-disable-next-line no-extra-parens
        (false),
    ),
    'other.remote': atom(false),
}

/**
 * @type {()=>Promise<void>}
 */
export const main = async() => {
    if ('dev_mode' in process.env) {
        openDevTools({
            mode: 'detach',
            title: '[DevTools] Rhythm::Setting',
        })
    }

    initedValueObject.language = await window['rhythm::setting'].getLanguage()
    initedValueObject.settingStorage =
        await window['rhythm::setting'].getSettingStorage()

    atomWrapper['general.language'] = atom(
        initedValueObject.settingStorage['general.language'],
    )

    atomWrapper['general.tray'] = atom(
        initedValueObject.settingStorage['general.tray'],
    )

    atomWrapper['library.path.flac'] = atom(
        initedValueObject.settingStorage['library.path.flac'],
    )

    atomWrapper['library.path.mp3'] = atom(
        initedValueObject.settingStorage['library.path.mp3'],
    )

    atomWrapper['mode.candidate'] = atom(
        initedValueObject.settingStorage['mode.candidate'],
    )

    atomWrapper['other.rule.artist.split'] = atom(
        initedValueObject.settingStorage['other.rule.artist.split'],
    )

    atomWrapper['other.rule.artist.identify'] = atom(
        initedValueObject.settingStorage['other.rule.artist.identify'],
    )

    atomWrapper['other.remote'] = atom(
        initedValueObject.settingStorage['other.remote'],
    )

    let pageStackIsLocked = false

    addEventListener('request-assist-embedded-dialog', () => {
        pageStackIsLocked = true
    })

    addEventListener('cancel-assist-embedded-dialog', () => {
        pageStackIsLocked = false
    })

    window.addEventListener(
        'mousedown',
        event => {
            switch (event.button) {
                case 1:
                    event.preventDefault()

                    break
                case 3:
                    !pageStackIsLocked &&
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
                window['rhythm::setting'].cancelShowContent()
            }
        },
        true,
    )

    window.addEventListener(
        'keydown',
        event => {
            if (event.altKey && event.code === 'ArrowLeft') {
                !pageStackIsLocked &&
                    dispatchEvent(new Event('navigation::back'))

                event.stopPropagation()
            }
        },
        true,
    )

    document.title = t({
        en: 'Rhythm - Settings',
        zh: '聆声 - 设置',
        ja: 'リズム - 設定',
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

    const {
        reactApp: { rootRef, DOMRoot },
        domLayer,
    } = initReactApp()

    window['rhythm::setting'].focusWindow(() => {
        domLayer.classList.add('focused')
    })

    window['rhythm::setting'].blurWindow(() => {
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

    window['rhythm::setting'].notifyReady()
}