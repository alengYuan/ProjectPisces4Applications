import { memo } from 'react'
import { versionText } from './style'
import { useItemAbout } from './model'
import SettingsItemPanel from '../SettingsItemPanel/index.jsx'

/**
 * @type {React.FC<{}>}
 */
const ItemAbout = () => {
    const { applicationFullName, copyright, ariaLabel, version } =
        useItemAbout()

    return (
        <SettingsItemPanel
            icon=""
            title={applicationFullName}
            description={copyright}
        >
            <div css={versionText} tabIndex={0} aria-label={ariaLabel}>
                <span aria-hidden="true">{version}</span>
            </div>
        </SettingsItemPanel>
    )
}

export default memo(ItemAbout)