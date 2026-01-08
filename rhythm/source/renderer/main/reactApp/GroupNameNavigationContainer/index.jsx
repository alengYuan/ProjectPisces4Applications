import { memo } from 'react'
import { groupNameNavigationContainer } from './style'
import { useGroupNameNavigationContainer } from './model'
import { t } from '../../index'
import GroupNameSwitchButton from '../GroupNameSwitchButton/index.jsx'
import GroupNameSwitchJumpButton from '../GroupNameSwitchJumpButton/index.jsx'

/**
 * @type {React.FC<{}>}
 */
const GroupNameNavigationContainer = () => {
    const {
        groupNameNavigationContainerRef,
        currentPageGroupBy,
        switchTabPanel,
    } = useGroupNameNavigationContainer()

    return (
        <div
            ref={groupNameNavigationContainerRef}
            css={groupNameNavigationContainer}
            {...(currentPageGroupBy === 'all'
                ? {
                    'aria-hidden': 'true',
                }
                : {
                    'role': 'tablist',
                    'aria-label': t({
                        en: `All ${
                            {
                                album: 'albums',
                                artist: 'artists',
                            }[currentPageGroupBy]
                        }`,
                        zh: `全部${
                            {
                                album: '专辑',
                                artist: '艺术家',
                            }[currentPageGroupBy]
                        }`,
                        ja: `全部${
                            {
                                album: 'アルバム',
                                artist: 'アーティスト',
                            }[currentPageGroupBy]
                        }`,
                    }),
                    'aria-orientation': 'vertical',
                    'onKeyDown': switchTabPanel,
                })}
        >
            {currentPageGroupBy === 'all'
                ? <GroupNameSwitchJumpButton />
                : <GroupNameSwitchButton />
            }
        </div>
    )
}

export default memo(GroupNameNavigationContainer)