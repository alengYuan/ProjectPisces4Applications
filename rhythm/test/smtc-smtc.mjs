import { spawn } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { render } from './util/index.mjs'
import { requestSMTC } from './util/native.mjs'

const partnerServerPath = join(
    dirname(fileURLToPath(import.meta.url)),
    '../script/randomAccessStreamPartner.mjs',
)

const assetImageRootPath = join(
    dirname(fileURLToPath(import.meta.url)),
    '../source/asset/image',
)

const partnerServer = spawn(process.execPath, [partnerServerPath], {
    stdio: 'ignore',
})

const assetImageNameList = readdirSync(assetImageRootPath, {
    withFileTypes: true,
})
    .filter(dirent =>
        dirent.isFile())
    .map(file =>
        file.name)

const smtc = requestSMTC()

render(
    [120, 12],
    {
        init: ({ requestState, requestInput, requestEffect }) => {
            const { activeItemCursorIndex, setActiveItemCursorIndex } =
                requestState('activeItemCursorIndex', 0, index =>
                    [
                        ...[
                            ...Array.from({
                                length: Math.abs(Math.min(0, index - 4)),
                            }).fill(''),
                            ...assetImageNameList
                                .slice(Math.max(0, index - 4), index)
                                .map(assetImageName =>
                                    `  ${assetImageName}`),
                        ],
                        `> ${assetImageNameList[index]}`,
                        ...[
                            ...assetImageNameList
                                .slice(index + 1, index + 5)
                                .map(assetImageName =>
                                    `  ${assetImageName}`),
                            ...Array.from({
                                length:
                                    4 -
                                    Math.min(
                                        4,
                                        assetImageNameList.length - index - 1,
                                    ),
                            }).fill(''),
                        ],
                    ].join('\n'))

            const { speedIndicatorPosition, setSpeedIndicatorPosition } =
                requestState('speedIndicatorPosition', 0, position =>
                    Array.from({ length: 30 })
                        .fill(' ')
                        .toSpliced(position, 1, '*')
                        .join(''))

            const { frameRate, setFrameRate } = requestState(
                'frameRate',
                NaN,
                frameRate =>
                    isNaN(frameRate) ? '' : `${frameRate}fps`,
            )

            const { minFrameRate, setMinFrameRate } = requestState(
                'minFrameRate',
                NaN,
                minFrameRate =>
                    `min: ${isNaN(minFrameRate) ? '???' : `${minFrameRate}fps`}`,
            )

            /**
             * @type {()=>void}
             */
            const updateSMTCMetadata = () => {
                const assetImageName =
                    assetImageNameList[activeItemCursorIndex.raw] ?? ''

                const infoPieceList = (
                    assetImageName || '?title?.?artist?'
                ).split('.')

                const artist = infoPieceList.pop() || '?artist?'

                const title = infoPieceList.join('.') || '?title?'

                smtc.metadata = {
                    title,
                    artist,
                    thumbnail: assetImageName
                        ? `http://localhost:7986/app-asset/image/${assetImageName.replaceAll(
                            '\\',
                            '/',
                        )}`
                        : 'https://slothindie.org/favicon.ico',
                }
            }

            /**
             * @type {()=>void}
             */
            const previousTrackHandler = () => {
                setActiveItemCursorIndex(
                    activeItemCursorIndex.raw === 0
                        ? assetImageNameList.length - 1
                        : activeItemCursorIndex.raw - 1,
                )

                updateSMTCMetadata()
            }

            /**
             * @type {()=>void}
             */
            const nextTrackHandler = () => {
                setActiveItemCursorIndex(
                    activeItemCursorIndex.raw === assetImageNameList.length - 1
                        ? 0
                        : activeItemCursorIndex.raw + 1,
                )

                updateSMTCMetadata()
            }

            requestInput('w', previousTrackHandler).requestInput(
                's',
                nextTrackHandler,
            )

            requestEffect(({ frameCount, delta }) => {
                setSpeedIndicatorPosition(frameCount % 30)

                const frameRate = 1 / delta

                setFrameRate(frameRate)

                if (isNaN(minFrameRate.raw) || frameRate < minFrameRate.raw) {
                    setMinFrameRate(frameRate)
                }
            })

            updateSMTCMetadata()

            smtc.on('play', () => {
                smtc.playbackState = 'playing'
            })

            smtc.on('pause', () => {
                smtc.playbackState = 'paused'
            })

            smtc.on('previous-track', previousTrackHandler)

            smtc.on('next-track', nextTrackHandler)

            smtc.enable()

            return {
                activeItemCursorIndex,
                speedIndicatorPosition,
                frameRate,
                minFrameRate,
            }
        },
        loop: (
            c,
            {
                displaySize,
                state: {
                    activeItemCursorIndex,
                    speedIndicatorPosition,
                    frameRate,
                    minFrameRate,
                },
            },
            { nc, bc },
        ) =>
            [
                [
                    bc(
                        displaySize.width,
                        11,
                    )([
                        nc(
                            displaySize.width - 2,
                            9,
                        )([
                            c`
${activeItemCursorIndex}`,
                            0,
                            0,
                        ]),
                        1,
                        1,
                    ]),
                    0,
                    0,
                ],
                [c`${speedIndicatorPosition}`, 0, -0],
                [c`${frameRate} ${minFrameRate}`, -0, -0],
            ],
        clean: () => {
            process.stdout.write(`smtc.open: ${smtc.open}\n`)

            smtc.close()

            process.stdout.write(`smtc.open: ${smtc.open}`)

            partnerServer.kill()
        },
    },
    true,
)