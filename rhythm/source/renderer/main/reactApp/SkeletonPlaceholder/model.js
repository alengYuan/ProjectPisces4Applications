import { useCurrentPageBasicInformationListIsLoading } from '../model'

/**
 * @type {()=>{
 * currentPageBasicInformationListIsLoading:boolean,
 * }}
 */
export const useSkeletonPlaceholder = () => {
    const { currentPageBasicInformationListIsLoading } =
        useCurrentPageBasicInformationListIsLoading()

    return {
        currentPageBasicInformationListIsLoading,
    }
}