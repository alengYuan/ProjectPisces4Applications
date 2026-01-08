import { useCallback, useMemo } from 'react'
import { useGeneralTray } from '../model'
import { t } from '../../index'

/**
 * @type {()=>{
 * ariaLabel:string,
 * isSelected:boolean,
 * resetTray:(isSelected:boolean)=>void,
 * status:string,
 * }}
 */
export const useActionArea = () => {
    const { generalTray } = useGeneralTray()

    const ariaLabel = useMemo(
        /**
         * @type {()=>string}
         */
        () =>
            `${t({
                en: 'Minimize to system tray',
                zh: '最小化时隐藏到任务栏托盘',
                ja: '最小化時にタスクトレイ格納',
            })}${
                generalTray
                    ? t({
                        en: ', currently enabled. ',
                        zh: '，当前已启用。',
                        ja: '、現在有効。',
                    })
                    : t({
                        en: ', currently disabled. ',
                        zh: '，当前已禁用。',
                        ja: '、現在無効。',
                    })
            }${t({
                en: 'When enabled, minimizing the main window will hide the taskbar icon and show a system tray icon',
                zh: '启用后，最小化主界面时将隐藏任务栏图标，并在系统托盘区显示图标',
                ja: 'これを有効にすると、メイン画面を最小化したときにタスクバーからアイコンが非表示になり、タスクトレイにアイコンが表示されます',
            })}`,
        [generalTray],
    )

    const status = useMemo(
        /**
         * @type {()=>string}
         */
        () =>
            generalTray
                ? t({
                    en: 'Enabled',
                    zh: '已启用',
                    ja: '有効',
                })
                : t({
                    en: 'Disabled',
                    zh: '已禁用',
                    ja: '無効',
                }),
        [generalTray],
    )

    const resetTray = useCallback(
        /**
         * @type {(isSelected:boolean)=>void}
         */
        isSelected => {
            window['rhythm::setting'].setSettingStorage(
                'general.tray',
                isSelected,
            )
        },
        [],
    )

    return {
        ariaLabel,
        isSelected: generalTray,
        resetTray,
        status,
    }
}