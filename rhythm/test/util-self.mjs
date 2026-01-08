/* eslint-disable no-console */

import {
    tlc,
    standaloneOverwriteTextLineForTest,
    overwriteTextLineColumn,
    c,
} from './util/renderer.mjs'
import {
    registerIsGoingToQuitListener,
    minDisplaySize,
    requestDisplay,
    requestState,
    initStdinDataListener,
    requestInput,
} from './util/state.mjs'

/**
 * @type {<T extends (...args:any)=>any>(
 * fn:T,
 * sampleList:Array<[
 * schrodingerExpect:ReturnType<T>|(()=>ReturnType<T>),
 * ...args:Parameters<T>
 * ]>,
 * )=>Promise<boolean>}
 */
const test = async(fn, sampleList) => {
    console.log(
        `\n\x1b[44m\x1b[37m\x1b[1m${` ${fn.name}`.padEnd(process.stdout.columns)}\x1b[0m`,
    )

    let passCount = 0

    for (const [schrodingerExpect, ...args] of sampleList) {
        const expect =
            // prettier-ignore
            typeof schrodingerExpect === 'function'
                // eslint-disable-next-line no-inline-comments, no-extra-parens
                ? /** @type {()=>ReturnType<typeof fn>} */ (schrodingerExpect)()
                : schrodingerExpect

        const mark = `${JSON.stringify(args, (_, value) => {
            switch (typeof value) {
                case 'bigint':
                    return `bigint:${value}n`
                case 'function':
                    return `function:${value.name}()`
                case 'number': {
                    if (isNaN(value)) {
                        return 'number:NaN'
                    }

                    if (value === Infinity) {
                        return 'number:Infinity'
                    }

                    if (value === -Infinity) {
                        return 'number:-Infinity'
                    }

                    if (value === 0) {
                        return 1 / value > 0 ? value : 'number:-0'
                    }

                    return value
                }
                case 'symbol':
                    return `symbol:${value.description ?? '()'}`
                default:
                    return value
            }
        })}=>${JSON.stringify(expect)}`

        try {
            console.log(
                // eslint-disable-next-line no-loop-func
                `${mark} ${await (async() => {
                    const returns = fn(...args)

                    const isPassed =
                        JSON.stringify(
                            returns instanceof Promise ? await returns : returns,
                        ) === JSON.stringify(expect)

                    if (isPassed) {
                        passCount += 1
                    }

                    return isPassed ? '✅' : '💥'
                })()}`,
            )
        } catch (error) {
            console.log(`${mark} 💥`)

            console.error(error)

            console.log()
        }
    }

    const result = passCount === sampleList.length

    console.log(
        `${
            result ? '\x1b[32m' : '\x1b[41m\x1b[37m'
        }${` ↪ Result: ${result ? 'Passed' : 'Failed'}`.padEnd(
            process.stdout.columns,
        )}\x1b[0m`,
    )

    return result
}

/**
 * @type {(stringList:TemplateStringsArray,...expressionList:Array<any>)=>[
 * stringList:TemplateStringsArray,
 * ...expressionList:Array<any>
 * ]}
 */
const transIntoNormalArgument = (stringList, ...expressionList) =>
    [
        stringList,
        ...expressionList,
    ]

const testForTLCIsPassed = await test(tlc, [
    [[], ...transIntoNormalArgument``],
    [
        [''],
        ...transIntoNormalArgument`
`,
    ],
    [
        [' '],
        ...transIntoNormalArgument`
 `,
    ],
    [
        [' ', ' '],
        ...transIntoNormalArgument` 
`,
    ],
    [
        ['xx', 'yy', '  '],
        ...transIntoNormalArgument`xx
yy
`,
    ],
    [
        ['1  ', '333', '22 '],
        ...transIntoNormalArgument`
1
333
22`,
    ],
    [
        ['true    ', 'arg     ', '0 number', '        '],
        ...transIntoNormalArgument`${true}
arg
${0} number
`,
    ],
])

const testForOverwriteTextLineIsPassed = await test(
    standaloneOverwriteTextLineForTest,
    [
        ['1234efg', 'abcdefg', '1234', 0],
        ['abc1234', 'abcdefg', '1234', -0],
        ['a1234fg', 'abcdefg', '1234', 1],
        ['ab1234g', 'abcdefg', '1234', -1],
        ['ab1234g', 'abcdefg', '1234', 2],
        ['a1234fg', 'abcdefg', '1234', -2],
        ['abcd123', 'abcdefg', '1234', 4],
        ['234defg', 'abcdefg', '1234', -4],
        ['abcde12', 'abcdefg', '1234', 5],
        ['34cdefg', 'abcdefg', '1234', -5],
        ['abcdefg', 'abcdefg', '1234', 7],
        ['abcdefg', 'abcdefg', '1234', -7],
        ['abcdefg', 'abcdefg', '1234', 8],
        ['abcdefg', 'abcdefg', '1234', -8],
        ['abcdefg', 'abcdefg', '1234', 3.14],
        ['abcdefg', 'abcdefg', '1234', -3.14],
        ['abcdefg', 'abcdefg', '1234', NaN],
        ['abcdefg', 'abcdefg', '1234', Infinity],
        ['abcdefg', 'abcdefg', '1234', -Infinity],
        ['', '', '1234', 0],
        ['', '', '1234', -0],
        ['', '', '1234', 1],
        ['', '', '1234', -1],
        ['abcdefg', 'abcdefg', '', 0],
        ['abcdefg', 'abcdefg', '', -0],
        ['abcdefg', 'abcdefg', '', 1],
        ['abcdefg', 'abcdefg', '', -1],
        ['1 3 efg', 'abcdefg', '1 3 ', 0],
        ['abc1 3 ', 'abcdefg', '1 3 ', -0],
        ['a1 3 fg', 'abcdefg', '1 3 ', 1],
        ['ab1 3 g', 'abcdefg', '1 3 ', -1],
        ['1b3defg', 'abcdefg', '1 3 ', 0, true],
        ['abc1e3g', 'abcdefg', '1 3 ', -0, true],
        ['a1c3efg', 'abcdefg', '1 3 ', 1, true],
        ['ab1d3fg', 'abcdefg', '1 3 ', -1, true],
    ],
)

const parentColumn = tlc`
abcdefg
hijklmn
opq rst
uvw xyz
`

const childColumn = tlc`
01234
56789
    #`

testForTLCIsPassed &&
    testForOverwriteTextLineIsPassed &&
    await test(overwriteTextLineColumn, [
        [
            tlc`
01234fg
56789mn
    #st
uvw xyz
`,
            parentColumn,
            childColumn,
            0,
            0,
        ],
        [
            tlc`
abcdefg
hijklmn
01234st
56789yz
    #`,
            parentColumn,
            childColumn,
            0,
            -0,
        ],
        [
            tlc`
abcdefg
hijklmn
op01234
uv56789
      #`,
            parentColumn,
            childColumn,
            -0,
            -0,
        ],
        [
            tlc`
ab01234
hi56789
op    #
uvw xyz
`,
            parentColumn,
            childColumn,
            -0,
            0,
        ],
        [
            tlc`
abcdefg
h01234n
o56789t
u    #z
`,
            parentColumn,
            childColumn,
            1,
            1,
        ],
        [
            tlc`
abcdefg
h01234n
o56789t
u    #z
`,
            parentColumn,
            childColumn,
            -1,
            -1,
        ],
        [
            tlc`
abcdefg
hijklmn
op01234
uv56789
      #`,
            parentColumn,
            childColumn,
            2,
            2,
        ],
        [
            tlc`
01234fg
56789mn
    #st
uvw xyz
`,
            parentColumn,
            childColumn,
            -2,
            -2,
        ],
        [
            tlc`
abcdefg
hijklmn
opq rst
uvw0123
   5678`,
            parentColumn,
            childColumn,
            3,
            3,
        ],
        [
            tlc`
6789efg
   #lmn
opq rst
uvw xyz
`,
            parentColumn,
            childColumn,
            -3,
            -3,
        ],
        [
            tlc`
abcdefg
hijklmn
opq rst
uvw xyz
    012`,
            parentColumn,
            childColumn,
            4,
            4,
        ],
        [
            tlc`
  #defg
hijklmn
opq rst
uvw xyz
`,
            parentColumn,
            childColumn,
            -4,
            -4,
        ],
        [parentColumn, parentColumn, childColumn, 7, 7],
        [parentColumn, parentColumn, childColumn, -7, -7],
        [parentColumn, parentColumn, childColumn, 8, 8],
        [parentColumn, parentColumn, childColumn, -8, -8],
        [parentColumn, parentColumn, childColumn, 0, 3.14],
        [parentColumn, parentColumn, childColumn, 0, -3.14],
        [parentColumn, parentColumn, childColumn, 0, NaN],
        [parentColumn, parentColumn, childColumn, 0, Infinity],
        [parentColumn, parentColumn, childColumn, 0, -Infinity],
        [
            tlc`
01234fg
56789mn
opq #st
uvw xyz
`,
            parentColumn,
            childColumn,
            0,
            0,
            true,
        ],
        [
            tlc`
abcdefg
hijklmn
op01234
uv56789
      #`,
            parentColumn,
            childColumn,
            -0,
            -0,
            true,
        ],
        [
            tlc`
abcdefg
h01234n
o56789t
uvw x#z
`,
            parentColumn,
            childColumn,
            1,
            1,
            true,
        ],
        [
            tlc`
abcdefg
h01234n
o56789t
uvw x#z
`,
            parentColumn,
            childColumn,
            -1,
            -1,
            true,
        ],
        [
            tlc`
abcdefg
hijklmn
opq rst
uvw0123
   5678`,
            parentColumn,
            childColumn,
            3,
            3,
            true,
        ],
        [
            tlc`
abc5678
hijklmn
opq rst
uvw xyz
`,
            parentColumn,
            childColumn,
            3,
            -3,
            true,
        ],
        [
            tlc`
6789efg
hij#lmn
opq rst
uvw xyz
`,
            parentColumn,
            childColumn,
            -3,
            -3,
            true,
        ],
        [
            tlc`
abcdefg
hijklmn
opq rst
1234xyz
6789`,
            parentColumn,
            childColumn,
            -3,
            3,
            true,
        ],
    ])

const defaultMinDisplaySize = {
    ...minDisplaySize,
}

/**
 * @type {(width:number,height:number,result:{
 * width:number,
 * height:number,
 * })=>[
 * ()=>{
 * width:number,
 * height:number,
 * },
 * number,
 * number,
 * ]}
 */
const buildTestSampleForRequestDisplay = (width, height, result) =>
    [
        () => {
            requestDisplay({
                width,
                height,
            })

            return result
        },
        width,
        height,
    ]

await test(
    /**
     * @type {(width:number,height:number)=>{
     * width:number,
     * height:number,
     * }}
     */
    // eslint-disable-next-line func-names, prefer-arrow-callback
    function requestDisplay(_width, _height) {
        return minDisplaySize
    },
    [
        [defaultMinDisplaySize, 80, 12],
        buildTestSampleForRequestDisplay(NaN, 12, defaultMinDisplaySize),
        buildTestSampleForRequestDisplay(Infinity, 12, defaultMinDisplaySize),
        buildTestSampleForRequestDisplay(-Infinity, 12, defaultMinDisplaySize),
        buildTestSampleForRequestDisplay(3.14, 12, defaultMinDisplaySize),
        buildTestSampleForRequestDisplay(0, 12, defaultMinDisplaySize),
        buildTestSampleForRequestDisplay(-1, 12, defaultMinDisplaySize),
        buildTestSampleForRequestDisplay(80, NaN, defaultMinDisplaySize),
        buildTestSampleForRequestDisplay(80, Infinity, defaultMinDisplaySize),
        buildTestSampleForRequestDisplay(80, -Infinity, defaultMinDisplaySize),
        buildTestSampleForRequestDisplay(80, 3.14, defaultMinDisplaySize),
        buildTestSampleForRequestDisplay(80, 0, defaultMinDisplaySize),
        buildTestSampleForRequestDisplay(80, -1, defaultMinDisplaySize),
        buildTestSampleForRequestDisplay(20, 12, {
            width: 20,
            height: 12,
        }),
        buildTestSampleForRequestDisplay(20, 40, {
            width: 20,
            height: 40,
        }),
        buildTestSampleForRequestDisplay(120, 80, {
            width: 120,
            height: 80,
        }),
        buildTestSampleForRequestDisplay(NaN, NaN, {
            width: 120,
            height: 80,
        }),
    ],
)

const { simpleValue, setSimpleValue } = requestState('simpleValue', true)

const initialComplexValueB = new Set(['2', '3'])

const { complexValue, setComplexValue } = requestState(
    'complexValue',
    {
        a: '1',
        b: initialComplexValueB,
    },
    state =>
        `${state.a}${[...state.b].join('')}`,
)

const newComplexValueB = new Set(['b', 'c'])

await test(
    /**
     * @type {(value:import("./util/state.mjs").State<any>)=>string}
     */
    // eslint-disable-next-line func-names, prefer-arrow-callback
    function requestState(value) {
        return String(value)
    },
    [
        ['true', simpleValue],
        ['123', complexValue],
        [
            () => {
                initialComplexValueB.clear()

                initialComplexValueB.add('?')

                return '123'
            },
            complexValue,
        ],
        [
            () => {
                setSimpleValue(false)

                return 'false'
            },
            simpleValue,
        ],
        [
            () => {
                setComplexValue({
                    a: 'a',
                    b: newComplexValueB,
                })

                return 'abc'
            },
            complexValue,
        ],
        [
            () => {
                newComplexValueB.clear()

                newComplexValueB.add('?')

                return 'abc'
            },
            complexValue,
        ],
    ],
)

registerIsGoingToQuitListener(() => {
    process.exit(0)
})

initStdinDataListener()

requestInput('0', () => {
    console.log('\n〇')
})
    .requestInput('w', () => {
        console.log('\n↑')
    })
    .requestInput('d', () => {
        console.log('\n→')
    })
    .requestInput('s', () => {
        console.log('\n↓')
    })
    .requestInput('a', () => {
        console.log('\n←')
    })

// prettier-ignore
{
    const x = c`${Array.from({ length: 9 }).fill('⭕'.repeat(9))
        .join('\n')}`(
        [c`
🟠🟠🟠🟠
🟠🟠🟠🟠
🟠🟠🟠🟠
🟠🟠🟠`(
            [c`
🟨🟨🟨
🟨 🟨
🟨🟨🟨`, -2, -2, true],
        ), 0, 0, true],
        [c`
🟡🟡🟡🟡
🟡🟡🟡🟡
🟡🟡🟡🟡
 🟡🟡🟡`(
            [c`
🟩🟩🟩
🟩 🟩
🟩🟩🟩`, 2, -2, true],
        ), -0, 0, true],
        [c`
 🟢🟢🟢
🟢🟢🟢🟢
🟢🟢🟢🟢
🟢🟢🟢🟢`(
            [c`
🟦🟦🟦
🟦 🟦
🟦🟦🟦`, 2, 2, true],
        ), -0, -0, true],
        [c`
🔵🔵🔵
🔵🔵🔵🔵
🔵🔵🔵🔵
🔵🔵🔵🔵`(
            [c`
🟧🟧🟧
🟧 🟧
🟧🟧🟧`, -2, 2, true],
        ), 0, -0, true],
        [c`
🌏`, 4, 4],
    )

    console.log(`\n${x.join('\n')}`)
}

console.log('\nPress key "q" to exit.')