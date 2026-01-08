import { join } from 'node:path'
import { Menu, nativeImage, nativeTheme } from 'electron'
import { NIL as nil } from 'uuid'

/**
 * @type {(
 * sourceRootPath:string,
 * requestQueuePreviousTarget:()=>void,
 * switchToPlay:()=>void,
 * switchToPause:()=>void,
 * requestQueueNextTarget:()=>void,
 * language:'en'|'zh'|'ja',
 * isPlaying:boolean,
 * )=>Array<Electron.ThumbarButton>}
 */
export const getThumbarButtons = (
    sourceRootPath,
    requestQueuePreviousTarget,
    switchToPlay,
    switchToPause,
    requestQueueNextTarget,
    language,
    isPlaying,
) =>
    [
        {
            icon: nativeImage.createFromPath(
                join(
                    sourceRootPath,
                    `asset/image/theme-${nativeTheme.shouldUseDarkColors ? 'dark' : 'light'}-thumbar-button-previous.png`,
                ),
            ),
            click: requestQueuePreviousTarget,
            tooltip: {
                en: 'Previous',
                zh: '上一首',
                ja: '前へ',
            }[language],
            flags: ['nobackground'],
        },
        {
            play: {
                icon: nativeImage.createFromPath(
                    join(
                        sourceRootPath,
                        `asset/image/theme-${nativeTheme.shouldUseDarkColors ? 'dark' : 'light'}-thumbar-button-play.png`,
                    ),
                ),
                click: switchToPlay,
                tooltip: {
                    en: 'Play',
                    zh: '播放',
                    ja: '再生',
                }[language],
                flags: ['nobackground'],
            },
            pause: {
                icon: nativeImage.createFromPath(
                    join(
                        sourceRootPath,
                        `asset/image/theme-${nativeTheme.shouldUseDarkColors ? 'dark' : 'light'}-thumbar-button-pause.png`,
                    ),
                ),
                click: switchToPause,
                tooltip: {
                    en: 'Pause',
                    zh: '暂停',
                    ja: '一時停止',
                }[language],
                flags: ['nobackground'],
            },
        }[isPlaying ? 'pause' : 'play'],
        {
            icon: nativeImage.createFromPath(
                join(
                    sourceRootPath,
                    `asset/image/theme-${nativeTheme.shouldUseDarkColors ? 'dark' : 'light'}-thumbar-button-next.png`,
                ),
            ),
            click: requestQueueNextTarget,
            tooltip: {
                en: 'Next',
                zh: '下一首',
                ja: '次へ',
            }[language],
            flags: ['nobackground'],
        },
    ]

/**
 * @type {(
 * modeCandidate:{[uuid:string]:{
 * label:string,
 * device:string,
 * volume:number,
 * }},
 * availableDeviceIDList:Array<string>,
 * modeCurrent:string,
 * sourceRootPath:string,
 * language:'en'|'zh'|'ja',
 * changeCurrentMode:(uuid:string)=>void,
 * renderer:import("../util/index.mjs").Renderer,
 * )=>void}
 */
export const popUpSceneModeSwitchMenu = (
    modeCandidate,
    availableDeviceIDList,
    modeCurrent,
    sourceRootPath,
    language,
    changeCurrentMode,
    renderer,
) => {
    const activeIndicatorIcon = nativeImage.createFromPath(
        join(
            sourceRootPath,
            `asset/image/theme-${nativeTheme.shouldUseDarkColors ? 'dark' : 'light'}-context-button-source.png`,
        ),
    )

    Menu.buildFromTemplate(
        Object.entries(modeCandidate).map(([uuid, mode]) => {
            const enabled =
                uuid === nil || availableDeviceIDList.includes(mode.device)

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
                    changeCurrentMode(uuid)
                },
            }
        }),
    ).popup({
        window: renderer,
        x: renderer.getBounds().width - 158,
        y: 16,
    })
}