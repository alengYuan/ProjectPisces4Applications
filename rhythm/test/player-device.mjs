import { render } from './util/index.mjs'
import { requestDeviceList, requestDeviceManager } from './util/native.mjs'

const deviceManager = requestDeviceManager()

render(
    [120, 12],
    {
        init: ({ requestState, requestEffect }) => {
            const { deviceList, setDeviceList } = requestState(
                'deviceList',
                /**
                 * @type {Array<{
                 * id:string,
                 * label:string,
                 * }>}
                 */
                // eslint-disable-next-line no-extra-parens
                ([]),
                deviceList =>
                    deviceList
                        .map(
                            ({ id, label }) =>
                                `# ${label.substring(0, label.indexOf(' ('))}\n└ ${id}`,
                        )
                        .join('\n\n'),
            )

            const { speedIndicatorPosition, setSpeedIndicatorPosition } =
                requestState('speedIndicatorPosition', 0, position =>
                    Array.from({ length: 30 })
                        .fill(' ')
                        .toSpliced(position, 1, '*')
                        .join(''))

            const { changeCount, setChangeCount } = requestState(
                'changeCount',
                0,
            )

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

            requestEffect(({ frameCount, delta }) => {
                setSpeedIndicatorPosition(frameCount % 30)

                const frameRate = 1 / delta

                setFrameRate(frameRate)

                if (isNaN(minFrameRate.raw) || frameRate < minFrameRate.raw) {
                    setMinFrameRate(frameRate)
                }
            })

            deviceManager.on('change', () => {
                setDeviceList(requestDeviceList('active'))

                setChangeCount(changeCount.raw + 1)
            })

            deviceManager.enable()

            return {
                deviceList,
                speedIndicatorPosition,
                changeCount,
                frameRate,
                minFrameRate,
            }
        },
        loop: (
            c,
            {
                displaySize,
                state: {
                    deviceList,
                    speedIndicatorPosition,
                    changeCount,
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
                        displaySize.height - 2,
                    )([
                        nc(
                            displaySize.width - 2,
                            displaySize.height - 4,
                        )([
                            c`
${deviceList}`,
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
                [c`${changeCount}`, 31, -0],
                [c`${frameRate} ${minFrameRate}`, -0, -0],
            ],
        clean: () => {
            process.stdout.write(`deviceManager.open: ${deviceManager.open}\n`)

            deviceManager.close()

            process.stdout.write(`deviceManager.open: ${deviceManager.open}`)
        },
    },
    true,
)