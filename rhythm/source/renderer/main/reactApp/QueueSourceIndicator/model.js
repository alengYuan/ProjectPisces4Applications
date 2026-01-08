import { useMemo } from 'react'
import {
    useQueueSourceType,
    useQueueSourceGroupBy,
    useQueueSourceGroupName,
    useLibraryPathIsFilled,
} from '../model'
import { t } from '../../index'

/**
 * @type {()=>{
 * screenReaderPrompt:string,
 * }}
 */
export const useQueueSourceIndicator = () => {
    const { queueSourceType } = useQueueSourceType()

    const { queueSourceGroupBy } = useQueueSourceGroupBy()

    const { queueSourceGroupName } = useQueueSourceGroupName()

    const { libraryPathIsFilled } = useLibraryPathIsFilled()

    const queueSourceNormalPrompt = useMemo(
        /**
         * @type {()=>string}
         */
        () => {
            const libraryType = {
                flac: 'FLAC',
                mp3: 'MP3',
            }[queueSourceType]

            return t({
                /**
                 * @type {(queueSourceInfo:string)=>string}
                 */
                en: queueSourceInfo =>
                    `Current playlist is: ${queueSourceInfo}`,
                /**
                 * @type {(queueSourceInfo:string)=>string}
                 */
                zh: queueSourceInfo =>
                    `当前播放列表为：${queueSourceInfo}`,
                /**
                 * @type {(queueSourceInfo:string)=>string}
                 */
                ja: queueSourceInfo =>
                    `現在のプレイリストは、${queueSourceInfo}です`,
            })(
                queueSourceGroupBy === 'all'
                    ? t({
                        en: `all songs in ${libraryType} library`,
                        zh: `${libraryType}曲库中的全部歌曲`,
                        ja: `${libraryType}ライブラリの全曲`,
                    })
                    : {
                        album: t({
                            en: `tracks from album "${queueSourceGroupName}" in ${libraryType} library`,
                            zh: `${libraryType}曲库下专辑《${queueSourceGroupName}》的曲目`,
                            ja: `${libraryType}ライブラリのアルバム「${queueSourceGroupName}」の曲`,
                        }),
                        artist: t({
                            en: `tracks by artist ${queueSourceGroupName} in ${libraryType} library`,
                            zh: `${libraryType}曲库下艺术家${queueSourceGroupName}的曲目`,
                            ja: `${libraryType}ライブラリのアーティスト${queueSourceGroupName}の曲`,
                        }),
                    }[queueSourceGroupBy],
            )
        },
        [queueSourceType, queueSourceGroupBy, queueSourceGroupName],
    )

    const screenReaderPrompt = useMemo(
        /**
         * @type {()=>string}
         */
        () =>
            Object.values(libraryPathIsFilled).some(isFilled =>
                isFilled)
                ? queueSourceNormalPrompt
                : t({
                    en: 'No available playlists',
                    zh: '当前没有可用的播放列表',
                    ja: '利用可能なプレイリストはありません',
                }),
        [queueSourceNormalPrompt, libraryPathIsFilled],
    )

    return {
        screenReaderPrompt,
    }
}