import { DeviceManager, Player, moduleWrapper } from './basicPlayer.mjs'
export { DeviceManager, Player }

/**
 * @type {(category:'all'|'active')=>Array<{
 * id:string,
 * label:string,
 * }>}
 */
export const requestDeviceList = category =>
    moduleWrapper.core.requestDeviceList(category)

/**
 * @type {()=>DeviceManager}
 */
export const requestDeviceManager = () =>
    new DeviceManager(moduleWrapper.core.DeviceManager)

/**
 * @type {()=>Player}
 */
export const requestPlayer = () =>
    new Player(moduleWrapper.core.Player)