import { memo } from 'react'
import {
    nullLibraryPage,
    nullLibraryContentContainer,
    textNullContainer,
    nullLibraryPrompt,
    primaryButton,
    illustrationNullContainer,
} from './style'
import { useNullLibraryPage } from './model'
import { t } from '../../index'
import { Button } from 'react-aria-components'
import IllustrationNull from '../svg/IllustrationNull/index.jsx'

const NullLibraryPage = () => {
    const { openSettingLibraryPage } = useNullLibraryPage()

    return (
        <div css={nullLibraryPage}>
            <div css={nullLibraryContentContainer}>
                <div css={textNullContainer}>
                    <p css={nullLibraryPrompt} tabIndex={0}>
                        {t({
                            en: "Oops! You haven't specified the library path",
                            zh: '哎呀！您还没有指定媒体库的位置',
                            ja: 'あらら！ライブラリのパスが指定されていません',
                        })}
                    </p>
                    <Button
                        css={primaryButton}
                        onPress={openSettingLibraryPage}
                    >
                        {t({
                            en: 'Set library path in Settings',
                            zh: '前往设置以指定库路径',
                            ja: '設定からライブラリパスを指定',
                        })}
                    </Button>
                </div>
                <div css={illustrationNullContainer}>
                    <IllustrationNull />
                </div>
            </div>
        </div>
    )
}

export default memo(NullLibraryPage)