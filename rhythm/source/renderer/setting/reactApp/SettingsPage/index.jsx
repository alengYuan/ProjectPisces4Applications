import { memo } from 'react'
import { settingsPage } from './style'
import { useSettingsPage } from './model'
import ItemAbout from '../ItemAbout/index.jsx'
import ItemGeneralLanguage from '../ItemGeneralLanguage/index.jsx'
import ItemGeneralTray from '../ItemGeneralTray/index.jsx'
import ItemLibraryPathFLAC from '../ItemLibraryPathFLAC/index.jsx'
import ItemLibraryPathMP3 from '../ItemLibraryPathMP3/index.jsx'
import ItemModeCandidate from '../ItemModeCandidate/index.jsx'
import ItemOtherRemote from '../ItemOtherRemote/index.jsx'
import ItemOtherRuleArtistIdentify from '../ItemOtherRuleArtistIdentify/index.jsx'
import ItemOtherRuleArtistSplit from '../ItemOtherRuleArtistSplit/index.jsx'

/**
 * @type {React.FC<{}>}
 */
const SettingsPage = () => {
    const { currentPage } = useSettingsPage()

    return (
        <div
            id="settings-page"
            css={settingsPage}
            role="tabpanel"
            aria-labelledby={`page-key-${currentPage}`}
        >
            {currentPage === 'general' &&
                <>
                    <ItemGeneralLanguage />
                    <ItemGeneralTray />
                </>
            }
            {currentPage === 'library' &&
                <>
                    <ItemLibraryPathFLAC />
                    <ItemLibraryPathMP3 />
                </>
            }
            {currentPage === 'mode' &&
                <>
                    <ItemModeCandidate />
                </>
            }
            {currentPage === 'other' &&
                <>
                    <ItemOtherRuleArtistSplit />
                    <ItemOtherRuleArtistIdentify />
                    <ItemOtherRemote />
                </>
            }
            {currentPage === 'about' &&
                <>
                    <ItemAbout />
                </>
            }
        </div>
    )
}

export default memo(SettingsPage)