import { memo } from 'react'
import {
    coverCardContainer,
    highQualityDecoration,
    controlArea,
    informationContainer,
    songTitle,
    songArtist,
} from './style'
import { useCoverCard } from './model'
import { t } from '../../index'
import PlaybackToggleButton from '../PlaybackToggleButton/index.jsx'

/**
 * @type {React.FC<{
 * index:number,
 * themeCache:undefined|{
 * coverObjectURL:string,
 * colorScheme:{
 * colorOnPrimaryContainer:string,
 * colorPrimary:string,
 * colorOnPrimary:string,
 * },
 * },
 * type:'flac'|'mp3',
 * uuid:string,
 * size:number,
 * modified:number,
 * title:string,
 * artist:string,
 * depth?:number,
 * sample:number,
 * cover:string,
 * }>}
 */
const CoverCard = props => {
    const {
        coverCardContainerRef,
        coverCardTheme,
        isHighQuality,
        index,
        uuid,
        title,
        artist,
    } = useCoverCard(props)

    return (
        <div
            ref={coverCardContainerRef}
            className="cover-card-container"
            css={coverCardContainer}
            style={coverCardTheme}
        >
            {isHighQuality &&
                <img
                    css={highQualityDecoration}
                    aria-hidden="true"
                    src="./asset/image/high-quality-indicator.png"
                />
            }
            <div css={controlArea}>
                <div css={informationContainer}>
                    <div
                        css={songTitle}
                        title={
                            title ||
                            t({
                                en: 'Unknown Title',
                                zh: '未知标题',
                                ja: '不明なタイトル',
                            })
                        }
                        aria-hidden="true"
                    >
                        {title ||
                            t({
                                en: 'Unknown Title',
                                zh: '未知标题',
                                ja: '不明なタイトル',
                            })}
                    </div>
                    <div
                        css={songArtist}
                        title={
                            artist ||
                            t({
                                en: 'Unknown Artist',
                                zh: '未知艺术家',
                                ja: '不明なアーティスト',
                            })
                        }
                        aria-hidden="true"
                    >
                        {artist ||
                            t({
                                en: 'Unknown Artist',
                                zh: '未知艺术家',
                                ja: '不明なアーティスト',
                            })}
                    </div>
                </div>
                <PlaybackToggleButton
                    index={index}
                    uuid={uuid}
                    title={title}
                    artist={artist}
                />
            </div>
        </div>
    )
}

export default memo(CoverCard)