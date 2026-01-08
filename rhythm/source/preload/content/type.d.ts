interface Window {
    'rhythm::content': {
        _self_: 'rhythm::content',
        updateContent: (updateContentHandler: (
            event: Electron.IpcRendererEvent,
            content: string,
        ) => void) => void,
        updateWindowWidth: (width: number) => void,
        notifyReady: () => void,
    },
}