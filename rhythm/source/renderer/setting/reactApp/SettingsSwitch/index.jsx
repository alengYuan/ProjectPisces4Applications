import { memo } from 'react'
import { settingsSwitch, switchStatus } from './style'
import { useSettingsSwitch } from './model'
import { Switch } from 'react-aria-components'

/**
 * @type {React.FC<{
 * ariaLabel:string,
 * isSelected:boolean,
 * onChange:(isSelected:boolean)=>void,
 * status:string,
 * }>}
 */
const SettingsSwitch = props => {
    const { ariaLabel, isSelected, onChange, status } = useSettingsSwitch(props)

    return (
        <Switch
            css={settingsSwitch}
            aria-label={ariaLabel}
            isSelected={isSelected}
            onChange={onChange}
        >
            <div css={switchStatus} aria-hidden="true">
                {status}
            </div>
            <div className="indicator" aria-hidden="true" />
        </Switch>
    )
}

export default memo(SettingsSwitch)