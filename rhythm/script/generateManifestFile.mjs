import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const originPackageJSONPath = join(
    dirname(fileURLToPath(import.meta.url)),
    '../package.json',
)

const targetPackageJSONPath = join(
    dirname(fileURLToPath(import.meta.url)),
    '../release/resource/package.json',
)

const packageJSON = JSON.parse(
    readFileSync(originPackageJSONPath, { encoding: 'utf8' }),
)

if (packageJSON instanceof Object) {
    packageJSON.main = 'source/main.mjs'

    delete packageJSON.devDependencies

    delete packageJSON.overrides

    packageJSON.dependencies = {
        'better-sqlite3': '11.7.0',
        'bindings': '1.5.0',
        'file-uri-to-path': '1.0.0',
    }
}

writeFileSync(
    targetPackageJSONPath,
    JSON.stringify(packageJSON, null, 2).replaceAll('\n', '\r\n'),
    { encoding: 'utf8' },
)