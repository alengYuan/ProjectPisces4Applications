import { memo } from 'react'
import { app, body } from './style'
import { useApp } from './model'
import Core from '../Core/index.jsx'
import SettingsPage from '../SettingsPage/index.jsx'
import TitleBar from '../TitleBar/index.jsx'

/**
 * @type {React.FC<{}>}
 */
const App = () => {
    const { bodyRef } = useApp()

    return (
        <div css={app}>
            <Core />
            <TitleBar />
            <div ref={bodyRef} css={body}>
                <SettingsPage />
            </div>
        </div>
    )
}

export default memo(App)