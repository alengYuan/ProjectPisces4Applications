import { memo } from 'react'
import { primaryButton } from './style'
import { useLibraryHeadContainerPrimaryButton } from './model'
import { t } from '../../index'
import { Button } from 'react-aria-components'

/**
 * @type {React.FC<{}>}
 */
const LibraryHeadContainerPrimaryButton = () => {
    const { ariaLabel, playFromHere } = useLibraryHeadContainerPrimaryButton()

    return (
        <Button
            css={primaryButton}
            aria-label={ariaLabel}
            onPress={playFromHere}
        >
            {t({
                en: 'Play all',
                zh: '播放全部',
                ja: 'すべて再生',
            })}
        </Button>
    )
}

export default memo(LibraryHeadContainerPrimaryButton)