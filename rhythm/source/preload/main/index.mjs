import { contextBridge, ipcRenderer } from 'electron'
import '../util/index.mjs'

contextBridge.exposeInMainWorld('rhythm::main', {
    _self_: 'rhythm::main',
    /**
     * @type {()=>void}
     */
    rebootInCoreMode: () =>
        ipcRenderer.send('rhythm::main::reboot-in-core-mode'),
    /**
     * @type {(focusWindowHandler:(event:Electron.IpcRendererEvent)=>void)=>()=>void}
     */
    focusWindow: focusWindowHandler => {
        ipcRenderer.on('rhythm::main::focus-window', focusWindowHandler)

        return () => {
            ipcRenderer.off('rhythm::main::focus-window', focusWindowHandler)
        }
    },
    /**
     * @type {(blurWindowHandler:(event:Electron.IpcRendererEvent)=>void)=>()=>void}
     */
    blurWindow: blurWindowHandler => {
        ipcRenderer.on('rhythm::main::blur-window', blurWindowHandler)

        return () => {
            ipcRenderer.off('rhythm::main::blur-window', blurWindowHandler)
        }
    },
    /**
     * @type {()=>Promise<string>}
     */
    getCoverRootPath: () =>
        ipcRenderer.invoke('rhythm::main::get-cover-root-path'),
    /**
     * @type {()=>Promise<'en'|'zh'|'ja'>}
     */
    getLanguage: () =>
        ipcRenderer.invoke('rhythm::main::get-language'),
    /**
     * @type {()=>Promise<{[type in 'flac'|'mp3']:{
     * isFilled:boolean,
     * }}>}
     */
    getLibraryPathState: () =>
        ipcRenderer.invoke('rhythm::main::get-library-path-state'),
    /**
     * @type {(updateLibraryPathStateHandler:(
     * event:Electron.IpcRendererEvent,
     * libraryPathState:{[type in 'flac'|'mp3']:{
     * isFilled:boolean,
     * }},
     * )=>void)=>()=>void}
     */
    updateLibraryPathState: updateLibraryPathStateHandler => {
        ipcRenderer.on(
            'rhythm::main::update-library-path-state',
            updateLibraryPathStateHandler,
        )

        return () => {
            ipcRenderer.off(
                'rhythm::main::update-library-path-state',
                updateLibraryPathStateHandler,
            )
        }
    },
    /**
     * @type {()=>Promise<number>}
     */
    getCurrentModeVolume: () =>
        ipcRenderer.invoke('rhythm::main::get-current-mode-volume'),
    /**
     * @type {(updateCurrentModeVolumeHandler:(
     * event:Electron.IpcRendererEvent,
     * currentModeVolume:number,
     * )=>void)=>()=>void}
     */
    updateCurrentModeVolume: updateCurrentModeVolumeHandler => {
        ipcRenderer.on(
            'rhythm::main::update-current-mode-volume',
            updateCurrentModeVolumeHandler,
        )

        return () => {
            ipcRenderer.off(
                'rhythm::main::update-current-mode-volume',
                updateCurrentModeVolumeHandler,
            )
        }
    },
    /**
     * @type {(volume:number)=>void}
     */
    setCurrentModeVolume: volume =>
        ipcRenderer.send('rhythm::main::set-current-mode-volume', volume),
    /**
     * @type {()=>Promise<'sequential'|'shuffle'|'random'>}
     */
    getQueueOrderMode: () =>
        ipcRenderer.invoke('rhythm::main::get-queue-order-mode'),
    /**
     * @type {(changeQueueOrderModeHandler:(
     * event:Electron.IpcRendererEvent,
     * queueOrderMode:'sequential'|'shuffle'|'random',
     * )=>void)=>()=>void}
     */
    changeQueueOrderMode: changeQueueOrderModeHandler => {
        ipcRenderer.on(
            'rhythm::main::change-queue-order-mode',
            changeQueueOrderModeHandler,
        )

        return () => {
            ipcRenderer.off(
                'rhythm::main::change-queue-order-mode',
                changeQueueOrderModeHandler,
            )
        }
    },
    /**
     * @type {()=>Promise<'all'|'single'|'off'>}
     */
    getQueueOrderLoop: () =>
        ipcRenderer.invoke('rhythm::main::get-queue-order-loop'),
    /**
     * @type {(changeQueueOrderLoopHandler:(
     * event:Electron.IpcRendererEvent,
     * queueOrderLoop:'all'|'single'|'off',
     * )=>void)=>()=>void}
     */
    changeQueueOrderLoop: changeQueueOrderLoopHandler => {
        ipcRenderer.on(
            'rhythm::main::change-queue-order-loop',
            changeQueueOrderLoopHandler,
        )

        return () => {
            ipcRenderer.off(
                'rhythm::main::change-queue-order-loop',
                changeQueueOrderLoopHandler,
            )
        }
    },
    /**
     * @type {(updateLibraryDatabaseHandler:(event:Electron.IpcRendererEvent)=>void)=>()=>void}
     */
    updateLibraryDatabase: updateLibraryDatabaseHandler => {
        ipcRenderer.on(
            'rhythm::main::update-library-database',
            updateLibraryDatabaseHandler,
        )

        return () => {
            ipcRenderer.off(
                'rhythm::main::update-library-database',
                updateLibraryDatabaseHandler,
            )
        }
    },
    /**
     * @type {()=>Promise<{[type in 'flac'|'mp3']:{[by in 'album'|'artist']:Array<string>}}>}
     */
    getLibraryGroup: () =>
        ipcRenderer.invoke('rhythm::main::get-library-group'),
    /**
     * @type {(updateLibraryGroupHandler:(
     * event:Electron.IpcRendererEvent,
     * libraryGroup:{[type in 'flac'|'mp3']:{[by in 'album'|'artist']:Array<string>}},
     * )=>void)=>()=>void}
     */
    updateLibraryGroup: updateLibraryGroupHandler => {
        ipcRenderer.on(
            'rhythm::main::update-library-group',
            updateLibraryGroupHandler,
        )

        return () => {
            ipcRenderer.off(
                'rhythm::main::update-library-group',
                updateLibraryGroupHandler,
            )
        }
    },
    /**
     * @type {(type:'flac'|'mp3',group:'all'|{
     * by:'album'|'artist',
     * name:string,
     * })=>Promise<Array<{
     * type:'flac'|'mp3',
     * uuid:string,
     * size:number,
     * modified:number,
     * title:string,
     * artist:string,
     * album:string,
     * length:number,
     * bit:number,
     * depth?:number,
     * sample:number,
     * cover:string,
     * }>>}
     */
    getBasicInformationListUnderGroup: (type, group) =>
        ipcRenderer.invoke(
            'rhythm::main::get-basic-information-list-under-group',
            type,
            group,
        ),
    /**
     * @type {<TYPE extends 'flac'|'mp3'>(type:TYPE,uuid:string)=>Promise<undefined|{
     * flac:{
     * uuid:string,
     * name:string,
     * size:number,
     * modified:number,
     * title:string,
     * artist:string,
     * album:string,
     * length:number,
     * bit:number,
     * depth:number,
     * sample:number,
     * cover:string,
     * record:string,
     * track:string,
     * year:string,
     * genre:string,
     * artists:string,
     * composer:string,
     * lyricist:string,
     * copyright:string,
     * isrc:string,
     * },
     * mp3:{
     * uuid:string,
     * name:string,
     * size:number,
     * modified:number,
     * title:string,
     * artist:string,
     * album:string,
     * length:number,
     * bit:number,
     * sample:number,
     * cover:string,
     * },
     * }[TYPE]>}
     */
    getDetailedInformationWithUUID: (type, uuid) =>
        ipcRenderer.invoke(
            'rhythm::main::get-detailed-information-with-uuid',
            type,
            uuid,
        ),
    /**
     * @type {()=>Promise<['flac'|'mp3','all'|{
     * by:'album'|'artist',
     * name:string,
     * }]>}
     */
    getQueueSource: () =>
        ipcRenderer.invoke('rhythm::main::get-queue-source'),
    /**
     * @type {(updateQueueSourceHandler:(
     * event:Electron.IpcRendererEvent,
     * queueSource:['flac'|'mp3','all'|{
     * by:'album'|'artist',
     * name:string,
     * }],
     * )=>void)=>()=>void}
     */
    updateQueueSource: updateQueueSourceHandler => {
        ipcRenderer.on(
            'rhythm::main::update-queue-source',
            updateQueueSourceHandler,
        )

        return () => {
            ipcRenderer.off(
                'rhythm::main::update-queue-source',
                updateQueueSourceHandler,
            )
        }
    },
    /**
     * @type {()=>Promise<[string,number]>}
     */
    getQueueAt: () =>
        ipcRenderer.invoke('rhythm::main::get-queue-at'),
    /**
     * @type {(changeQueueAtHandler:(
     * event:Electron.IpcRendererEvent,
     * queueAt:[string,number],
     * )=>void)=>()=>void}
     */
    changeQueueAt: changeQueueAtHandler => {
        ipcRenderer.on('rhythm::main::change-queue-at', changeQueueAtHandler)

        return () => {
            ipcRenderer.off(
                'rhythm::main::change-queue-at',
                changeQueueAtHandler,
            )
        }
    },
    /**
     * @type {()=>Promise<number>}
     */
    getProgress: () =>
        ipcRenderer.invoke('rhythm::main::get-progress'),
    /**
     * @type {(updateProgressHandler:(
     * event:Electron.IpcRendererEvent,
     * progress:number,
     * )=>void)=>()=>void}
     */
    updateProgress: updateProgressHandler => {
        ipcRenderer.on('rhythm::main::update-progress', updateProgressHandler)

        return () => {
            ipcRenderer.off(
                'rhythm::main::update-progress',
                updateProgressHandler,
            )
        }
    },
    /**
     * @type {(progress:number)=>void}
     */
    setProgress: progress =>
        ipcRenderer.send('rhythm::main::set-progress', progress),
    /**
     * @type {()=>Promise<boolean>}
     */
    getPlayState: () =>
        ipcRenderer.invoke('rhythm::main::get-play-state'),
    /**
     * @type {(resetPlayStateHandler:(
     * event:Electron.IpcRendererEvent,
     * isPlaying:boolean,
     * )=>void)=>()=>void}
     */
    resetPlayState: resetPlayStateHandler => {
        ipcRenderer.on('rhythm::main::reset-play-state', resetPlayStateHandler)

        return () => {
            ipcRenderer.off(
                'rhythm::main::reset-play-state',
                resetPlayStateHandler,
            )
        }
    },
    /**
     * @type {()=>void}
     */
    rescanLibrary: () =>
        ipcRenderer.send('rhythm::main::rescan-library'),
    /**
     * @type {()=>void}
     */
    switchSceneMode: () =>
        ipcRenderer.send('rhythm::main::switch-scene-mode'),
    /**
     * @type {(page?:'library'|'mode'|'other'|'about')=>void}
     */
    openSettingPage: page =>
        ipcRenderer.send('rhythm::main::open-setting-page', page),
    /**
     * @type {(type:'flac'|'mp3',group:'all'|{
     * by:'album'|'artist',
     * name:string,
     * },uuid?:string)=>void}
     */
    playFromHere: (type, group, uuid) =>
        ipcRenderer.send('rhythm::main::play-from-here', type, group, uuid),
    /**
     * @type {()=>void}
     */
    stopFromHere: () =>
        ipcRenderer.send('rhythm::main::stop-from-here'),
    /**
     * @type {()=>void}
     */
    requestPreviousTrack: () =>
        ipcRenderer.send('rhythm::main::request-previous-track'),
    /**
     * @type {()=>void}
     */
    requestNextTrack: () =>
        ipcRenderer.send('rhythm::main::request-next-track'),
    /**
     * @type {()=>void}
     */
    switchQueueOrderMode: () =>
        ipcRenderer.send('rhythm::main::switch-queue-order-mode'),
    /**
     * @type {()=>void}
     */
    switchQueueOrderLoop: () =>
        ipcRenderer.send('rhythm::main::switch-queue-order-loop'),
    /**
     * @type {()=>void}
     */
    play: () =>
        ipcRenderer.send('rhythm::main::play'),
    /**
     * @type {()=>void}
     */
    pause: () =>
        ipcRenderer.send('rhythm::main::pause'),
    /**
     * @type {(content:string)=>void}
     */
    requestShowContent: content =>
        ipcRenderer.send('rhythm::main::request-show-content', content),
    /**
     * @type {()=>void}
     */
    cancelShowContent: () =>
        ipcRenderer.send('rhythm::main::cancel-show-content'),
    /**
     * @type {()=>void}
     */
    notifyReady: () =>
        ipcRenderer.send('rhythm::interface::notify-ready'),
})