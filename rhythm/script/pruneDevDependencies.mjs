import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageJSONPath = join(
    dirname(fileURLToPath(import.meta.url)),
    '../package.json',
)

const packageJSON = JSON.parse(
    readFileSync(packageJSONPath, { encoding: 'utf8' }),
)

if (
    packageJSON instanceof Object &&
    'devDependencies' in packageJSON &&
    packageJSON.devDependencies instanceof Object
) {
    delete packageJSON.devDependencies['better-sqlite3']

    delete packageJSON.devDependencies.bindings

    delete packageJSON.devDependencies['file-uri-to-path']
}

writeFileSync(
    packageJSONPath,
    JSON.stringify(packageJSON, null, 2).replaceAll('\n', '\r\n'),
    { encoding: 'utf8' },
)