import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('rhythm', {
    _self_: 'rhythm',
    /**
     * @type {<KEY extends import("../../main/util/type").BrowserWindowAllowedMethodKey>(
     * key:KEY,
     * ...args:Parameters<import("../../main/util/type").BrowserWindowMethods[KEY]>
     * )=>Promise<undefined|ReturnType<import("../../main/util/type").BrowserWindowMethods[KEY]>>}
     */
    controlWindow: (key, ...args) =>
        ipcRenderer.invoke('control-window', key, ...args),
    /**
     * @type {(options?:Electron.OpenDevToolsOptions)=>void}
     */
    openDevTools: options =>
        ipcRenderer.send('open-dev-tools', options),
    /**
     * @type {()=>Promise<string>}
     */
    getAccentColor: () =>
        ipcRenderer.invoke('get-accent-color'),
    /**
     * @type {(updateAccentColorHandler:(event:Electron.IpcRendererEvent,accentColor:string)=>void)=>void}
     */
    updateAccentColor: updateAccentColorHandler => {
        ipcRenderer.on('update-accent-color', updateAccentColorHandler)
    },
})

const isDevMode = 'dev_mode' in process.env

/**
 * @type {{env:{[key:string]:string}}}
 */
const processAPI = {
    env: {
        dev_mode: String(isDevMode),
    },
}

if (!isDevMode) {
    delete processAPI.env.dev_mode
}

contextBridge.exposeInMainWorld('process', processAPI)