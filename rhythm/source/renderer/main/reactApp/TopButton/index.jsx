import { memo } from 'react'
import { focusedTopButton, blurredTopButton, fluentRegular } from './style'
import { useTopButton } from './model'
import { t } from '../../index'
import { Button } from 'react-aria-components'

/**
 * @type {React.FC<{}>}
 */
const TopButton = () => {
    const { windowIsFocused, switchSceneMode, handleSwitchSceneModeTooltip } =
        useTopButton()

    return (
        <Button
            css={windowIsFocused ? focusedTopButton : blurredTopButton}
            aria-label={t({
                en: 'Switch scene mode',
                zh: '切换情景模式',
                ja: 'シーンモードを切り替え',
            })}
            aria-haspopup="menu"
            onPress={switchSceneMode}
            onHoverChange={handleSwitchSceneModeTooltip}
        >
            <div css={fluentRegular} aria-hidden="true">
                󰓟
            </div>
        </Button>
    )
}

export default memo(TopButton)