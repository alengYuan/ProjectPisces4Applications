import { memo } from 'react'
import {
    songRequestPlatform,
    readySongCandidatePlatform,
    unreadySongCandidatePlatform,
    songCandidateControlPanel,
    songCandidateEdgeSpace,
} from './style'
import { useSongRequestPlatform } from './model'
import LibraryPage from '../LibraryPage/index.jsx'
import NavigationPlatform from '../NavigationPlatform/index.jsx'
import NullLibraryPage from '../NullLibraryPage/index.jsx'

/**
 * @type {React.FC<{}>}
 */
const SongRequestPlatform = () => {
    const { currentPageType, currentLibraryPathIsFilled } =
        useSongRequestPlatform()

    return (
        <div
            id="song-request-platform"
            css={songRequestPlatform}
            role="tabpanel"
            aria-labelledby={`type-${currentPageType}`}
        >
            {currentLibraryPathIsFilled && <NavigationPlatform />}
            <div
                css={
                    currentLibraryPathIsFilled
                        ? readySongCandidatePlatform
                        : unreadySongCandidatePlatform
                }
            >
                <div css={songCandidateControlPanel}>
                    {currentLibraryPathIsFilled
                        ? <LibraryPage />
                        : <NullLibraryPage />
                    }
                </div>
                <div css={songCandidateEdgeSpace}></div>
            </div>
        </div>
    )
}

export default memo(SongRequestPlatform)