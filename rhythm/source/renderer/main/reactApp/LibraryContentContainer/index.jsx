import { memo } from 'react'
import {
    loadingLibraryContentContainer,
    loadedLibraryContentContainer,
} from './style'
import {
    useLibraryContentContainer,
    IntersectionObserverSetOfThemeUpdateChanceGetContext,
    CursorIndexContext,
} from './model'
import { t } from '../../index'
import LibraryCardContainer from '../LibraryCardContainer/index.jsx'

/**
 * @type {React.FC<{}>}
 */
const LibraryContentContainer = () => {
    const {
        libraryContentContainerRef,
        currentPageBasicInformationListIsLoading,
        cursorIndex,
        handleListFocus,
        handleListBlur,
        switchCardButton,
        intersectionObserverSetOfThemeUpdateChanceGet,
    } = useLibraryContentContainer()

    return (
        <div
            ref={libraryContentContainerRef}
            css={
                currentPageBasicInformationListIsLoading
                    ? loadingLibraryContentContainer
                    : loadedLibraryContentContainer
            }
            tabIndex={cursorIndex === -1 ? 0 : -1}
            role="menu"
            aria-label={t({
                en: 'Candidate song menu',
                zh: '候选歌曲菜单',
                ja: '候補曲メニュー',
            })}
            onFocus={handleListFocus}
            onBlur={handleListBlur}
            onKeyDown={switchCardButton}
        >
            <IntersectionObserverSetOfThemeUpdateChanceGetContext.Provider
                value={intersectionObserverSetOfThemeUpdateChanceGet}
            >
                <CursorIndexContext.Provider value={cursorIndex}>
                    <LibraryCardContainer />
                </CursorIndexContext.Provider>
            </IntersectionObserverSetOfThemeUpdateChanceGetContext.Provider>
        </div>
    )
}

export default memo(LibraryContentContainer)