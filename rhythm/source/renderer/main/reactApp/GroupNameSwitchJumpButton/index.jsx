import { memo } from 'react'
import {
    inactiveGroupNameSwitchButton,
    buttonText,
    fluentRegular,
} from './style'
import { useGroupNameSwitchJumpButton } from './model'
import { Button } from 'react-aria-components'
import PlayingIndicatorForGroupNameSwitchJumpButton from '../PlayingIndicatorForGroupNameSwitchJumpButton/index.jsx'

/**
 * @type {React.FC<{}>}
 */
const GroupNameSwitchJumpButton = () => {
    const { recommendedGroupList, currentPageType, goToPage } =
        useGroupNameSwitchJumpButton()

    return recommendedGroupList.map(({ key, by, name }) =>

        <Button
            key={key}
            css={inactiveGroupNameSwitchButton}
            data-type={currentPageType}
            data-group-by={by}
            data-group-name={name}
            excludeFromTabOrder={true}
            onPress={goToPage}
        >
            <PlayingIndicatorForGroupNameSwitchJumpButton by={by} name={name} />
            <div css={buttonText}>{name}</div>
            <div css={fluentRegular} aria-hidden="true">
                
            </div>
        </Button>)
}

export default memo(GroupNameSwitchJumpButton)