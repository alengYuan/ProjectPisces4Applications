import { memo } from 'react'
import {
    activeGroupNameSwitchButton,
    inactiveGroupNameSwitchButton,
    buttonText,
} from './style'
import { useGroupNameSwitchButton } from './model'
import PlayingIndicatorForGroupNameSwitchButton from '../PlayingIndicatorForGroupNameSwitchButton/index.jsx'
import TabSwitchButton from '../TabSwitchButton/index.jsx'

/**
 * @type {React.FC<{}>}
 */
const GroupNameSwitchButton = () => {
    const {
        groupNameList,
        currentPageGroupName,
        currentPageType,
        currentPageGroupBy,
        goToPage,
    } = useGroupNameSwitchButton()

    return groupNameList.map(groupName =>

        <TabSwitchButton
            key={groupName}
            id={`group-name-${groupName.replace(/\s/gu, '_')}`}
            css={
                currentPageGroupName === groupName
                    ? activeGroupNameSwitchButton
                    : inactiveGroupNameSwitchButton
            }
            tabIndex={currentPageGroupName === groupName ? 0 : -1}
            aria-selected={currentPageGroupName === groupName}
            aria-controls="library-page"
            data-type={currentPageType}
            data-group-by={currentPageGroupBy}
            data-group-name={groupName}
            onPress={goToPage}
        >
            <PlayingIndicatorForGroupNameSwitchButton groupName={groupName} />
            <div css={buttonText}>{groupName}</div>
        </TabSwitchButton>)
}

export default memo(GroupNameSwitchButton)