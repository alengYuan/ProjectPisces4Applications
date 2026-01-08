import { useEffect, useRef } from 'react'
import { switchTabPanel } from '../model'

/**
 * @type {()=>void}
 */
const openSettingGeneralPage = () => {
    window['rhythm::main'].openSettingPage()
}

/**
 * @type {()=>{
 * switchTabPanel:React.KeyboardEventHandler,
 * rebootInCoreMode:()=>void,
 * settingGeneralPageOpenJumpButtonRef:React.MutableRefObject<null|HTMLButtonElement>,
 * openSettingGeneralPage:()=>void,
 * }}
 */
export const useNavigationPlatform = () => {
    const settingGeneralPageOpenJumpButtonRef = useRef(
        /**
         * @type {null|HTMLButtonElement}
         */
        // eslint-disable-next-line no-extra-parens
        (null),
    )

    useEffect(() => {
        if (settingGeneralPageOpenJumpButtonRef.current) {
            settingGeneralPageOpenJumpButtonRef.current.tabIndex = 5
        }
    }, [])

    return {
        switchTabPanel,
        rebootInCoreMode: window['rhythm::main'].rebootInCoreMode,
        settingGeneralPageOpenJumpButtonRef,
        openSettingGeneralPage,
    }
}