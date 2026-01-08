import { memo } from 'react'
import { libraryCardContainer } from './style'
import { useLibraryCardContainer } from './model'
import { tryGetThemeCache } from '../../coverCardThemeManager'
import CoverCard from '../CoverCard/index.jsx'
import SkeletonPlaceholder from '../SkeletonPlaceholder/index.jsx'

/**
 * @type {React.FC<{}>}
 */
const LibraryCardContainer = () => {
    const { currentPageBasicInformationList } = useLibraryCardContainer()

    return currentPageBasicInformationList.map(
        (
            { type, uuid, size, modified, title, artist, depth, sample, cover },
            index,
        ) =>

            <div key={uuid} css={libraryCardContainer}>
                <CoverCard
                    index={index}
                    themeCache={tryGetThemeCache(
                        `${type}::${cover}::${size}-${modified}`,
                    )}
                    type={type}
                    uuid={uuid}
                    size={size}
                    modified={modified}
                    title={title}
                    artist={artist}
                    depth={depth}
                    sample={sample}
                    cover={cover}
                />
                <SkeletonPlaceholder />
            </div>
        ,
    )
}

export default memo(LibraryCardContainer)