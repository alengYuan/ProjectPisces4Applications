import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs'
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

const blitheInstallerScriptPath = join(
    cacheDirectoryPath,
    'blitheInstaller.ps1',
)

const wrapperScriptPath = join(cacheDirectoryPath, 'wrapper.ps1')

const configDirectoryPath = join(
    dirname(fileURLToPath(import.meta.url)),
    '../config',
)

const infoConfigPath = join(configDirectoryPath, 'info.json')

if (!(existsSync(infoConfigPath) && statSync(infoConfigPath).isFile())) {
    console.error(new Error('Run `batch\\pre` first.'))

    process.exit(1)
}

const packageJSON = JSON.parse(
    readFileSync(packageJSONPath, { encoding: 'utf8' }),
)

const infoConfig = JSON.parse(
    readFileSync(infoConfigPath, { encoding: 'utf8' }),
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
        infoConfig.pfxPassword.trim()
    )
) {
    console.error(new Error('Configure `config/info.json` first.'))

    process.exit(1)
}

const version =
    packageJSON instanceof Object &&
    'version' in packageJSON &&
    typeof packageJSON.version === 'string' &&
    packageJSON.version.trim()
        ? packageJSON.version.trim()
        : 'x.x.x'

writeFileSync(
    blitheInstallerScriptPath,
    readFileSync(blitheInstallerScriptPath, { encoding: 'utf8' })
        // eslint-disable-next-line no-template-curly-in-string
        .replaceAll('${name}', infoConfig.name)
        // eslint-disable-next-line no-template-curly-in-string
        .replaceAll('${version}', version),
    { encoding: 'utf8' },
)

writeFileSync(
    wrapperScriptPath,
    readFileSync(wrapperScriptPath, { encoding: 'utf8' })
        // eslint-disable-next-line no-template-curly-in-string
        .replaceAll('${publisher}', infoConfig.publisher)
        // eslint-disable-next-line no-template-curly-in-string
        .replaceAll('${version}', version),
    { encoding: 'utf8' },
)