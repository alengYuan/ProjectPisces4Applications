import { join } from 'node:path'
import { nativeTheme, Notification } from 'electron'
import { NIL as nil } from 'uuid'

/**
 * @type {(
 * type:unknown,
 * group:unknown,
 * availableTypeList:Array<import("../library/index.mjs").Format>,
 * libraryGroup:{[type in import("../library/index.mjs").Format]:{[by in 'album'|'artist']:Array<string>}},
 * )=>[import("../library/index.mjs").Format,'all'|{
 * by:'album'|'artist',
 * name:string,
 * }]}
 */
export const filterValidQueueSource = (
    type,
    group,
    availableTypeList,
    libraryGroup,
) => {
    const newType =
        // prettier-ignore
        typeof type === 'string' &&
        /**
         * @type {Array<string>}
         */
        // eslint-disable-next-line no-extra-parens
        (availableTypeList).includes(type)
            // eslint-disable-next-line no-inline-comments, no-extra-parens
            ? /** @type {import("../library/index.mjs").Format} */ (type)
            : availableTypeList[0] ?? 'flac'

    /**
     * @type {[import("../library/index.mjs").Format,'all'|{
     * by:'album'|'artist',
     * name:string,
     * }]}
     */
    const newQueueSource = [newType, 'all']

    if (
        group instanceof Object &&
        'by' in group &&
        typeof group.by === 'string' &&
        ['album', 'artist'].includes(group.by) &&
        'name' in group &&
        typeof group.name === 'string' &&
        group.name
    ) {
        const newGroup =
            /**
             * @type {{
             * by:'album'|'artist',
             * name:string,
             * }}
             */
            // eslint-disable-next-line no-extra-parens
            (group)

        if (libraryGroup[newType][newGroup.by].includes(group.name)) {
            newQueueSource[1] = newGroup
        }
    }

    return newQueueSource
}

/**
 * @type {(
 * uuid:unknown,
 * progress:unknown,
 * availableUUIDList:Array<string>,
 * queueOrderMode:'sequential'|'shuffle'|'random',
 * getLengthWithUUID:(uuid:string)=>undefined|number,
 * )=>[string,number]}
 */
export const filterValidQueueAt = (
    uuid,
    progress,
    availableUUIDList,
    queueOrderMode,
    getLengthWithUUID,
) => {
    const newUUID =
        typeof uuid === 'string' && availableUUIDList.includes(uuid)
            ? uuid
            : availableUUIDList[
                ['shuffle', 'random'].includes(queueOrderMode)
                    ? Math.floor(Math.random() * availableUUIDList.length)
                    : 0
            ] ?? nil

    const newProgress =
        newUUID === nil || newUUID !== uuid
            ? 0
            : typeof progress === 'number' &&
                !isNaN(progress) &&
                progress >= 0 &&
                progress < Math.floor(getLengthWithUUID(newUUID) ?? 1)
                ? Math.floor(progress)
                : 0

    return [newUUID, newProgress]
}

/**
 * @type {(queueCandidate:Array<string>)=>void}
 */
const shuffleQueueCandidate = queueCandidate => {
    for (
        let currentIndex = queueCandidate.length - 1;
        currentIndex > 0;
        currentIndex -= 1
    ) {
        const randomIndex = Math.floor(Math.random() * (currentIndex + 1))

        // eslint-disable-next-line semi-style
        ;[queueCandidate[currentIndex], queueCandidate[randomIndex]] = [
            /**
             * @type {string}
             */
            // eslint-disable-next-line no-extra-parens
            (queueCandidate[randomIndex]),
            /**
             * @type {string}
             */
            // eslint-disable-next-line no-extra-parens
            (queueCandidate[currentIndex]),
        ]
    }
}

/**
 * @type {(
 * standbyShuffledQueue:unknown,
 * sequentialQueueCandidate:Array<string>,
 * queueAtUUID:string,
 * )=>Array<string>}
 */
export const reshapeQueueCandidateInShuffleOrderMode = (
    standbyShuffledQueue,
    sequentialQueueCandidate,
    queueAtUUID,
) => {
    switch (sequentialQueueCandidate.length) {
        case 0:
        case 1:
            return sequentialQueueCandidate

        case 2:
        case 3: {
            const indexOfQueueCursor =
                sequentialQueueCandidate.indexOf(queueAtUUID)
            if (indexOfQueueCursor < 0) {
                const shuffledQueueCandidate = [...sequentialQueueCandidate]

                shuffleQueueCandidate(shuffledQueueCandidate)

                return shuffledQueueCandidate
            }

            const shuffledQueueCandidateSlice =
                sequentialQueueCandidate.toSpliced(indexOfQueueCursor, 1)

            shuffleQueueCandidate(shuffledQueueCandidateSlice)

            return [queueAtUUID, ...shuffledQueueCandidateSlice]
        }

        default: {
            const reliableQueueCandidateSeed = [
                // prettier-ignore
                ...standbyShuffledQueue instanceof Array &&
                standbyShuffledQueue.length ===
                    sequentialQueueCandidate.length &&
                (() => {
                    const sortedSequentialQueueCandidate =
                        sequentialQueueCandidate.toSorted()

                    return standbyShuffledQueue
                        .toSorted()
                        .every(
                            (uuid, index) =>
                                typeof uuid === 'string' &&
                                uuid === sortedSequentialQueueCandidate[index],
                        )
                })()
                    // eslint-disable-next-line no-inline-comments, no-extra-parens
                    ? /** @type {Array<string>} */ (standbyShuffledQueue)
                    : sequentialQueueCandidate,
            ]

            const indexOfQueueCursor =
                reliableQueueCandidateSeed.indexOf(queueAtUUID)
            if (indexOfQueueCursor < 0) {
                shuffleQueueCandidate(reliableQueueCandidateSeed)

                return reliableQueueCandidateSeed
            }

            const shuffledQueueCandidateMaterial =
                indexOfQueueCursor === reliableQueueCandidateSeed.length - 1
                    ? reliableQueueCandidateSeed
                    : [
                        ...reliableQueueCandidateSeed.slice(
                            indexOfQueueCursor + 1,
                        ),
                        ...reliableQueueCandidateSeed.slice(
                            0,
                            indexOfQueueCursor + 1,
                        ),
                    ]

            shuffledQueueCandidateMaterial.pop()

            const firstBreakpoint = Math.floor(
                shuffledQueueCandidateMaterial.length / 3,
            )
            const secondBreakpoint =
                shuffledQueueCandidateMaterial.length -
                Math.floor(shuffledQueueCandidateMaterial.length / 3)

            const firstShuffledQueueCandidateSlice =
                shuffledQueueCandidateMaterial.slice(0, secondBreakpoint)

            shuffleQueueCandidate(firstShuffledQueueCandidateSlice)

            const secondShuffledQueueCandidateSlice =
                shuffledQueueCandidateMaterial.slice(secondBreakpoint)

            shuffleQueueCandidate(secondShuffledQueueCandidateSlice)

            return [
                queueAtUUID,
                ...firstShuffledQueueCandidateSlice.slice(0, firstBreakpoint),
                ...secondShuffledQueueCandidateSlice,
                ...firstShuffledQueueCandidateSlice.slice(firstBreakpoint),
            ]
        }
    }
}

/**
 * @type {(
 * queueOrderMode:'sequential'|'shuffle'|'random',
 * queueOrderLoop:'all'|'off',
 * indexOfQueueCursor:number,
 * setQueueAt:(uuid:unknown)=>void,
 * candidate:Array<string>,
 * language:'en'|'zh'|'ja',
 * sourceRootPath:string,
 * )=>void}
 */
export const trySwitchToPreviousQueueTarget = (
    queueOrderMode,
    queueOrderLoop,
    indexOfQueueCursor,
    setQueueAt,
    candidate,
    language,
    sourceRootPath,
) => {
    switch (queueOrderMode) {
        case 'sequential':
            switch (queueOrderLoop) {
                case 'all':
                    if (indexOfQueueCursor) {
                        setQueueAt(candidate[indexOfQueueCursor - 1])
                    } else {
                        setQueueAt(candidate[candidate.length - 1])
                    }

                    break
                case 'off':
                    if (indexOfQueueCursor) {
                        setQueueAt(candidate[indexOfQueueCursor - 1])
                    } else {
                        new Notification({
                            title: {
                                en: 'Reached the beginning of the playlist',
                                zh: '已到达播放列表首曲',
                                ja: '再生リストの先頭に到達しました',
                            }[language],
                            body: {
                                en: 'The playback mode is set to sequential, and loop is disabled. Therefore, it is not possible to go back from the first song.',
                                zh: '当前为顺序播放模式，且未开启循环播放。因此，无法从第一首歌曲向前播放。',
                                ja: '現在、順番再生モードが有効で、ループ再生が無効になっています。したがって、最初の曲より前に戻ることはできません。',
                            }[language],
                            silent: true,
                            icon: join(
                                sourceRootPath,
                                `asset/image/theme-${
                                    nativeTheme.shouldUseDarkColors
                                        ? 'dark'
                                        : 'light'
                                }-default-cover.jpg`,
                            ),
                        }).show()
                    }

                    break
                default:
            }

            break
        case 'shuffle':
            new Notification({
                title: {
                    en: 'Can not go back to the previous song',
                    zh: '无法回到上一首曲目',
                    ja: '前の曲に戻れません',
                }[language],
                body: {
                    en: 'The playback mode is set to shuffled, therefore it is not available to go back to the previous song. If needed, please manually select the desired track from the song list to go back.',
                    zh: '当前为乱序播放模式，因此无法回到上一首。如果需要回到之前的歌曲，请在歌曲列表中直接选择并播放。',
                    ja: '現在、乱序再生モードが有効です。したがって、前の曲に戻ることはできません。必要に応じて、曲リストから戻りたい曲を直接選択してください。',
                }[language],
                silent: true,
                icon: join(
                    sourceRootPath,
                    `asset/image/theme-${
                        nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
                    }-default-cover.jpg`,
                ),
            }).show()

            break
        case 'random':
            new Notification({
                title: {
                    en: 'Can not go back to the previous song',
                    zh: '无法回到上一首曲目',
                    ja: '前の曲に戻れません',
                }[language],
                body: {
                    en: 'The playback mode is set to random, therefore it is not available to go back to the previous song. If needed, please manually select the desired track from the song list to go back.',
                    zh: '当前为随机播放模式，因此无法回到上一首。如果需要回到之前的歌曲，请在歌曲列表中直接选择并播放。',
                    ja: '現在、ランダム再生モードが有効です。したがって、前の曲に戻ることはできません。必要に応じて、曲リストから戻りたい曲を直接選択してください。',
                }[language],
                silent: true,
                icon: join(
                    sourceRootPath,
                    `asset/image/theme-${
                        nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
                    }-default-cover.jpg`,
                ),
            }).show()

            break
        default:
    }
}

/**
 * @type {(
 * queueOrderMode:'sequential'|'shuffle'|'random',
 * queueOrderLoop:'all'|'off',
 * setQueueAt:(uuid:unknown)=>void,
 * candidate:Array<string>,
 * indexOfQueueCursor:number,
 * switchToPause:()=>void,
 * reshapeQueueCandidate:(standbyShuffledQueue:unknown)=>Array<string>,
 * )=>void}
 */
export const trySwitchToNextQueueTarget = (
    queueOrderMode,
    queueOrderLoop,
    setQueueAt,
    candidate,
    indexOfQueueCursor,
    switchToPause,
    reshapeQueueCandidate,
) => {
    switch (queueOrderMode) {
        case 'sequential':
            switch (queueOrderLoop) {
                case 'all':
                    setQueueAt(
                        candidate[(indexOfQueueCursor + 1) % candidate.length],
                    )

                    break
                case 'off':
                    if (indexOfQueueCursor + 1 < candidate.length) {
                        setQueueAt(candidate[indexOfQueueCursor + 1])
                    } else {
                        switchToPause()

                        setQueueAt(candidate[0])
                    }

                    break
                default:
            }

            break
        case 'shuffle':
            switch (queueOrderLoop) {
                case 'all':
                    if (indexOfQueueCursor + 1 < candidate.length) {
                        setQueueAt(candidate[indexOfQueueCursor + 1])
                    } else {
                        setQueueAt(reshapeQueueCandidate(candidate)[1])
                    }

                    break
                case 'off':
                    if (indexOfQueueCursor + 1 < candidate.length) {
                        setQueueAt(candidate[indexOfQueueCursor + 1])
                    } else {
                        switchToPause()

                        setQueueAt(
                            candidate[
                                {
                                    2: 0,
                                    3: Math.floor(Math.random() * 2),
                                }[String(candidate.length)] ?? 1
                            ],
                        )

                        reshapeQueueCandidate(candidate)
                    }

                    break
                default:
            }

            break
        case 'random':
            for (;;) {
                const newIndexOfQueueCursor = Math.floor(
                    Math.random() * candidate.length,
                )

                if (
                    newIndexOfQueueCursor !== indexOfQueueCursor ||
                    candidate.length < 2
                ) {
                    setQueueAt(candidate[newIndexOfQueueCursor])

                    break
                }
            }

            break
        default:
    }
}