import { app, nativeTheme } from 'electron'
import { SMTC as BasicSMTC, moduleWrapper } from './basicSMTC.mjs'

const isDevMode = 'dev_mode' in process.env

export class SMTC extends BasicSMTC {
    /**
     * @override
     * @param {{
     * title:string,
     * artist:string,
     * thumbnail:string,
     * }} metadata
     */
    // eslint-disable-next-line accessor-pairs
    set metadata({ title, artist, thumbnail }) {
        super.metadata = {
            title,
            artist,
            thumbnail: thumbnail
                ? `${
                    isDevMode
                        ? 'http://localhost:7986/user-data/'
                        : 'ms-appdata:///local/'
                }${encodeURI(
                    thumbnail.replaceAll('\\', '/').replace(
                        (() => {
                            let rootPath = app
                                .getPath('userData')
                                .replaceAll('\\', '/')
                            if (!rootPath.endsWith('/')) {
                                rootPath = `${rootPath}/`
                            }

                            return rootPath
                        })(),
                        '',
                    ),
                )}`
                : `${
                    isDevMode
                        ? 'http://localhost:7986/app-asset/'
                        : 'ms-appx:///resources/app/source/asset/'
                }image/theme-${
                    nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
                }-default-cover.jpg`,
        }
    }
}

/**
 * @type {()=>string}
 */
export const requestLocalStatePath = () =>
    moduleWrapper.core.requestLocalStatePath()

/**
 * @type {()=>SMTC}
 */
export const requestSMTC = () =>
    new SMTC(moduleWrapper.core.SMTC)