interface Window {
    rhythm: {
        _self_: 'rhythm',
        controlWindow: <KEY extends import("../../main/util/type").BrowserWindowAllowedMethodKey>(
            key: KEY,
            ...args: Parameters<import("../../main/util/type").BrowserWindowMethods[KEY]>
        ) => Promise<undefined | ReturnType<import("../../main/util/type").BrowserWindowMethods[KEY]>>,
        openDevTools: (options?: Electron.OpenDevToolsOptions) => void,
        getAccentColor: () => Promise<string>,
        updateAccentColor: (updateAccentColorHandler: (
            event: Electron.IpcRendererEvent,
            accentColor: string,
        ) => void) => void,
    },
    process?: {
        env: { [key: string]: string },
    },
}