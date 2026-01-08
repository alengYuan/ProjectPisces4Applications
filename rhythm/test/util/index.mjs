import { render as _render } from './renderer.mjs'

export const render = _render

'demo_mode' in process.env &&
    _render([120, 12], {
        init: ({ requestState, requestInput, requestEffect }) => {
            const { position, setPosition } = requestState(
                'position',
                {
                    x: 0,
                    y: 0,
                },
                ({ x, y }) =>
                    `Position(${String.fromCharCode(
                        'a'.charCodeAt(0) + x / 2,
                    )}:${y + 1})`,
            )

            const { frameRate, setFrameRate } = requestState(
                'frameRate',
                NaN,
                frameRate =>
                    isNaN(frameRate) ? '' : `${frameRate}fps`,
            )

            requestInput('w', () => {
                if (position.raw.y > 0) {
                    setPosition({
                        x: position.raw.x,
                        y: position.raw.y - 1,
                    })
                }
            })
                .requestInput('d', () => {
                    if (position.raw.x < 16) {
                        setPosition({
                            x: position.raw.x + 2,
                            y: position.raw.y,
                        })
                    }
                })
                .requestInput('s', () => {
                    if (position.raw.y < 8) {
                        setPosition({
                            x: position.raw.x,
                            y: position.raw.y + 1,
                        })
                    }
                })
                .requestInput('a', () => {
                    if (position.raw.x > 0) {
                        setPosition({
                            x: position.raw.x - 2,
                            y: position.raw.y,
                        })
                    }
                })

            requestEffect(({ delta }) => {
                setFrameRate(1 / delta)
            })

            return {
                frameRate,
                position,
            }
        },
        loop: (
            c,
            { frameCount, state: { frameRate, position } },
            { nc, bc },
        ) => {
            const sprite = c`
<>─∷
::`

            const ground = bc(
                22,
                11,
            )([sprite, position.raw.x + 2, position.raw.y + 1, true])

            const longestLineOfIndicator =
                'Press key "w", "a", "s", "d" to control the sprite,'

            const indicator = c`
${String(position).padStart(
        (longestLineOfIndicator.length + String(position).length) / 2,
    )}



${longestLineOfIndicator}

${'and key "q" to exit.'.padStart(longestLineOfIndicator.length)}`

            const main = nc(24 + (indicator()[0]?.length ?? -2), 11)(
                [ground, 0, 0],
                [indicator, -0, 2],
            )

            const footer = c`${frameRate} · Frame count: ${frameCount}`

            return [
                [main, 0, 0],
                [footer, 0, -0],
            ]
        },
        clean: () => {
            process.stdout.write('This is a message from `clean`.')
        },
    })