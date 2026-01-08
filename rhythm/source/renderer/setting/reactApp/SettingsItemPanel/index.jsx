import { memo } from 'react'
import {
    itemPanel,
    itemIcon,
    informationContainer,
    itemTitle,
    itemDescription,
    actionArea,
} from './style'
import { useSettingsItemPanel } from './model'

/**
 * @type {React.FC<React.PropsWithChildren<{
 * icon:string,
 * title:string,
 * description:string,
 * }>>}
 */
const SettingsItemPanel = props => {
    const { icon, title, description, children } = useSettingsItemPanel(props)

    return (
        <div css={itemPanel}>
            <div css={itemIcon} aria-hidden="true">
                {icon}
            </div>
            <div css={informationContainer} aria-hidden="true">
                <div css={itemTitle}>{title}</div>
                <div css={itemDescription}>{description}</div>
            </div>
            <div css={actionArea}>{children}</div>
        </div>
    )
}

export default memo(SettingsItemPanel)