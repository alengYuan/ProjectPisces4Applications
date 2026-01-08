interface Window {
    'rhythm::main': {
        _self_: 'rhythm::main',
        rebootInCoreMode: () => void,
        focusWindow: (focusWindowHandler: (
            event: Electron.IpcRendererEvent,
        ) => void) => () => void,
        blurWindow: (blurWindowHandler: (
            event: Electron.IpcRendererEvent,
        ) => void) => () => void,
        getCoverRootPath: () => Promise<string>,
        getLanguage: () => Promise<'en' | 'zh' | 'ja'>,
        getLibraryPathState: () => Promise<{
            [type in 'flac' | 'mp3']: {
                isFilled: boolean,
            }
        }>,
        updateLibraryPathState: (updateLibraryPathStateHandler: (
            event: Electron.IpcRendererEvent,
            libraryPathState: {
                [type in 'flac' | 'mp3']: {
                    isFilled: boolean,
                }
            },
        ) => void) => () => void,
        getCurrentModeVolume: () => Promise<number>,
        updateCurrentModeVolume: (updateCurrentModeVolumeHandler: (
            event: Electron.IpcRendererEvent,
            currentModeVolume: number,
        ) => void) => () => void,
        setCurrentModeVolume: (volume: number) => void,
        getQueueOrderMode: () => Promise<'sequential' | 'shuffle' | 'random'>,
        changeQueueOrderMode: (changeQueueOrderModeHandler: (
            event: Electron.IpcRendererEvent,
            queueOrderMode: 'sequential' | 'shuffle' | 'random',
        ) => void) => () => void,
        getQueueOrderLoop: () => Promise<'all' | 'single' | 'off'>,
        changeQueueOrderLoop: (changeQueueOrderLoopHandler: (
            event: Electron.IpcRendererEvent,
            queueOrderLoop: 'all' | 'single' | 'off',
        ) => void) => () => void,
        updateLibraryDatabase: (updateLibraryDatabaseHandler: (
            event: Electron.IpcRendererEvent,
        ) => void) => () => void,
        getLibraryGroup: () => Promise<{
            [type in 'flac' | 'mp3']: {
                [by in 'album' | 'artist']: Array<string>
            }
        }>,
        updateLibraryGroup: (updateLibraryGroupHandler: (
            event: Electron.IpcRendererEvent,
            libraryGroup: {
                [type in 'flac' | 'mp3']: {
                    [by in 'album' | 'artist']: Array<string>
                }
            },
        ) => void) => () => void,
        getBasicInformationListUnderGroup: (type: 'flac' | 'mp3', group: 'all' | {
            by: 'album' | 'artist',
            name: string,
        }) => Promise<Array<{
            type: 'flac' | 'mp3',
            uuid: string,
            size: number,
            modified: number,
            title: string,
            artist: string,
            album: string,
            length: number,
            bit: number,
            depth?: number,
            sample: number,
            cover: string,
        }>>,
        getDetailedInformationWithUUID: <TYPE extends 'flac' | 'mp3'>(type: TYPE, uuid: string) => Promise<undefined | {
            flac: {
                uuid: string,
                name: string,
                size: number,
                modified: number,
                title: string,
                artist: string,
                album: string,
                length: number,
                bit: number,
                depth: number,
                sample: number,
                cover: string,
                record: string,
                track: string,
                year: string,
                genre: string,
                artists: string,
                composer: string,
                lyricist: string,
                copyright: string,
                isrc: string,
            },
            mp3: {
                uuid: string,
                name: string,
                size: number,
                modified: number,
                title: string,
                artist: string,
                album: string,
                length: number,
                bit: number,
                sample: number,
                cover: string,
            },
        }[TYPE]>,
        getQueueSource: () => Promise<['flac' | 'mp3', 'all' | {
            by: 'album' | 'artist',
            name: string,
        }]>,
        updateQueueSource: (updateQueueSourceHandler: (
            event: Electron.IpcRendererEvent,
            queueSource: ['flac' | 'mp3', 'all' | {
                by: 'album' | 'artist',
                name: string,
            }],
        ) => void) => () => void,
        getQueueAt: () => Promise<[string, number]>,
        changeQueueAt: (changeQueueAtHandler: (
            event: Electron.IpcRendererEvent,
            queueAt: [string, number],
        ) => void) => () => void,
        getProgress: () => Promise<number>,
        updateProgress: (updateProgressHandler: (
            event: Electron.IpcRendererEvent,
            progress: number,
        ) => void) => () => void,
        setProgress: (progress: number) => void,
        getPlayState: () => Promise<boolean>,
        resetPlayState: (resetPlayStateHandler: (
            event: Electron.IpcRendererEvent,
            isPlaying: boolean,
        ) => void) => () => void,
        rescanLibrary: () => void,
        switchSceneMode: () => void,
        openSettingPage: (page?: 'library' | 'mode' | 'other' | 'about') => void,
        playFromHere: (type: 'flac' | 'mp3', group: 'all' | {
            by: 'album' | 'artist',
            name: string,
        }, uuid?: string) => void,
        stopFromHere: () => void,
        requestPreviousTrack: () => void,
        requestNextTrack: () => void,
        switchQueueOrderMode: () => void,
        switchQueueOrderLoop: () => void,
        play: () => void,
        pause: () => void,
        requestShowContent: (content: string) => void,
        cancelShowContent: () => void,
        notifyReady: () => void,
    },
}