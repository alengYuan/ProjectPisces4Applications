import { memo } from 'react'
import {
    playerIndicator,
    informationContainer,
    songTitle,
    songArtist,
} from './style'
import { usePlayerIndicator } from './model'
import { t } from '../../index'
import TheOnePlaybackToggleButton from '../TheOnePlaybackToggleButton/index.jsx'

/**
 * @type {React.FC<{}>}
 */
const PlayerIndicator = () => {
    const { playerIndicatorTheme, title, artist } = usePlayerIndicator()

    return (
        <div css={playerIndicator} style={playerIndicatorTheme}>
            <TheOnePlaybackToggleButton title={title} artist={artist} />
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
        </div>
    )
}

export default memo(PlayerIndicator)