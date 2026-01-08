import { existsSync, statSync } from 'node:fs'
import { app, clipboard, Menu } from 'electron'
import { Decimal } from 'decimal.js'
import { NIL as nil, validate as uuidValidate } from 'uuid'

/**
 * @type {()=>'en'|'zh'|'ja'}
 */
export const getDefaultLanguage = () => {
    const preferredSystemLanguage =
        app
            .getPreferredSystemLanguages()
            .map(language =>
                language.toLocaleLowerCase())
            .filter(language =>
                (/^(?:en|zh|ja)/u).test(language))[0] ?? ''

    return preferredSystemLanguage.startsWith('en')
        ? 'en'
        : preferredSystemLanguage.startsWith('zh')
            ? 'zh'
            : preferredSystemLanguage.startsWith('ja')
                ? 'ja'
                : 'en'
}

/**
 * @type {(language:unknown)=>'en'|'zh'|'ja'}
 */
export const filterValidLanguage = language =>
    // prettier-ignore
    typeof language === 'string' && ['en', 'zh', 'ja'].includes(language)
        // eslint-disable-next-line no-inline-comments, no-extra-parens
        ? /** @type {'en'|'zh'|'ja'} */ (language)
        : getDefaultLanguage()

/**
 * @type {(tray:unknown)=>boolean}
 */
export const filterValidTray = tray =>
    Boolean(tray)

/**
 * @type {(libraryPathFLAC:unknown)=>string}
 */
export const filterValidLibraryPathFLAC = libraryPathFLAC =>
    typeof libraryPathFLAC === 'string' &&
    existsSync(libraryPathFLAC) &&
    statSync(libraryPathFLAC).isDirectory()
        ? libraryPathFLAC
        : ''

/**
 * @type {(libraryPathMP3:unknown)=>string}
 */
export const filterValidLibraryPathMP3 = libraryPathMP3 =>
    typeof libraryPathMP3 === 'string' &&
    existsSync(libraryPathMP3) &&
    statSync(libraryPathMP3).isDirectory()
        ? libraryPathMP3
        : ''

/**
 * @type {(modeCandidate:unknown)=>{[uuid:string]:{
 * label:string,
 * device:string,
 * volume:number,
 * }}}
 */
export const filterValidModeCandidate = modeCandidate =>
    ({
        [nil]: {
            label: '/\r:\f/',
            device: '/\r:\f/',
            volume: 0.65,
        },
        ...modeCandidate instanceof Object
            ? Object.fromEntries(
                Object.entries(modeCandidate)
                    .filter(
                        ([uuid, value]) =>
                            uuidValidate(uuid) &&
                          value instanceof Object &&
                          typeof value.label === 'string' &&
                          value.label.trim() &&
                          typeof value.device === 'string' &&
                          value.device.trim() &&
                          typeof value.volume === 'number' &&
                          value.volume >= 0 &&
                          value.volume <= 1,
                    )
                    .map(
                        /**
                       * @type {(item:[string,{
                       * label:string,
                       * device:string,
                       * volume:number,
                       * }])=>[string,{
                       * label:string,
                       * device:string,
                       * volume:number,
                       * }]}
                       */
                        ([uuid, { label, device, volume }]) =>
                            [
                                uuid,
                                {
                                    label: uuid === nil ? '/\r:\f/' : label.trim(),
                                    device: uuid === nil ? '/\r:\f/' : device.trim(),
                                    volume: new Decimal(volume)
                                        .toDecimalPlaces(2)
                                        .toNumber(),
                                },
                            ],
                    ),
            )
            : {},
    })

/**
 * @type {(
 * modeCurrent:unknown,
 * modeCandidate:{[uuid:string]:{
 * label:string,
 * device:string,
 * volume:number,
 * }},
 * availableDeviceIDList:Array<string>,
 * )=>string}
 */
export const filterValidModeCurrent = (
    modeCurrent,
    modeCandidate,
    availableDeviceIDList,
) => {
    let newModeCurrent =
        typeof modeCurrent === 'string' &&
        Object.keys(modeCandidate).includes(modeCurrent)
            ? modeCurrent
            : nil

    if (
        newModeCurrent !== nil &&
        !availableDeviceIDList.includes(
            modeCandidate[newModeCurrent]?.device ?? '',
        )
    ) {
        newModeCurrent = nil
    }

    return newModeCurrent
}

/**
 * @type {(ruleArtistSplit:unknown)=>false|string}
 */
export const filterValidRuleArtistSplit = ruleArtistSplit =>
    typeof ruleArtistSplit === 'string' && ruleArtistSplit
        ? ruleArtistSplit
        : false

/**
 * @type {(ruleArtistIdentify:unknown)=>false|{[uuid:string]:{
 * group:string,
 * member:Array<string>,
 * }}}
 */
export const filterValidRuleArtistIdentify = ruleArtistIdentify => {
    const identify =
        ruleArtistIdentify instanceof Object
            ? Object.fromEntries(
                Object.entries(ruleArtistIdentify)
                    .filter(
                        ([uuid, value]) =>
                            uuidValidate(uuid) &&
                              value instanceof Object &&
                              typeof value.group === 'string' &&
                              value.group.trim() &&
                              value.member instanceof Array &&
                              /**
                               * @type {Array<unknown>}
                               */
                              // eslint-disable-next-line no-extra-parens
                              (value.member).length &&
                              /**
                               * @type {Array<unknown>}
                               */
                              // eslint-disable-next-line no-extra-parens
                              (value.member).every(
                                  member =>
                                      typeof member === 'string' &&
                                      member.trim() &&
                                      member.trim() !== value.group.trim(),
                              ),
                    )
                    .map(
                        /**
                           * @type {(item:[string,{
                           * group:string,
                           * member:Array<string>,
                           * }])=>[string,{
                           * group:string,
                           * member:Array<string>,
                           * }]}
                           */
                        ([uuid, { group, member: memberList }]) =>
                            [
                                uuid,
                                {
                                    group: group.trim(),
                                    member: [
                                        ...new Set(
                                            memberList.map(member =>
                                                member.trim()),
                                        ),
                                    ],
                                },
                            ],
                    ),
            )
            : {}

    return Object.keys(identify).length ? identify : false
}

/**
 * @type {(remote:unknown)=>boolean}
 */
export const filterValidRemote = remote =>
    Boolean(remote)

/**
 * @type {(queueOrderMode:unknown)=>'sequential'|'shuffle'|'random'}
 */
export const filterValidQueueOrderMode = queueOrderMode =>
    // prettier-ignore
    typeof queueOrderMode === 'string' &&
    ['sequential', 'shuffle', 'random'].includes(queueOrderMode)
        // eslint-disable-next-line no-inline-comments, no-extra-parens
        ? /** @type {'sequential'|'shuffle'|'random'} */ (queueOrderMode)
        : 'sequential'

/**
 * @type {(
 * queueOrderLoop:unknown,
 * queueOrderMode:'sequential'|'shuffle'|'random',
 * )=>'all'|'single'|'off'}
 */
export const filterValidQueueOrderLoop = (queueOrderLoop, queueOrderMode) =>
    // prettier-ignore
    typeof queueOrderLoop === 'string' &&
    [
        'all',
        'single',
        ...['random'].includes(queueOrderMode) ? [] : ['off'],
    ].includes(queueOrderLoop)
        // eslint-disable-next-line no-inline-comments, no-extra-parens
        ? /** @type {'all'|'single'|'off'} */ (queueOrderLoop)
        : 'all'

/**
 * @type {(
 * textIsSelected:boolean,
 * language:'en'|'zh'|'ja',
 * renderer:import("../util/index.mjs").Renderer,
 * clientX:number,
 * clientY:number,
 * )=>void}
 */
export const popupInputContextMenu = (
    textIsSelected,
    language,
    renderer,
    clientX,
    clientY,
) => {
    Menu.buildFromTemplate([
        ...textIsSelected
            ? [
                {
                    label: {
                        en: 'Cut',
                        zh: '剪切',
                        ja: '切り取り',
                    }[language],
                    click: () => {
                        renderer.webContents.cut()
                    },
                },
                {
                    label: {
                        en: 'Copy',
                        zh: '复制',
                        ja: 'コピー',
                    }[language],
                    click: () => {
                        renderer.webContents.copy()
                    },
                },
            ]
            : [],
        ...clipboard.readText()
            ? [
                {
                    label: {
                        en: 'Paste',
                        zh: '粘贴',
                        ja: '貼り付け',
                    }[language],
                    click: () => {
                        renderer.webContents.paste()
                    },
                },
            ]
            : [],
        {
            label: {
                en: 'Select All',
                zh: '全选',
                ja: 'すべて選択',
            }[language],
            click: () => {
                renderer.webContents.selectAll()
            },
        },
    ]).popup({
        window: renderer,
        x: clientX,
        y: clientY,
    })
}