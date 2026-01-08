import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLibraryPathFLAC } from '../model'
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
    const { libraryPathFLAC } = useLibraryPathFLAC()

    const pathPrompt = useMemo(
        /**
         * @type {()=>string}
         */
        () =>
            t({
                en: `The current path is ${libraryPathFLAC}`,
                zh: `当前路径为 ${libraryPathFLAC}`,
                ja: `現在のパスは ${libraryPathFLAC} です`,
            }),
        [libraryPathFLAC],
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
                    en: 'Set as FLAC music library',
                    zh: '设置为 FLAC 音乐库',
                    ja: 'FLAC 音楽ライブラリに設定',
                }),
            )

            result &&
                window['rhythm::setting'].setSettingStorage(
                    'library.path.flac',
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
            window['rhythm::setting'].setSettingStorage('library.path.flac', '')
        },
        [],
    )

    return {
        path: libraryPathFLAC,
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
export const useItemLibraryPathFLAC = () => {
    const [isExpanded, setIsExpanded] = useState(false)

    const { libraryPathFLAC } = useLibraryPathFLAC()

    const status = useMemo(
        /**
         * @type {()=>string}
         */
        () =>
            libraryPathFLAC
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
        [libraryPathFLAC],
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