import { memo } from 'react'
import { activeTypeSwitchButton, inactiveTypeSwitchButton } from './style'
import { useTypeSwitchButton } from './model'
import TabSwitchButton from '../TabSwitchButton/index.jsx'

/**
 * @type {React.FC<{}>}
 */
const TypeSwitchButton = () => {
    const { currentPageType, goToPage } = useTypeSwitchButton()

    return (
        <>
            <TabSwitchButton
                id="type-flac"
                css={
                    currentPageType === 'flac'
                        ? activeTypeSwitchButton
                        : inactiveTypeSwitchButton
                }
                tabIndex={currentPageType === 'flac' ? 0 : -1}
                aria-selected={currentPageType === 'flac'}
                aria-controls="song-request-platform"
                data-type="flac"
                data-group-by="all"
                data-group-name=""
                onPress={goToPage}
            >
                FLAC
            </TabSwitchButton>
            <TabSwitchButton
                id="type-mp3"
                css={
                    currentPageType === 'mp3'
                        ? activeTypeSwitchButton
                        : inactiveTypeSwitchButton
                }
                tabIndex={currentPageType === 'mp3' ? 0 : -1}
                aria-selected={currentPageType === 'mp3'}
                aria-controls="song-request-platform"
                data-type="mp3"
                data-group-by="all"
                data-group-name=""
                onPress={goToPage}
            >
                MP3
            </TabSwitchButton>
        </>
    )
}

export default memo(TypeSwitchButton)