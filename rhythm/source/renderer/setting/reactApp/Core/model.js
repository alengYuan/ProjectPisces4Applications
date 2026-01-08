import { useCallback, useEffect } from 'react'
import { useSetAtom } from 'jotai'
import { usePushPageStack, useClearPageStack } from '../model'
import { atomWrapper } from '../../index'

/**
 * @type {()=>void}
 */
export const useCore = () => {
    const { pushPageStack } = usePushPageStack()

    const { clearPageStack } = useClearPageStack()

    const setGeneralTray = useSetAtom(atomWrapper['general.tray'])

    const setLibraryPathFLAC = useSetAtom(atomWrapper['library.path.flac'])

    const setLibraryPathMP3 = useSetAtom(atomWrapper['library.path.mp3'])

    const setModeCandidate = useSetAtom(atomWrapper['mode.candidate'])

    const setOtherRuleArtistSplit = useSetAtom(
        atomWrapper['other.rule.artist.split'],
    )

    const setOtherRuleArtistIdentify = useSetAtom(
        atomWrapper['other.rule.artist.identify'],
    )

    const prePushPageStackHandler = useCallback(
        /**
         * @type {(
         * event:Electron.IpcRendererEvent,
         * page:'library'|'mode'|'other'|'about',
         * )=>void}
         */
        (_, page) => {
            pushPageStack(page)
        },
        [pushPageStack],
    )

    const preClearPageStackHandler = useCallback(
        /**
         * @type {(event:Electron.IpcRendererEvent)=>void}
         */
        () => {
            clearPageStack()

            dispatchEvent(new Event('restore-interface-state'))
        },
        [clearPageStack],
    )

    const updateSettingStorageHandler = useCallback(
        /**
         * @type {(
         * event:Electron.IpcRendererEvent,
         * settingStorageItem:{
         * [key in keyof import("../../index").RewritableSettingStorage]:
         * [key,import("../../index").RewritableSettingStorage[key]]
         * }[keyof import("../../index").RewritableSettingStorage],
         * )=>void}
         */
        (_, [key, value]) => {
            switch (key) {
                case 'general.tray':
                    setGeneralTray(value)

                    break
                case 'library.path.flac':
                    setLibraryPathFLAC(value)

                    break
                case 'library.path.mp3':
                    setLibraryPathMP3(value)

                    break
                case 'mode.candidate':
                    setModeCandidate(value)

                    break
                case 'other.rule.artist.split':
                    setOtherRuleArtistSplit(value)

                    break
                case 'other.rule.artist.identify':
                    setOtherRuleArtistIdentify(value)

                    break
                default:
            }
        },
        [
            setGeneralTray,
            setLibraryPathFLAC,
            setLibraryPathMP3,
            setModeCandidate,
            setOtherRuleArtistSplit,
            setOtherRuleArtistIdentify,
        ],
    )

    useEffect(
        () =>
            window['rhythm::setting'].prePushPageStack(prePushPageStackHandler),
        [prePushPageStackHandler],
    )

    useEffect(
        () =>
            window['rhythm::setting'].preClearPageStack(
                preClearPageStackHandler,
            ),
        [preClearPageStackHandler],
    )

    useEffect(
        () =>
            window['rhythm::setting'].updateSettingStorage(
                updateSettingStorageHandler,
            ),
        [updateSettingStorageHandler],
    )
}