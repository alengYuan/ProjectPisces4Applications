import { memo } from 'react'
import {
    emptyLibraryPage,
    libraryPage,
    emptyLibraryContentContainer,
    illustrationEmptyContainer,
    emptyLibraryPrompt,
    libraryHeadContainer,
} from './style'
import { useLibraryPage } from './model'
import { t } from '../../index'
import LibraryContentContainer from '../LibraryContentContainer/index.jsx'
import LibraryHeadContainerPrimaryButton from '../LibraryHeadContainerPrimaryButton/index.jsx'
import LibraryStatusPrompt from '../LibraryStatusPrompt/index.jsx'
import LibraryTitle from '../LibraryTitle/index.jsx'
import Spinner from '../Spinner/index.jsx'
import IllustrationEmpty from '../svg/IllustrationEmpty/index.jsx'

/**
 * @type {React.FC<{}>}
 */
const LibraryPage = () => {
    const {
        currentPageBasicInformationListIsReallyEmpty,
        currentPageGroupBy,
        currentPageGroupName,
    } = useLibraryPage()

    return (
        <div
            id="library-page"
            css={
                currentPageBasicInformationListIsReallyEmpty
                    ? emptyLibraryPage
                    : libraryPage
            }
            role="tabpanel"
            aria-labelledby={`group-by-${currentPageGroupBy}${
                currentPageGroupBy === 'all'
                    ? ''
                    : ` group-name-${currentPageGroupName.replace(/\s/gu, '_')}`
            }`}
        >
            {currentPageBasicInformationListIsReallyEmpty
                ? <div css={emptyLibraryContentContainer}>
                    <div css={illustrationEmptyContainer}>
                        <IllustrationEmpty />
                    </div>
                    <p css={emptyLibraryPrompt} tabIndex={0}>
                        {t({
                            en: "We couldn't find anything",
                            zh: '我们未能找到任何内容',
                            ja: '何も見つかりませんでした',
                        })}
                    </p>
                </div>
                : <>
                    <Spinner />
                    <div css={libraryHeadContainer}>
                        <LibraryTitle />
                        <LibraryStatusPrompt />
                        <LibraryHeadContainerPrimaryButton />
                    </div>
                    <LibraryContentContainer />
                </>
            }
        </div>
    )
}

export default memo(LibraryPage)