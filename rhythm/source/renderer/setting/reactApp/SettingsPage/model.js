import { useCurrentPage } from '../model'

/**
 * @type {()=>{
 * currentPage:import("../../index").PageKey,
 * }}
 */
export const useSettingsPage = () => {
    const { currentPage } = useCurrentPage()

    return {
        currentPage,
    }
}