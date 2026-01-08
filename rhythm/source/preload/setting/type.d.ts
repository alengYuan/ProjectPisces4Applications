interface Window {
    'rhythm::setting': {
        _self_: 'rhythm::setting',
        focusWindow: (focusWindowHandler: (
            event: Electron.IpcRendererEvent,
        ) => void) => () => void,
        blurWindow: (blurWindowHandler: (
            event: Electron.IpcRendererEvent,
        ) => void) => () => void,
        switchDialogVisibility: (isVisible: boolean) => void,
        getLanguage: () => Promise<'en' | 'zh' | 'ja'>,
        prePushPageStack: (prePushPageStackHandler: (
            event: Electron.IpcRendererEvent,
            page: 'library' | 'mode' | 'other' | 'about',
        ) => void) => () => void,
        preClearPageStack: (preClearPageStackHandler: (
            event: Electron.IpcRendererEvent,
        ) => void) => () => void,
        getSettingStorage: () => Promise<import("../../renderer/setting/index").SettingStorage>,
        updateSettingStorage: (updateSettingStorageHandler: (
            event: Electron.IpcRendererEvent,
            settingStorageItem: {
                [key in keyof import("../../renderer/setting/index").RewritableSettingStorage]:
                [key, import("../../renderer/setting/index").RewritableSettingStorage[key]]
            }[keyof import("../../renderer/setting/index").RewritableSettingStorage],
        ) => void) => () => void,
        setSettingStorage: <KEY extends keyof import("../../renderer/setting/index").SettingStorage>(
            key: KEY,
            value: import("../../renderer/setting/index").SettingStorage[KEY],
        ) => void,
        selectDirectoryPath: (title: string, confirmLabel?: string) => Promise<false | string>,
        popupInputContextMenu: (
            clientX: number,
            clientY: number,
            textIsSelected: boolean,
        ) => void,
        getKnownDeviceList: () => Promise<Array<{
            id: string,
            label: string,
        }>>,
        viewInFileExplorer: () => void,
        openURLWithProtocol: (protocolURL: string) => void,
        requestShowContent: (content: string) => void,
        cancelShowContent: () => void,
        notifyReady: () => void,
    },
}