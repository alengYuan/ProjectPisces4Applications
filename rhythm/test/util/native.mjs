import {
    requestDynamicLibrary as requestPlayerDynamicLibrary,
    DeviceManager,
} from '../../source/main/service/basicPlayer.mjs'
import {
    requestDynamicLibrary as requestSMTCDynamicLibrary,
    SMTC,
} from '../../source/main/service/basicSMTC.mjs'

const playerModule = requestPlayerDynamicLibrary(
    import.meta.url,
    '../../module',
)

const smtcModule = requestSMTCDynamicLibrary(import.meta.url, '../../module')

/**
 * @type {(category:'all'|'active')=>Array<{
 * id:string,
 * label:string,
 * }>}
 */
export const requestDeviceList = category =>
    playerModule.requestDeviceList(category)

/**
 * @type {()=>DeviceManager}
 */
export const requestDeviceManager = () =>
    new DeviceManager(playerModule.DeviceManager)

/**
 * @type {()=>SMTC}
 */
export const requestSMTC = () =>
    new SMTC(smtcModule.SMTC)