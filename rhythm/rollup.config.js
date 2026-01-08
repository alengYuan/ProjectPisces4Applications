import { readFileSync } from 'node:fs'
import { builtinModules } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import optimizeLocales from '@react-aria/optimize-locales-plugin'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import swc from '@rollup/plugin-swc'
import terser from '@rollup/plugin-terser'
import { languagePack } from './source/renderer/language.reactARIA.mjs'

const isDevMode = 'dev_mode' in process.env

const mode = isDevMode ? 'development' : 'production'

/**
 * @type {Array<import("rollup").RollupOptions>}
 */
const main = [
    {
        input: join(
            dirname(fileURLToPath(import.meta.url)),
            'source/entry.mjs',
        ),
        output: {
            file: join(
                dirname(fileURLToPath(import.meta.url)),
                'release/resource/source/main.mjs',
            ),
            format: 'esm',
            sourcemap: isDevMode,
        },
        external: [...builtinModules, 'electron', 'better-sqlite3'],
        plugins: [
            json(),
            nodeResolve({
                preferBuiltins: true,
                exportConditions: ['node'],
            }),
            commonjs(),
            replace({
                "'dev_mode' in process.env": String(isDevMode),
                'preventAssignment': false,
                'delimiters': ['', ''],
            }),
            ...isDevMode ? [] : [terser()],
        ],
    },
    {
        input: {
            'metadataParserManager.worker': join(
                dirname(fileURLToPath(import.meta.url)),
                'source/main/library/metadataParserManager.worker.mjs',
            ),
        },
        output: {
            dir: join(
                dirname(fileURLToPath(import.meta.url)),
                'release/resource/source',
            ),
            entryFileNames: '[name].mjs',
            chunkFileNames: '[name].mjs',
            format: 'esm',
            sourcemap: isDevMode,
        },
        external: [...builtinModules],
        plugins: [
            nodeResolve({
                preferBuiltins: true,
                exportConditions: ['node'],
            }),
            commonjs(),
            ...isDevMode ? [] : [terser()],
        ],
    },
]

/**
 * @type {Array<import("rollup").RollupOptions>}
 */
const preload = ['content', 'main', 'setting'].map(
    namespace =>
        /**
         * @type {import("rollup").RollupOptions}
         */
        ({
            input: join(
                dirname(fileURLToPath(import.meta.url)),
                `source/preload/${namespace}/index.mjs`,
            ),
            output: {
                file: join(
                    dirname(fileURLToPath(import.meta.url)),
                    `release/resource/source/preload/${namespace}.mjs`,
                ),
                format: 'esm',
                sourcemap: isDevMode,
            },
            external: [...builtinModules, 'electron'],
            plugins: [
                nodeResolve({
                    preferBuiltins: true,
                }),
                commonjs(),
                replace({
                    "'dev_mode' in process.env": String(isDevMode),
                    'preventAssignment': false,
                    'delimiters': ['', ''],
                }),
                ...isDevMode ? [] : [terser()],
            ],
        }),
)

/**
 * @type {Array<import("rollup").RollupOptions>}
 */
const renderer = [
    {
        input: join(
            dirname(fileURLToPath(import.meta.url)),
            'source/renderer/content/index.js',
        ),
        output: {
            file: join(
                dirname(fileURLToPath(import.meta.url)),
                'release/resource/source/renderer/content.js',
            ),
            format: 'es',
            sourcemap: isDevMode,
        },
        plugins: [nodeResolve(), commonjs(), ...isDevMode ? [] : [terser()]],
    },
    {
        input: join(
            dirname(fileURLToPath(import.meta.url)),
            'source/renderer/main/index.js',
        ),
        output: {
            file: join(
                dirname(fileURLToPath(import.meta.url)),
                'release/resource/source/renderer/main.js',
            ),
            format: 'es',
            sourcemap: isDevMode,
        },
        plugins: [
            nodeResolve(),
            commonjs(),
            replace({
                'process.env.NODE_ENV': `'${mode}'`,
                'preventAssignment': false,
            }),
            optimizeLocales.rollup({
                locales: Object.values(languagePack),
            }),
            swc({
                swc: {
                    jsc: {
                        parser: {
                            syntax: 'ecmascript',
                            jsx: true,
                        },
                        transform: {
                            react: {
                                runtime: 'automatic',
                                importSource: '@emotion/react',
                                development: isDevMode,
                            },
                        },
                        target: 'es2020',
                    },
                },
            }),
            ...isDevMode ? [] : [terser()],
        ],
    },
    {
        input: join(
            dirname(fileURLToPath(import.meta.url)),
            'source/renderer/main/coverCardThemeManager.worker.js',
        ),
        output: {
            file: join(
                dirname(fileURLToPath(import.meta.url)),
                'release/resource/source/renderer/coverCardThemeManager.main.worker.js',
            ),
            format: 'es',
            sourcemap: isDevMode,
        },
        plugins: [nodeResolve(), commonjs(), ...isDevMode ? [] : [terser()]],
    },
    {
        input: join(
            dirname(fileURLToPath(import.meta.url)),
            'source/renderer/setting/index.js',
        ),
        output: {
            file: join(
                dirname(fileURLToPath(import.meta.url)),
                'release/resource/source/renderer/setting.js',
            ),
            format: 'es',
            sourcemap: isDevMode,
        },
        plugins: [
            nodeResolve(),
            commonjs(),
            replace({
                ...(() => {
                    const packageJSONPath = join(
                        dirname(fileURLToPath(import.meta.url)),
                        './package.json',
                    )

                    const configDirectoryPath = join(
                        dirname(fileURLToPath(import.meta.url)),
                        './config',
                    )

                    const infoConfigPath = join(
                        configDirectoryPath,
                        'info.json',
                    )

                    const packageJSON = (() => {
                        try {
                            return JSON.parse(
                                readFileSync(packageJSONPath, {
                                    encoding: 'utf8',
                                }),
                            )
                        } catch (error) {
                            console.error(error)

                            return {}
                        }
                    })()

                    const infoConfig = (() => {
                        try {
                            return JSON.parse(
                                readFileSync(infoConfigPath, {
                                    encoding: 'utf8',
                                }),
                            )
                        } catch (error) {
                            console.error(error)

                            return {}
                        }
                    })()

                    /**
                     * @type {{[key:string]:string}}
                     */
                    const options = {
                        'process.env.META_ORGANIZATION':
                            infoConfig.organization ?? '???',
                        'process.env.META_YEAR': String(
                            new Date().getFullYear(),
                        ),
                        'process.env.META_PUBLISHER_DISPLAY_NAME_EN':
                            infoConfig['publisherDisplayName.en'] ?? '???',
                        'process.env.META_PUBLISHER_DISPLAY_NAME_ZH':
                            infoConfig['publisherDisplayName.zh'] ?? '???',
                        'process.env.META_PUBLISHER_DISPLAY_NAME_JA':
                            infoConfig['publisherDisplayName.ja'] ?? '???',
                        'process.env.META_VERSION':
                            packageJSON.version ?? '?.?.?',
                    }

                    for (const key in options) {
                        options[key] = `"${(options[key] ?? '').replaceAll(
                            '"',
                            '\\"',
                        )}"`
                    }

                    return options
                })(),
                'process.env.NODE_ENV': `'${mode}'`,
                'preventAssignment': false,
            }),
            optimizeLocales.rollup({
                locales: Object.values(languagePack),
            }),
            swc({
                swc: {
                    jsc: {
                        parser: {
                            syntax: 'ecmascript',
                            jsx: true,
                        },
                        transform: {
                            react: {
                                runtime: 'automatic',
                                importSource: '@emotion/react',
                                development: isDevMode,
                            },
                        },
                        target: 'es2020',
                    },
                },
            }),
            ...isDevMode ? [] : [terser()],
        ],
    },
]

/**
 * @type {Array<import("rollup").RollupOptions>}
 */
export default [...main, ...preload, ...renderer]