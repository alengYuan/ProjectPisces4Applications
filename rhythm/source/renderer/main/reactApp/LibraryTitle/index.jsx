import { memo } from 'react'
import { libraryTitle } from './style'
import { useLibraryTitle } from './model'
import { t } from '../../index'

/**
 * @type {React.FC<{}>}
 */
const LibraryTitle = () => {
    const { currentPageGroupName } = useLibraryTitle()

    return (
        <div css={libraryTitle} aria-hidden="true">
            {currentPageGroupName ||
                t({
                    en: 'All',
                    zh: '全部',
                    ja: '全て',
                })}
        </div>
    )
}

export default memo(LibraryTitle)