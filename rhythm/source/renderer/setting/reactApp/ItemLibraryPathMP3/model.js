import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLibraryPathMP3 } from '../model'
import { t } from '../../index'

/**
 * @type {()=>{
 * path:string,
 * pathPrompt:string,
 * selectDirectoryPath:()=>Promise<void>,
 * resetDirectoryPath:()=>void,
 * }}
 */
export const useActionArea = () => {
    const { libraryPathMP3 } = useLibraryPathMP3()

    const pathPrompt = useMemo(
        /**
         * @type {()=>string}
         */
        () =>
            t({
                en: `The current path is ${libraryPathMP3}`,
                zh: `当前路径为 ${libraryPathMP3}`,
                ja: `現在のパスは ${libraryPathMP3} です`,
            }),
        [libraryPathMP3],
    )

    const selectDirectoryPath = useCallback(
        /**
         * @type {()=>Promise<void>}
         */
        async() => {
            const result = await window['rhythm::setting'].selectDirectoryPath(
                t({
                    en: 'Select directory',
                    zh: '选择目录',
                    ja: 'フォルダを選択',
                }),
                t({
                    en: 'Set as MP3 music library',
                    zh: '设置为 MP3 音乐库',
                    ja: 'MP3 音楽ライブラリに設定',
                }),
            )

            result &&
                window['rhythm::setting'].setSettingStorage(
                    'library.path.mp3',
                    result,
                )
        },
        [],
    )

    const resetDirectoryPath = useCallback(
        /**
         * @type {()=>void}
         */
        () => {
            window['rhythm::setting'].setSettingStorage('library.path.mp3', '')
        },
        [],
    )

    return {
        path: libraryPathMP3,
        pathPrompt,
        selectDirectoryPath,
        resetDirectoryPath,
    }
}

/**
 * @type {()=>{
 * isExpanded:boolean,
 * switchPanel:()=>void,
 * status:string,
 * }}
 */
export const useItemLibraryPathMP3 = () => {
    const [isExpanded, setIsExpanded] = useState(false)

    const { libraryPathMP3 } = useLibraryPathMP3()

    const status = useMemo(
        /**
         * @type {()=>string}
         */
        () =>
            libraryPathMP3
                ? t({
                    en: 'Specified',
                    zh: '已指定',
                    ja: '指定済み',
                })
                : t({
                    en: 'Unspecified',
                    zh: '未指定',
                    ja: '未指定',
                }),
        [libraryPathMP3],
    )

    const switchPanel = useCallback(
        /**
         * @type {()=>void}
         */
        () => {
            setIsExpanded(previousValue =>
                !previousValue)
        },
        [],
    )

    useEffect(() => {
        const abortController = new AbortController()

        /**
         * @type {()=>void}
         */
        const restoreInterfaceStateHandler = () => {
            !abortController.signal.aborted && setIsExpanded(false)
        }

        addEventListener(
            'restore-interface-state',
            restoreInterfaceStateHandler,
        )

        return () => {
            abortController.abort()

            removeEventListener(
                'restore-interface-state',
                restoreInterfaceStateHandler,
            )
        }
    }, [])

    return {
        isExpanded,
        switchPanel,
        status,
    }
}