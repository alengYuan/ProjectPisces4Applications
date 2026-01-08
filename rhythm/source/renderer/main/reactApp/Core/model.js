import { useCallback, useEffect, useState } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import {
    useCurrentPage,
    currentPageBasicInformationListAtom,
    currentPageBasicInformationListIsLoadingAtom,
    queueSourceBasicInformationListAtom,
} from '../model'
import { atomWrapper, flattenQueueSource } from '../../index'

/**
 * @type {()=>void}
 */
export const useCore = () => {
    const [
        currentPageBasicInformationListHallucinationFuse,
        setCurrentPageBasicInformationListHallucinationFuse,
    ] = useState({})

    const { currentPage } = useCurrentPage()

    const setPageStack = useSetAtom(atomWrapper.pageStack)

    const setCurrentPageBasicInformationList = useSetAtom(
        currentPageBasicInformationListAtom,
    )

    const setCurrentPageBasicInformationListIsLoading = useSetAtom(
        currentPageBasicInformationListIsLoadingAtom,
    )

    const [queueSource, setQueueSource] = useAtom(atomWrapper.queueSource)

    const setQueueSourceBasicInformationList = useSetAtom(
        queueSourceBasicInformationListAtom,
    )

    const setQueueAtIdentification = useSetAtom(
        atomWrapper.queueAtIdentification,
    )

    const setProgress = useSetAtom(atomWrapper.progress)

    const setIsPlaying = useSetAtom(atomWrapper.isPlaying)

    const setLibraryPathIsFilled = useSetAtom(atomWrapper.libraryPathIsFilled)

    const setCurrentModeVolume = useSetAtom(atomWrapper.currentModeVolume)

    const setQueueOrderMode = useSetAtom(atomWrapper.queueOrderMode)

    const setQueueOrderLoop = useSetAtom(atomWrapper.queueOrderLoop)

    const setLibraryGroup = useSetAtom(atomWrapper.libraryGroup)

    const updateCurrentModeVolumeHandler = useCallback(
        /**
         * @type {(
         * event:Electron.IpcRendererEvent,
         * currentModeVolume:number,
         * )=>void}
         */
        (_, currentModeVolume) => {
            setCurrentModeVolume(currentModeVolume)
        },
        [setCurrentModeVolume],
    )

    const changeQueueOrderModeHandler = useCallback(
        /**
         * @type {(
         * event:Electron.IpcRendererEvent,
         * queueOrderMode:'sequential'|'shuffle'|'random',
         * )=>void}
         */
        (_, queueOrderMode) => {
            setQueueOrderMode(queueOrderMode)
        },
        [setQueueOrderMode],
    )

    const changeQueueOrderLoopHandler = useCallback(
        /**
         * @type {(
         * event:Electron.IpcRendererEvent,
         * queueOrderLoop:'all'|'single'|'off',
         * )=>void}
         */
        (_, queueOrderLoop) => {
            setQueueOrderLoop(queueOrderLoop)
        },
        [setQueueOrderLoop],
    )

    const updateQueueSourceHandler = useCallback(
        /**
         * @type {(
         * event:Electron.IpcRendererEvent,
         * queueSource:['flac'|'mp3','all'|{
         * by:'album'|'artist',
         * name:string,
         * }],
         * )=>void}
         */
        (_, queueSource) => {
            setQueueSource(previousValue =>
                flattenQueueSource(queueSource) !==
                flattenQueueSource(previousValue)
                    ? queueSource
                    : previousValue)
        },
        [setQueueSource],
    )

    const changeQueueAtHandler = useCallback(
        /**
         * @type {(
         * event:Electron.IpcRendererEvent,
         * queueAt:[string,number],
         * )=>void}
         */
        (_, queueAt) => {
            setQueueAtIdentification(queueAt[0])
        },
        [setQueueAtIdentification],
    )

    const updateProgressHandler = useCallback(
        /**
         * @type {(
         * event:Electron.IpcRendererEvent,
         * progress:number,
         * )=>void}
         */
        (_, progress) => {
            setProgress(progress)
        },
        [setProgress],
    )

    const resetPlayStateHandler = useCallback(
        /**
         * @type {(
         * event:Electron.IpcRendererEvent,
         * isPlaying:boolean,
         * )=>void}
         */
        (_, isPlaying) => {
            setIsPlaying(isPlaying)
        },
        [setIsPlaying],
    )

    const updateLibraryPathStateHandler = useCallback(
        /**
         * @type {(
         * event:Electron.IpcRendererEvent,
         * libraryPathState:{[type in 'flac'|'mp3']:{
         * isFilled:boolean,
         * }},
         * )=>void}
         */
        (_, libraryPathState) => {
            setLibraryPathIsFilled(previousValue =>
                libraryPathState.flac.isFilled !== previousValue.flac ||
                libraryPathState.mp3.isFilled !== previousValue.mp3
                    ? {
                        flac: libraryPathState.flac.isFilled,
                        mp3: libraryPathState.mp3.isFilled,
                    }
                    : previousValue)
        },
        [setLibraryPathIsFilled],
    )

    const updateLibraryGroupHandler = useCallback(
        /**
         * @type {(
         * event:Electron.IpcRendererEvent,
         * libraryGroup:{[type in 'flac'|'mp3']:{[by in 'album'|'artist']:Array<string>}},
         * )=>void}
         */
        (_, libraryGroup) => {
            setPageStack(previousValue => {
                const filteredPageStack = previousValue.filter(
                    ([, type, group]) =>
                        group === 'all' ||
                        libraryGroup[type][group.by].includes(group.name),
                )

                /**
                 * @type {['flac'|'mp3','all']}
                 */
                const spare = [(previousValue[0] ?? ['', 'flac'])[1], 'all']

                /**
                 * @type {Array<[string,'flac'|'mp3','all'|{
                 * by:'album'|'artist',
                 * name:string,
                 * }]>}
                 */
                const newValue = filteredPageStack.length
                    ? filteredPageStack
                    : [[flattenQueueSource(spare), ...spare]]

                return newValue.length !== previousValue.length ||
                    newValue.some(
                        ([flatQueueSource], index) =>
                            flatQueueSource !== previousValue[index]?.[0],
                    )
                    ? newValue
                    : previousValue
            })

            setLibraryGroup(previousValue => {
                const flacAlbumIsUpdated =
                    libraryGroup.flac.album.length !==
                        previousValue.flac.album.length ||
                    libraryGroup.flac.album.some(
                        (album, index) =>
                            album !== previousValue.flac.album[index],
                    )

                const flacArtistIsUpdated =
                    libraryGroup.flac.artist.length !==
                        previousValue.flac.artist.length ||
                    libraryGroup.flac.artist.some(
                        (artist, index) =>
                            artist !== previousValue.flac.artist[index],
                    )

                const mp3AlbumIsUpdated =
                    libraryGroup.mp3.album.length !==
                        previousValue.mp3.album.length ||
                    libraryGroup.mp3.album.some(
                        (album, index) =>
                            album !== previousValue.mp3.album[index],
                    )

                const mp3ArtistIsUpdated =
                    libraryGroup.mp3.artist.length !==
                        previousValue.mp3.artist.length ||
                    libraryGroup.mp3.artist.some(
                        (artist, index) =>
                            artist !== previousValue.mp3.artist[index],
                    )

                if (
                    flacAlbumIsUpdated &&
                    flacArtistIsUpdated &&
                    mp3AlbumIsUpdated &&
                    mp3ArtistIsUpdated
                ) {
                    return libraryGroup
                }

                if (
                    !flacAlbumIsUpdated &&
                    !flacArtistIsUpdated &&
                    !mp3AlbumIsUpdated &&
                    !mp3ArtistIsUpdated
                ) {
                    return previousValue
                }

                return {
                    flac:
                        !flacAlbumIsUpdated && !flacArtistIsUpdated
                            ? previousValue.flac
                            : {
                                album: flacAlbumIsUpdated
                                    ? libraryGroup.flac.album
                                    : previousValue.flac.album,
                                artist: flacArtistIsUpdated
                                    ? libraryGroup.flac.artist
                                    : previousValue.flac.artist,
                            },
                    mp3:
                        !mp3AlbumIsUpdated && !mp3ArtistIsUpdated
                            ? previousValue.mp3
                            : {
                                album: mp3AlbumIsUpdated
                                    ? libraryGroup.mp3.album
                                    : previousValue.mp3.album,
                                artist: mp3ArtistIsUpdated
                                    ? libraryGroup.mp3.artist
                                    : previousValue.mp3.artist,
                            },
                }
            })
        },
        [setPageStack, setLibraryGroup],
    )

    const refreshCurrentPageBasicInformationListHallucinationFuseHandler =
        useCallback(
            /**
             * @type {()=>void}
             */
            () => {
                setCurrentPageBasicInformationListHallucinationFuse({})
            },
            [],
        )

    useEffect(
        () =>
            window['rhythm::main'].updateCurrentModeVolume(
                updateCurrentModeVolumeHandler,
            ),
        [updateCurrentModeVolumeHandler],
    )

    useEffect(
        () =>
            window['rhythm::main'].changeQueueOrderMode(
                changeQueueOrderModeHandler,
            ),
        [changeQueueOrderModeHandler],
    )

    useEffect(
        () =>
            window['rhythm::main'].changeQueueOrderLoop(
                changeQueueOrderLoopHandler,
            ),
        [changeQueueOrderLoopHandler],
    )

    useEffect(() => {
        const abortController = new AbortController()

        const removeUpdateLibraryDatabaseHandler = window[
            'rhythm::main'
        ].updateLibraryDatabase(async() => {
            setCurrentPageBasicInformationListIsLoading(true)

            const [, type, group] = currentPage

            const basicInformationList = await window[
                'rhythm::main'
            ].getBasicInformationListUnderGroup(type, group)

            if (!abortController.signal.aborted) {
                setCurrentPageBasicInformationList(basicInformationList)

                setCurrentPageBasicInformationListIsLoading(false)
            }
        })

        return () => {
            abortController.abort()

            removeUpdateLibraryDatabaseHandler()
        }
    }, [
        currentPage,
        setCurrentPageBasicInformationList,
        setCurrentPageBasicInformationListIsLoading,
    ])

    useEffect(() => {
        const abortController = new AbortController()

        // eslint-disable-next-line semi-style
        ;(async() => {
            setCurrentPageBasicInformationListIsLoading(true)

            const [, type, group] = currentPage

            const basicInformationList = await window[
                'rhythm::main'
            ].getBasicInformationListUnderGroup(type, group)

            if (!abortController.signal.aborted) {
                setCurrentPageBasicInformationList(basicInformationList)

                setCurrentPageBasicInformationListIsLoading(false)
            }
        })()

        return () => {
            abortController.abort()
        }
    }, [
        currentPageBasicInformationListHallucinationFuse,
        currentPage,
        setCurrentPageBasicInformationList,
        setCurrentPageBasicInformationListIsLoading,
    ])

    useEffect(
        () =>
            window['rhythm::main'].updateQueueSource(updateQueueSourceHandler),
        [updateQueueSourceHandler],
    )

    useEffect(() => {
        const abortController = new AbortController()

        const removeUpdateLibraryDatabaseHandler = window[
            'rhythm::main'
        ].updateLibraryDatabase(async() => {
            const basicInformationList = await window[
                'rhythm::main'
            ].getBasicInformationListUnderGroup(...queueSource)

            !abortController.signal.aborted &&
                setQueueSourceBasicInformationList(basicInformationList)
        })

        return () => {
            abortController.abort()

            removeUpdateLibraryDatabaseHandler()
        }
    }, [queueSource, setQueueSourceBasicInformationList])

    useEffect(() => {
        const abortController = new AbortController()

        // eslint-disable-next-line semi-style
        ;(async() => {
            const basicInformationList = await window[
                'rhythm::main'
            ].getBasicInformationListUnderGroup(...queueSource)

            !abortController.signal.aborted &&
                setQueueSourceBasicInformationList(basicInformationList)
        })()

        return () => {
            abortController.abort()
        }
    }, [queueSource, setQueueSourceBasicInformationList])

    useEffect(
        () =>
            window['rhythm::main'].changeQueueAt(changeQueueAtHandler),
        [changeQueueAtHandler],
    )

    useEffect(
        () =>
            window['rhythm::main'].updateProgress(updateProgressHandler),
        [updateProgressHandler],
    )

    useEffect(
        () =>
            window['rhythm::main'].resetPlayState(resetPlayStateHandler),
        [resetPlayStateHandler],
    )

    useEffect(
        () =>
            window['rhythm::main'].updateLibraryPathState(
                updateLibraryPathStateHandler,
            ),
        [updateLibraryPathStateHandler],
    )

    useEffect(
        () =>
            window['rhythm::main'].updateLibraryGroup(
                updateLibraryGroupHandler,
            ),
        [updateLibraryGroupHandler],
    )

    useEffect(
        () =>
            window['rhythm::main'].updateLibraryGroup(
                refreshCurrentPageBasicInformationListHallucinationFuseHandler,
            ),
        [refreshCurrentPageBasicInformationListHallucinationFuseHandler],
    )
}