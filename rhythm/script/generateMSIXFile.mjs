import { spawnSync } from 'node:child_process'
import {
    copyFileSync,
    existsSync,
    readFileSync,
    renameSync,
    statSync,
    writeFileSync,
} from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageJSONPath = join(
    dirname(fileURLToPath(import.meta.url)),
    '../package.json',
)

const cacheDirectoryPath = join(
    dirname(fileURLToPath(import.meta.url)),
    '../cache',
)

const wrapperScriptPath = join(cacheDirectoryPath, 'wrapper.ps1')

const configDirectoryPath = join(
    dirname(fileURLToPath(import.meta.url)),
    '../config',
)

const infoConfigPath = join(configDirectoryPath, 'info.json')

const pathConfigPath = join(configDirectoryPath, 'path.json')

const certificateForTestPFXPath = join(
    configDirectoryPath,
    'certificate4test.pfx',
)

const certificateForPublishPFXPath = join(
    configDirectoryPath,
    'certificate4publish.pfx',
)

const releasePackageRootPath = join(
    dirname(fileURLToPath(import.meta.url)),
    '../release/package',
)

const unpackedRootPath = join(releasePackageRootPath, 'rhythm')

const enUSStringResourcePath = join(
    unpackedRootPath,
    'Strings/en-us/Resources.resw',
)

const jaJPStringResourcePath = join(
    unpackedRootPath,
    'Strings/ja-jp/Resources.resw',
)

const zhCNStringResourcePath = join(
    unpackedRootPath,
    'Strings/zh-cn/Resources.resw',
)

const packageManifestPath = join(unpackedRootPath, 'AppxManifest.xml')

const resourceConfigPath = join(unpackedRootPath, 'priconfig.xml')

const resourcePRIPath = join(unpackedRootPath, 'resources.pri')

const appIconPath = join(unpackedRootPath, 'resources/app/source/icon.ico')

const appBinaryOriginPath = join(unpackedRootPath, 'electron.exe')

const appBinaryFormalPath = join(unpackedRootPath, 'rhythm.exe')

const unsignedPackageMSIXPath = join(releasePackageRootPath, 'rhythm.msix')

const signedPackageMSIXPath = join(releasePackageRootPath, 'rhythm.signed.msix')

if (
    !(
        existsSync(infoConfigPath) &&
        statSync(infoConfigPath).isFile() &&
        existsSync(pathConfigPath) &&
        statSync(pathConfigPath).isFile()
    )
) {
    console.error(new Error('Run `batch\\pre` first.'))

    process.exit(1)
}

const packageJSON = JSON.parse(
    readFileSync(packageJSONPath, { encoding: 'utf8' }),
)

const infoConfig = JSON.parse(
    readFileSync(infoConfigPath, { encoding: 'utf8' }),
)

const pathConfig = JSON.parse(
    readFileSync(pathConfigPath, { encoding: 'utf8' }),
)

if (
    !(
        infoConfig instanceof Object &&
        'name' in infoConfig &&
        typeof infoConfig.name === 'string' &&
        infoConfig.name.trim() &&
        'publisher' in infoConfig &&
        typeof infoConfig.publisher === 'string' &&
        infoConfig.publisher.trim() &&
        'organization' in infoConfig &&
        typeof infoConfig.organization === 'string' &&
        infoConfig.organization.trim() &&
        'publisherDisplayName.en' in infoConfig &&
        typeof infoConfig['publisherDisplayName.en'] === 'string' &&
        infoConfig['publisherDisplayName.en'].trim() &&
        'publisherDisplayName.zh' in infoConfig &&
        typeof infoConfig['publisherDisplayName.zh'] === 'string' &&
        infoConfig['publisherDisplayName.zh'].trim() &&
        'publisherDisplayName.ja' in infoConfig &&
        typeof infoConfig['publisherDisplayName.ja'] === 'string' &&
        infoConfig['publisherDisplayName.ja'].trim() &&
        'pfxPassword' in infoConfig &&
        typeof infoConfig.pfxPassword === 'string' &&
        infoConfig.pfxPassword.trim() &&
        pathConfig instanceof Object &&
        'rcedit.exe' in pathConfig &&
        typeof pathConfig['rcedit.exe'] === 'string' &&
        pathConfig['rcedit.exe'].trim() &&
        'makepri.exe' in pathConfig &&
        typeof pathConfig['makepri.exe'] === 'string' &&
        pathConfig['makepri.exe'].trim() &&
        'makeappx.exe' in pathConfig &&
        typeof pathConfig['makeappx.exe'] === 'string' &&
        pathConfig['makeappx.exe'].trim() &&
        'signtool.exe' in pathConfig &&
        typeof pathConfig['signtool.exe'] === 'string' &&
        pathConfig['signtool.exe'].trim()
    )
) {
    console.error(
        new Error('Configure `config/info.json` and `config/path.json` first.'),
    )

    process.exit(1)
}

const version =
    packageJSON instanceof Object &&
    'version' in packageJSON &&
    typeof packageJSON.version === 'string' &&
    packageJSON.version.trim()
        ? packageJSON.version.trim()
        : 'x.x.x'

// eslint-disable-next-line no-lone-blocks
{
    writeFileSync(
        enUSStringResourcePath,
        readFileSync(enUSStringResourcePath, { encoding: 'utf8' })
            // eslint-disable-next-line no-template-curly-in-string
            .replaceAll('${organization}', infoConfig.organization)
            .replaceAll(
                // eslint-disable-next-line no-template-curly-in-string
                '${publisherDisplayName}',
                infoConfig['publisherDisplayName.en'],
            ),
        { encoding: 'utf8' },
    )

    writeFileSync(
        jaJPStringResourcePath,
        readFileSync(jaJPStringResourcePath, { encoding: 'utf8' })
            // eslint-disable-next-line no-template-curly-in-string
            .replaceAll('${organization}', infoConfig.organization)
            .replaceAll(
                // eslint-disable-next-line no-template-curly-in-string
                '${publisherDisplayName}',
                infoConfig['publisherDisplayName.ja'],
            ),
        { encoding: 'utf8' },
    )

    writeFileSync(
        zhCNStringResourcePath,
        readFileSync(zhCNStringResourcePath, { encoding: 'utf8' })
            // eslint-disable-next-line no-template-curly-in-string
            .replaceAll('${organization}', infoConfig.organization)
            .replaceAll(
                // eslint-disable-next-line no-template-curly-in-string
                '${publisherDisplayName}',
                infoConfig['publisherDisplayName.zh'],
            ),
        { encoding: 'utf8' },
    )

    writeFileSync(
        packageManifestPath,
        readFileSync(packageManifestPath, { encoding: 'utf8' })
            // eslint-disable-next-line no-template-curly-in-string
            .replaceAll('${name}', infoConfig.name)
            // eslint-disable-next-line no-template-curly-in-string
            .replaceAll('${publisher}', infoConfig.publisher)
            // eslint-disable-next-line no-template-curly-in-string
            .replaceAll('${version}', version),
        { encoding: 'utf8' },
    )
}

{
    const result = spawnSync(
        pathConfig['rcedit.exe'],
        [
            appBinaryOriginPath,
            '--set-version-string',
            'CompanyName',
            infoConfig.publisher,
            '--set-version-string',
            'FileDescription',
            'Rhythm',
            '--set-version-string',
            'ProductName',
            'Rhythm',
            '--set-version-string',
            'LegalCopyright',
            `Copyright (C) 2026 ${infoConfig.publisher}. All rights reserved.`,
            '--set-version-string',
            'OriginalFilename',
            'rhythm.exe',
            '--set-file-version',
            `${version}.0`,
            '--set-product-version',
            `${version}.0`,
            '--set-icon',
            appIconPath,
        ],
        { stdio: 'inherit' },
    )
    if (result.error || result.status !== 0) {
        console.error(new Error('Failed to run `rcedit.exe`.'))

        process.exit(1)
    }

    renameSync(appBinaryOriginPath, appBinaryFormalPath)
}

{
    const result = spawnSync(
        pathConfig['makepri.exe'],
        [
            'new',
            '/v',
            '/cf',
            resourceConfigPath,
            '/pr',
            unpackedRootPath,
            '/mn',
            packageManifestPath,
            '/o',
            '/of',
            resourcePRIPath,
        ],
        { stdio: 'inherit' },
    )
    if (result.error || result.status !== 0) {
        console.error(new Error('Failed to run `makepri.exe`.'))

        process.exit(1)
    }
}

{
    const result = spawnSync(
        pathConfig['makeappx.exe'],
        ['pack', '/v', '/d', unpackedRootPath, '/p', unsignedPackageMSIXPath],
        { stdio: 'inherit' },
    )
    if (result.error || result.status !== 0) {
        console.error(new Error('Failed to run `makeappx.exe`.'))

        process.exit(1)
    }
}

if (process.argv.includes('--sign')) {
    copyFileSync(unsignedPackageMSIXPath, signedPackageMSIXPath)

    {
        const result = spawnSync(
            pathConfig['signtool.exe'],
            [
                'sign',
                '/v',
                '/f',
                existsSync(certificateForPublishPFXPath) &&
                statSync(certificateForPublishPFXPath).isFile()
                    ? certificateForPublishPFXPath
                    : certificateForTestPFXPath,
                '/p',
                infoConfig.pfxPassword,
                '/fd',
                'SHA256',
                signedPackageMSIXPath,
            ],
            { stdio: 'inherit' },
        )
        if (result.error || result.status !== 0) {
            console.error(new Error('Failed to run `signtool.exe`.'))

            process.exit(1)
        }
    }

    {
        const result = spawnSync(
            'powershell.exe',
            [
                '-NoProfile',
                '-ExecutionPolicy',
                'Bypass',
                '-File',
                wrapperScriptPath,
            ],
            { stdio: 'inherit' },
        )
        if (result.error || result.status !== 0) {
            console.error(new Error('Failed to wrap installer for testing.'))

            process.exit(1)
        }
    }
}