import { memo } from 'react'
import { backButton, segoe } from './style'
import { useBackButton } from './model'
import { t } from '../../index'
import { Button } from 'react-aria-components'

/**
 * @type {React.FC<{}>}
 */
const BackButton = () => {
    const { pageStackIsEmpty, popPageStack, handlePopPageStackTooltip } =
        useBackButton()

    return (
        <Button
            css={backButton}
            aria-label={t({
                en: 'Back',
                zh: '后退',
                ja: '戻る',
            })}
            isDisabled={pageStackIsEmpty}
            onPress={popPageStack}
            onHoverChange={handlePopPageStackTooltip}
        >
            <div className="icon-container">
                <div css={segoe} aria-hidden="true">
                    
                </div>
            </div>
        </Button>
    )
}

export default memo(BackButton)