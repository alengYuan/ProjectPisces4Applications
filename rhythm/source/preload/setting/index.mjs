import { contextBridge, ipcRenderer } from 'electron'
import '../util/index.mjs'

contextBridge.exposeInMainWorld('rhythm::setting', {
    _self_: 'rhythm::setting',
    /**
     * @type {(focusWindowHandler:(event:Electron.IpcRendererEvent)=>void)=>()=>void}
     */
    focusWindow: focusWindowHandler => {
        ipcRenderer.on('rhythm::setting::focus-window', focusWindowHandler)

        return () => {
            ipcRenderer.off('rhythm::setting::focus-window', focusWindowHandler)
        }
    },
    /**
     * @type {(blurWindowHandler:(event:Electron.IpcRendererEvent)=>void)=>()=>void}
     */
    blurWindow: blurWindowHandler => {
        ipcRenderer.on('rhythm::setting::blur-window', blurWindowHandler)

        return () => {
            ipcRenderer.off('rhythm::setting::blur-window', blurWindowHandler)
        }
    },
    /**
     * @type {(isVisible:boolean)=>void}
     */
    switchDialogVisibility: isVisible =>
        ipcRenderer.send(
            'rhythm::setting::switch-dialog-visibility',
            isVisible,
        ),
    /**
     * @type {()=>Promise<'en'|'zh'|'ja'>}
     */
    getLanguage: () =>
        ipcRenderer.invoke('rhythm::setting::get-language'),
    /**
     * @type {(prePushPageStackHandler:(
     * event:Electron.IpcRendererEvent,
     * page:'library'|'mode'|'other'|'about',
     * )=>void)=>()=>void}
     */
    prePushPageStack: prePushPageStackHandler => {
        ipcRenderer.on(
            'rhythm::setting::pre-push-page-stack',
            prePushPageStackHandler,
        )

        return () => {
            ipcRenderer.off(
                'rhythm::setting::pre-push-page-stack',
                prePushPageStackHandler,
            )
        }
    },
    /**
     * @type {(preClearPageStackHandler:(event:Electron.IpcRendererEvent)=>void)=>()=>void}
     */
    preClearPageStack: preClearPageStackHandler => {
        ipcRenderer.on(
            'rhythm::setting::pre-clear-page-stack',
            preClearPageStackHandler,
        )

        return () => {
            ipcRenderer.off(
                'rhythm::setting::pre-clear-page-stack',
                preClearPageStackHandler,
            )
        }
    },
    /**
     * @type {()=>Promise<import("../../renderer/setting/index").SettingStorage>}
     */
    getSettingStorage: () =>
        ipcRenderer.invoke('rhythm::setting::get-setting-storage'),
    /**
     * @type {(updateSettingStorageHandler:(
     * event:Electron.IpcRendererEvent,
     * settingStorageItem:{
     * [key in keyof import("../../renderer/setting/index").RewritableSettingStorage]:
     * [key,import("../../renderer/setting/index").RewritableSettingStorage[key]]
     * }[keyof import("../../renderer/setting/index").RewritableSettingStorage],
     * )=>void)=>()=>void}
     */
    updateSettingStorage: updateSettingStorageHandler => {
        ipcRenderer.on(
            'rhythm::setting::update-setting-storage',
            updateSettingStorageHandler,
        )

        return () => {
            ipcRenderer.off(
                'rhythm::setting::update-setting-storage',
                updateSettingStorageHandler,
            )
        }
    },
    /**
     * @type {<KEY extends keyof import("../../renderer/setting/index").SettingStorage>(
     * key:KEY,
     * value:import("../../renderer/setting/index").SettingStorage[KEY],
     * )=>void}
     */
    setSettingStorage: (key, value) =>
        ipcRenderer.send('rhythm::setting::set-setting-storage', key, value),
    /**
     * @type {(title:string,confirmLabel?:string)=>Promise<false|string>}
     */
    selectDirectoryPath: (title, confirmLabel) =>
        ipcRenderer.invoke(
            'rhythm::setting::select-directory-path',
            title,
            confirmLabel,
        ),
    /**
     * @type {(
     * clientX:number,
     * clientY:number,
     * textIsSelected:boolean,
     * )=>void}
     */
    popupInputContextMenu: (clientX, clientY, textIsSelected) =>
        ipcRenderer.send(
            'rhythm::setting::popup-input-context-menu',
            clientX,
            clientY,
            textIsSelected,
        ),
    /**
     * @type {()=>Promise<Array<{
     * id:string,
     * label:string,
     * }>>}
     */
    getKnownDeviceList: () =>
        ipcRenderer.invoke('rhythm::setting::get-known-device-list'),
    /**
     * @type {()=>void}
     */
    viewInFileExplorer: () =>
        ipcRenderer.send('rhythm::setting::view-in-file-explorer'),
    /**
     * @type {(protocolURL:string)=>void}
     */
    openURLWithProtocol: protocolURL =>
        ipcRenderer.send(
            'rhythm::setting::open-url-with-protocol',
            protocolURL,
        ),
    /**
     * @type {(content:string)=>void}
     */
    requestShowContent: content =>
        ipcRenderer.send('rhythm::setting::request-show-content', content),
    /**
     * @type {()=>void}
     */
    cancelShowContent: () =>
        ipcRenderer.send('rhythm::setting::cancel-show-content'),
    /**
     * @type {()=>void}
     */
    notifyReady: () =>
        ipcRenderer.send('rhythm::interface::notify-ready'),
})