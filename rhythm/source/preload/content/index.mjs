import { contextBridge, ipcRenderer } from 'electron'
import '../util/index.mjs'

contextBridge.exposeInMainWorld('rhythm::content', {
    _self_: 'rhythm::content',
    /**
     * @type {(updateContentHandler:(
     * event:Electron.IpcRendererEvent,
     * content:string,
     * )=>void)=>void}
     */
    updateContent: updateContentHandler => {
        ipcRenderer.on('rhythm::content::update-content', updateContentHandler)
    },
    /**
     * @type {(width:number)=>void}
     */
    updateWindowWidth: width =>
        ipcRenderer.send('rhythm::content::update-window-width', width),
    /**
     * @type {()=>void}
     */
    notifyReady: () =>
        ipcRenderer.send('rhythm::interface::notify-ready'),
})