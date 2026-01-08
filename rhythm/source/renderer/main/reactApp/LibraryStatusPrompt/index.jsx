import { memo } from 'react'
import { libraryStatusPrompt } from './style'
import { useLibraryStatusPrompt } from './model'

/**
 * @type {React.FC<{}>}
 */
const LibraryStatusPrompt = () => {
    const { currentPageBasicInformationListStatusPrompt } =
        useLibraryStatusPrompt()

    return (
        <div css={libraryStatusPrompt} aria-hidden="true">
            {currentPageBasicInformationListStatusPrompt}
        </div>
    )
}

export default memo(LibraryStatusPrompt)