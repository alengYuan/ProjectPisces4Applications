import { useCurrentPageBasicInformationListIsLoading } from '../model'

/**
 * @type {()=>{
 * currentPageBasicInformationListIsLoading:boolean,
 * }}
 */
export const useSpinner = () => {
    const { currentPageBasicInformationListIsLoading } =
        useCurrentPageBasicInformationListIsLoading()

    return {
        currentPageBasicInformationListIsLoading,
    }
}