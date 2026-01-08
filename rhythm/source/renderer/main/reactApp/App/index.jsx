import { memo } from 'react'
import {
    app,
    titleBar,
    titleNavigationContainer,
    additionalControllerContainer,
    refreshButton,
    fluentRegular,
    typeNavigationContainer,
    topButtonGroupContainer,
    body,
    controlBar,
    controlButtonGroupContainer,
} from './style'
import { useApp } from './model'
import { t } from '../../index'
import { Button } from 'react-aria-components'
import BackButton from '../BackButton/index.jsx'
import Core from '../Core/index.jsx'
import OrderLoopSwitchButton from '../OrderLoopSwitchButton/index.jsx'
import OrderModeSwitchButton from '../OrderModeSwitchButton/index.jsx'
import PlayerIndicator from '../PlayerIndicator/index.jsx'
import ProgressUpdateBar from '../ProgressUpdateBar/index.jsx'
import QueueSourceIndicator from '../QueueSourceIndicator/index.jsx'
import SongRequestPlatform from '../SongRequestPlatform/index.jsx'
import Title from '../Title/index.jsx'
import TopButton from '../TopButton/index.jsx'
import TrackSwitchButton from '../TrackSwitchButton/index.jsx'
import TypeSwitchButton from '../TypeSwitchButton/index.jsx'
import VolumeUpdateBar from '../VolumeUpdateBar/index.jsx'

/**
 * @type {React.FC<{}>}
 */
const App = () => {
    const { rescanLibrary, handleRescanLibraryTooltip, switchTabPanel } =
        useApp()

    return (
        <div css={app}>
            <Core />
            <div css={titleBar}>
                <div css={titleNavigationContainer}>
                    <BackButton />
                    <Title />
                </div>
                <div css={topButtonGroupContainer}>
                    <TopButton />
                </div>
                <div css={additionalControllerContainer}>
                    <Button
                        css={refreshButton}
                        aria-label={t({
                            en: 'Rescan library',
                            zh: '重新扫描库',
                            ja: 'ライブラリ再スキャン',
                        })}
                        onPress={rescanLibrary}
                        onHoverChange={handleRescanLibraryTooltip}
                    >
                        <div css={fluentRegular} aria-hidden="true">
                            
                        </div>
                    </Button>
                    <div
                        css={typeNavigationContainer}
                        role="tablist"
                        aria-label={t({
                            en: 'Library type',
                            zh: '库类型',
                            ja: 'ライブラリの種類',
                        })}
                        aria-orientation="horizontal"
                        onKeyDown={switchTabPanel}
                    >
                        <TypeSwitchButton />
                    </div>
                </div>
            </div>
            <div css={body}>
                <SongRequestPlatform />
                <QueueSourceIndicator />
                <div css={controlBar}>
                    <div css={controlButtonGroupContainer}>
                        <TrackSwitchButton target="previous" />
                        <ProgressUpdateBar />
                        <TrackSwitchButton target="next" />
                        <OrderModeSwitchButton />
                        <OrderLoopSwitchButton />
                        <VolumeUpdateBar />
                    </div>
                    <PlayerIndicator />
                </div>
            </div>
        </div>
    )
}

export default memo(App)