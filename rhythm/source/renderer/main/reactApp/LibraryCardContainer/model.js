import { useCurrentPageBasicInformationList } from '../model'

/**
 * @type {()=>{
 * currentPageBasicInformationList:Array<{
 * type:'flac'|'mp3',
 * uuid:string,
 * size:number,
 * modified:number,
 * title:string,
 * artist:string,
 * album:string,
 * length:number,
 * bit:number,
 * depth?:number,
 * sample:number,
 * cover:string,
 * }>,
 * }}
 */
export const useLibraryCardContainer = () => {
    const { currentPageBasicInformationList } =
        useCurrentPageBasicInformationList()

    return {
        currentPageBasicInformationList,
    }
}