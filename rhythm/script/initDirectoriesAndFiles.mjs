import { existsSync, mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { v4 as uuid } from 'uuid'

const projectRootPath = join(dirname(fileURLToPath(import.meta.url)), '..')

const directoryList = [
    'cache',
    'config',
    'module',
    'release/package',
    'release/resource',
]

const fileList = {
    'config/info.json': JSON.stringify(
        {
            'name': uuid().toLocaleUpperCase(),
            'publisher': '',
            'organization': '',
            'publisherDisplayName.en': '',
            'publisherDisplayName.zh': '',
            'publisherDisplayName.ja': '',
            'pfxPassword': '',
        },
        null,
        4,
    ).replaceAll('\n', '\r\n'),
    'config/path.json': JSON.stringify(
        {
            'MakeCert.exe': '',
            'pvk2pfx.exe': '',
            'rcedit.exe': '',
            'makepri.exe': '',
            'makeappx.exe': '',
            'signtool.exe': '',
        },
        null,
        4,
    ).replaceAll('\n', '\r\n'),
}

for (const directory of directoryList) {
    const path = join(projectRootPath, directory)
    if (!existsSync(path) || statSync(path).isFile()) {
        rmSync(path, {
            force: true,
            recursive: true,
        })

        mkdirSync(path, { recursive: true })
    }
}

for (const [file, data] of Object.entries(fileList)) {
    const path = join(projectRootPath, file)
    if (!existsSync(path) || statSync(path).isDirectory()) {
        rmSync(path, {
            force: true,
            recursive: true,
        })

        writeFileSync(path, data, { encoding: 'utf8' })
    }
}