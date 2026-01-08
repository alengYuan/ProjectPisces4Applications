import { switchTabPanel } from '../model'

/**
 * @type {()=>{
 * switchTabPanel:React.KeyboardEventHandler,
 * }}
 */
export const useTitleBarContent = () =>
    ({
        switchTabPanel,
    })