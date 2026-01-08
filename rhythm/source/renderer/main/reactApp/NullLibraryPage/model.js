/**
 * @type {()=>void}
 */
const openSettingLibraryPage = () => {
    window['rhythm::main'].openSettingPage('library')
}

/**
 * @type {()=>{
 * openSettingLibraryPage:()=>void,
 * }}
 */
export const useNullLibraryPage = () =>
    ({
        openSettingLibraryPage,
    })