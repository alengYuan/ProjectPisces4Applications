import { memo } from 'react'
import { disclosurePanel, contentContainer } from './style'
import { useSettingsItemCollapsiblePanelMagazine } from './model'
import { DisclosurePanel } from 'react-aria-components'

/**
 * @type {React.FC<React.PropsWithChildren<{}>>}
 */
const SettingsItemCollapsiblePanelMagazine = props => {
    const { children } = useSettingsItemCollapsiblePanelMagazine(props)

    return (
        <DisclosurePanel css={disclosurePanel} role="region">
            <div css={contentContainer}>{children}</div>
        </DisclosurePanel>
    )
}

export default memo(SettingsItemCollapsiblePanelMagazine)