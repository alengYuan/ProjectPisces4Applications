import { useCurrentPage, useGoToPage } from '../model'

/**
 * @type {()=>{
 * currentPage:import("../../index").PageKey,
 * goToPage:(event:import("react-aria-components").PressEvent)=>void,
 * }}
 */
export const usePageKeySwitchButton = () => {
    const { currentPage } = useCurrentPage()

    const { goToPage } = useGoToPage()

    return {
        currentPage,
        goToPage,
    }
}