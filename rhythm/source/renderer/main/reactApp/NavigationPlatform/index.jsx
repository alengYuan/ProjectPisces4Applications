import { memo } from 'react'
import {
    navigationPlatform,
    groupByNavigationContainer,
    additionalNavigationContainer,
    ariaHiddenContainer,
    inactiveGroupNameSwitchButton,
    fluentRegular,
    buttonText,
} from './style'
import { useNavigationPlatform } from './model'
import { t } from '../../index'
import { Button } from 'react-aria-components'
import GroupBySwitchButton from '../GroupBySwitchButton/index.jsx'
import GroupNameNavigationContainer from '../GroupNameNavigationContainer/index.jsx'

/**
 * @type {React.FC<{}>}
 */
const NavigationPlatform = () => {
    const {
        switchTabPanel,
        rebootInCoreMode,
        settingGeneralPageOpenJumpButtonRef,
        openSettingGeneralPage,
    } = useNavigationPlatform()

    return (
        <div css={navigationPlatform}>
            <div
                css={groupByNavigationContainer}
                role="tablist"
                aria-label={t({
                    en: 'Group by',
                    zh: '分组依据',
                    ja: 'グループの種類',
                })}
                aria-orientation="horizontal"
                onKeyDown={switchTabPanel}
            >
                <GroupBySwitchButton />
            </div>
            <GroupNameNavigationContainer />
            <div css={additionalNavigationContainer}>
                <div css={ariaHiddenContainer} aria-hidden="true">
                    <Button
                        css={inactiveGroupNameSwitchButton}
                        excludeFromTabOrder={true}
                        onPress={rebootInCoreMode}
                    >
                        <div css={fluentRegular} aria-hidden="true">
                            
                        </div>
                        <div css={buttonText}>
                            {t({
                                en: 'Core mode',
                                zh: '核心模式',
                                ja: 'コアモード',
                            })}
                        </div>
                        <div css={fluentRegular} aria-hidden="true">
                            
                        </div>
                    </Button>
                </div>
                <Button
                    ref={settingGeneralPageOpenJumpButtonRef}
                    css={inactiveGroupNameSwitchButton}
                    onPress={openSettingGeneralPage}
                >
                    <div css={fluentRegular} aria-hidden="true">
                        
                    </div>
                    <div css={buttonText}>
                        {t({
                            en: 'Settings',
                            zh: '设置',
                            ja: '設定',
                        })}
                    </div>
                    <div css={fluentRegular} aria-hidden="true">
                        
                    </div>
                </Button>
            </div>
        </div>
    )
}

export default memo(NavigationPlatform)