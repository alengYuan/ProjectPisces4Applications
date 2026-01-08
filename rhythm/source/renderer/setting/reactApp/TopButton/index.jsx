import { memo } from 'react'
import { focusedTopButton, blurredTopButton, fluentFilled } from './style'
import { useTopButton } from './model'
import { t } from '../../index'
import { Button } from 'react-aria-components'

/**
 * @type {React.FC<{}>}
 */
const TopButton = () => {
    const {
        windowIsFocused,
        viewInFileExplorer,
        handleViewInFileExplorerTooltip,
    } = useTopButton()

    return (
        <Button
            css={windowIsFocused ? focusedTopButton : blurredTopButton}
            aria-label={t({
                en: 'View in File Explorer',
                zh: '在文件资源管理器中查看',
                ja: 'エクスプローラーで表示',
            })}
            onPress={viewInFileExplorer}
            onHoverChange={handleViewInFileExplorerTooltip}
        >
            <div css={fluentFilled} aria-hidden="true">
                
            </div>
        </Button>
    )
}

export default memo(TopButton)