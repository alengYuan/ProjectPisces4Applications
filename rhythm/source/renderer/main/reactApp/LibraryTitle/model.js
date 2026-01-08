import { useCurrentPageGroupName } from '../model'

/**
 * @type {()=>{
 * currentPageGroupName:string,
 * }}
 */
export const useLibraryTitle = () => {
    const { currentPageGroupName } = useCurrentPageGroupName()

    return {
        currentPageGroupName,
    }
}