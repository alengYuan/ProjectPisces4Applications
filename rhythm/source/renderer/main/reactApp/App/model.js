import { useTooltip, switchTabPanel } from '../model'
import { t } from '../../index'

/**
 * @type {()=>{
 * rescanLibrary:()=>void,
 * handleRescanLibraryTooltip:(isHovering:boolean)=>void,
 * switchTabPanel:React.KeyboardEventHandler,
 * }}
 */
export const useApp = () => {
    const { onHoverChange: handleRescanLibraryTooltip } = useTooltip(
        t({
            en: 'Rescan library',
            zh: '重新扫描库',
            ja: 'ライブラリ再スキャン',
        }),
    )

    return {
        rescanLibrary: window['rhythm::main'].rescanLibrary,
        handleRescanLibraryTooltip,
        switchTabPanel,
    }
}