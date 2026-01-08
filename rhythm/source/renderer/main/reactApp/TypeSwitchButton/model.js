import { useCurrentPageType, useGoToPage } from '../model'

/**
 * @type {()=>{
 * currentPageType:'flac'|'mp3',
 * goToPage:(event:import("react-aria-components").PressEvent)=>void,
 * }}
 */
export const useTypeSwitchButton = () => {
    const { currentPageType } = useCurrentPageType()

    const { goToPage } = useGoToPage()

    return {
        currentPageType,
        goToPage,
    }
}