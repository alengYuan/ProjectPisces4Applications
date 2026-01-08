import { memo } from 'react'
import {
    disclosure,
    expandedDisclosureTrigger,
    collapsedDisclosureTrigger,
    disclosureIcon,
    informationContainer,
    disclosureTitle,
    disclosureDescription,
    disclosureStatus,
    disclosureIndicator,
    rotatedIndicator,
    normalIndicator,
} from './style'
import { useSettingsItemCollapsiblePanel } from './model'
import { Button, Disclosure } from 'react-aria-components'

/**
 * @type {React.FC<React.PropsWithChildren<{
 * isExpanded:boolean,
 * onPress:(event:import("react-aria-components").PressEvent)=>void,
 * icon:string,
 * title:string,
 * description:string,
 * status:string,
 * }>>}
 */
const SettingsItemCollapsiblePanel = props => {
    const {
        isExpanded,
        showDescriptionARIA,
        hideDescriptionARIA,
        onPress,
        icon,
        title,
        descriptionARIAIsHidden,
        description,
        status,
        children,
    } = useSettingsItemCollapsiblePanel(props)

    return (
        <Disclosure css={disclosure} isExpanded={isExpanded}>
            <Button
                css={
                    isExpanded
                        ? expandedDisclosureTrigger
                        : collapsedDisclosureTrigger
                }
                slot="trigger"
                onFocus={showDescriptionARIA}
                onBlur={hideDescriptionARIA}
                onPress={onPress}
            >
                <div css={disclosureIcon} aria-hidden="true">
                    {icon}
                </div>
                <div css={informationContainer}>
                    <div css={disclosureTitle}>{title}</div>
                    <div
                        css={disclosureDescription}
                        aria-hidden={descriptionARIAIsHidden}
                    >
                        {description}
                    </div>
                </div>
                <div css={disclosureStatus} aria-hidden="true">
                    {status}
                </div>
                <div css={disclosureIndicator} aria-hidden="true">
                    <div css={isExpanded ? rotatedIndicator : normalIndicator}>
                        
                    </div>
                </div>
            </Button>
            {children}
        </Disclosure>
    )
}

export default memo(SettingsItemCollapsiblePanel)